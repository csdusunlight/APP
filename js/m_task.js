var task = [];
var TASK_URL = 'http://m.wafuli.cn/app/Task/'; 
(function($, task, websql) {
//	var TIME_UPDATE = 'TIME_UPDATE';
//	var TIME_PUBDATE = 'TIME_PUBDATE';

	var PAGE_SIZE = 10;
	var MAX_INTEGER = Number.MAX_VALUE;

	var REGEX_SRC = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;

	var IMAGE_DOWNLOAD = "IMAGE_DOWNLOAD";
	var IMAGE_DOWNLOAD_WHEN_WIFI = "true";
	var DIR_IMAGE = "_doc/image/task/";


	var SQL_SELECT_TASK= 'SELECT id,title,pubDate,image,source,time,view,type FROM wa_task pubDate < ? ORDER BY pubDate DESC LIMIT ?;';
	var SQL_INSERT_TASK = 'INSERT INTO task_Task(id,title,pubDate,image,source,time,view,type) VALUES(?,?,?,?,?,?,?,?,?,?,?);';
	var SQL_SELECT_TASK_DETAIL = 'SELECT * FROM wa_task WHERE id = ? LIMIT 1;';
	var SQL_UPDATE_TASK = 'UPDATE wa_task SET image = ? WHERE id = ?';
	var SQL_DELETE_TASK = 'DELETE FROM wa_task';
	
	task.format = function(milliseconds) {
		var date = new Date(milliseconds);
		var _format = function(number) {
			return (number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDay()) + '-' + _format(date.getHours()) + ':' + _format(date.getMinutes());
	};
	task.dbReady = function(successCallback, errorCallback) {
		html5sql.openDatabase("wafuli", "wafuli", 5 * 1024 * 1024);
		var interval = setInterval(function () {
			if(html5sql.database.version !== ''){
				clearInterval(interval);
				successCallback();
			}
		},200);
	};
	task.toggleDownloadWhenWifi = function(whenWifi) {
		if (whenWifi) {
			localStorage.setItem(IMAGE_DOWNLOAD, IMAGE_DOWNLOAD_WHEN_WIFI);
		} else {
			localStorage.removeItem(IMAGE_DOWNLOAD);
		}
	};
	task.isDownloadWhenWifi = function() {
		return !!localStorage.getItem(IMAGE_DOWNLOAD);
	};
	task.isDownloadImage = function() {
		var currentType = plus.networkinfo.getCurrentType();
		if (currentType === plus.networkinfo.CONNECTION_NONE) {
			return false;
		} else if (currentType !== plus.networkinfo.CONNECTION_WIFI) {
			if (localStorage.getItem(IMAGE_DOWNLOAD)) {
				return false;
			}
		}
		return true;
	};

	task.isDownloadImageAsync = function(callback) {
		callback = callback || mui.noop;
		mui.plusReady(function() {
			var currentType = plus.networkinfo.getCurrentType();
			if (currentType === plus.networkinfo.CONNECTION_NONE) {
				callback(false);
			} else if (currentType !== plus.networkinfo.CONNECTION_WIFI) {
				if (localStorage.getItem(IMAGE_DOWNLOAD)) {
					callback(false);
				}
			}
			callback(true);
		});
	};

	task.clearCache = function() {
		plus.nativeUI.showtaskiting('正在删除缓存...');
		task.deleteTask();
			//清除图片缓存
		plus.io.resolveLocalFileSystemURL(DIR_IMAGE, function(entry) {
			entry.removeRecursively(function() {
				plus.nativeUI.closetaskiting();
				plus.nativeUI.toast("缓存删除成功");
			}, function() {
				plus.nativeUI.closetaskiting();
			});
		}, function(e) {
			plus.nativeUI.closetaskiting();
		});
		//通知首页重新拉取最新
		localStorage.removeItem(TIME_UPDATE); //移除上次更新时间
		localStorage.removeItem(LAST_PUBDATE);
//			plus.webview.getWebviewById("Task").evalJS('getFeed("true")');
	};
	task.downloadImage = function(name, imgUrl, successCallback, errorCallback) {
		var url = DIR_IMAGE + name + ".png";
		return plus.downloader.createDownload(imgUrl, {
			filename: url
		}, function(download, status) {
			if (status != '200') {
				return successCallback(null);
			}
			successCallback(download.filename);
		});
	};
	
	/**
	 * 通过网络获取福利（新闻）数据
	 * @param {Function} successCallback
	 * @param {Function} errorCallback
	 */
	task.getFeed = function(successCallback, errorCallback) {
		//若没有网络，则显示之前缓存数据，并给与提示
		if (plus.networkinfo.getCurrentType() === plus.networkinfo.CONNECTION_NONE) {
			plus.nativeUI.toast('似乎已断开与互联网的连接', {
				verticalAlign: 'top'
			});
			errorCallback(false);
			return;
		}
		//		//避免频繁刷新，默认最短刷新间隔为10分钟
		//		var update = parseFloat(localStorage.getItem(TIME_UPDATE));
		//		if (update && (update + TIME_INTERVAL) > Date.parse(new Date())) {
		//			successCallback(false);
		//			return;
		//		}
		task.clearCache();
		var comp1 = false, comp2 = false, comp3 = false, ret = true;
		$.getTask(Task_URL + '?lastDate=' + latestPubDate, function(items) {
			if (items && items.length>0) {
				var Task = [];
				$.each(items, function(index, item) {
					Task.push([item.id, item.title, item.mark1, item.mark2, item.mark3, item.pubDate,
						item.image, item.source, item.time, item.view, item.type]);
				});
				task.deleteTask();
				task.addTask(Task, function() {
					comp1 = true;
					console.log("获得初始信息完成1");
					if ( comp1 && comp2 &&comp3){
						console.log("获得初始信息完成1");
						if (ret){
							localStorage.setItem(TIME_UPDATE, Date.parse(new Date()) + ''); //本地更新时间
							successCallback(false);
						}else{
							errorCallback();
						}
					}
				}, function() {
					console.log("获得初始信息失败11");
					ret = false;
					comp1 = true;
					if ( comp1 && comp2 &&comp3){
						console.log("获得初始信息失败11");
						errorCallback();
					}			
				});
				
			}
		}, function(xhr) {
			ret = false;
			comp1 = true;
			console.log("获得初始信息失败12");
			if ( comp1 && comp2 &&comp3){
				console.log("获得初始信息失败12");
				errorCallback();
			}
		});
		$.getSlider(SLIDER_URL, function(items) {
			if (items) {
				var Task = [];
				$.each(items, function(index, item) {
					Task.push([item.id, item.image, item.priority, item.pubDate]);
				});
				task.deleteSlider();
				task.addSlider(Task, function() {
					comp2 = true;
					console.log("获得初始信息完成2");
					if ( comp1 && comp2 &&comp3){
						console.log("获得初始信息完成2");
						if (ret){
							localStorage.setItem(TIME_UPDATE, Date.parse(new Date()) + ''); //本地更新时间
							successCallback(false);
						}else{
							errorCallback();
						}
					}
				}, function() {
					console.log("获得初始信息失败21");
					ret = false;
					comp2 = true;
					if ( comp1 && comp2 &&comp3){
						console.log("获得初始信息失败21");
						errorCallback();
					}			
				});
			}
		}, function(xhr) {
			ret = false;
			comp2 = true;
			console.log("获得初始信息失败22");
			if ( comp1 && comp2 &&comp3){
				console.log("获得初始信息失败22");
				errorCallback();
			}
		});
		$.getRecom(RECOM_URL, function(items) {
			if (items) {
				var Task = [];
				$.each(items, function(index, item) {
					Task.push([item.id, item.image, item.location]);
				});
				task.deleteRecom();
				task.addRecom(Task, function() {
					comp3 = true;
					console.log("获得初始信息完成3");
					if ( comp1 && comp2 &&comp3){
						console.log("获得初始信息完成3");
						if (ret){
							localStorage.setItem(TIME_UPDATE, Date.parse(new Date()) + ''); //本地更新时间
							successCallback(false);
						}else{
							errorCallback();
						}
					}
				}, function() {
					console.log("获得初始信息失败31");
					ret = false;
					comp3 = true;
					if ( comp1 && comp2 &&comp3){
						console.log("获得初始信息失败31");
						errorCallback();
					}			
				});
			}
		}, function(xhr) {
			ret = false;
			comp3 = true;
			console.log("获得初始信息失败32");
			if ( comp1 && comp2 &&comp3){
				console.log("获得初始信息失败32");
				errorCallback();
			}
		});
	}
	task.getTaskByid = function(id, successCallback, errorCallback) {
		websql.process([{
			"sql": SQL_SELECT_TASK_DETAIL,
			"data": [id]
		}], function(tx, results) {
			successCallback(results.rows.length > 0 && results.rows.item(0));
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	task.getTask = function(latestId, pageSize, successCallback, errorCallback) {
		if (typeof latestId === 'function') {
			successCallback = latestId;
			latestId = MAX_INTEGER;
			pageSize = PAGE_SIZE;
		} else if (typeof pageSize === 'function') {
			successCallback = pageSize;
			latestId = latestId || MAX_INTEGER;
			pageSize = PAGE_SIZE;
		} else {
			latestId = latestId || MAX_INTEGER;
			pageSize = pageSize || PAGE_SIZE;
		}
		websql.process([{
			"sql": SQL_SELECT_TASK,
			"data": [latestId, pageSize]
		}], function(tx, results) {
			successCallback(results.rows);
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	task.addTask = function(task, successCallback, errorCallback) {
		var sqls = [];
		$.each(task, function(index, item) {
			sqls.push({
				"sql": SQL_INSERT_TASK,
				"data": item
			})
		});
		websql.process(sqls, function(tx, results) {
			successCallback(true);
		}, function(error, failingQuery) {
			console.log(error.message);console.log(failingQuery);
			errorCallback && errorCallback(error, failingQuery);
		});

	};
	task.updateTask = function(id, image, successCallback, errorCallback) {
		websql.process([{
			"sql": SQL_UPDATE_TASK,
			"data": [image, id],
		}], function(tx, results) {
			successCallback && successCallback();
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	task.deleteTask = function(successCallback, errorCallback) {
		websql.process(SQL_DELETE_TASK, function(tx, results) {
			successCallback && successCallback();
		}, function(error, failingQuery) {
			console.log(error.message);
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	
})(mui, task, html5sql);