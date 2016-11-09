var wa = [];
var SLIDER_URL = 'http://m.wafuli.cn/app/slider/';
var RECOM_URL = 'http://m.wafuli.cn/app/recom/';
var NEWS_URL = 'http://m.wafuli.cn/app/news/'; 
(function($, wa, websql) {

	var DB_VERSION_NUMBER = '1.0';
	var TIME_UPDATE = 'TIME_UPDATE';
	var TIME_PUBDATE = 'TIME_PUBDATE';
	var TIME_UPDATE_SLIDER = 'TIME_UPDATE_SLIDER';
	var LAST_PUBDATE = "LAST_PUBDATE";
	var TIME_INTERVAL = 1000 * 60 * 10; //更新间隔(默认十分钟)
	var TIME_INTERVAL_SLIDER = 1000 * 60 * 60; //更新间隔(默认一小时)

	var SLIDER_id = 'SLIDER_id';


	var PAGE_SIZE = 10;
	var MAX_INTEGER = Number.MAX_VALUE;

	var REGEX_SRC = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;

	var IMAGE_DOWNLOAD = "IMAGE_DOWNLOAD";
	var IMAGE_DOWNLOAD_WHEN_WIFI = "true";
	var DIR_IMAGE = "_doc/image/news/";


	var SQL_TABLE = 'DROP TABLE IF EXISTS wa_news;DROP TABLE IF EXISTS wa_slider;DROP TABLE IF EXISTS wa_recom;' + 
		'CREATE TABLE wa_news (id INTEGER PRIMARY KEY, title TEXT,mark1 TEXT,mark2 TEXT,mark3 TEXT,image TEXT,pubDate INTEGER,source TEXT, time TEXT, view INTEGER, type TEXT);' + 
		'CREATE TABLE wa_slider (id INTEGER PRIMARY KEY, image TEXT,priority INTEGER, pubDate INTEGER);' +
		'CREATE TABLE wa_recom (id INTEGER PRIMARY KEY, image TEXT, location INTEGER UNIQUE);';
	var SQL_SELECT_NEWS= 'SELECT id,title,mark1,mark2,mark3,pubDate,image,source,time,view,type FROM wa_news WHERE pubDate < ? ORDER BY pubDate DESC LIMIT ?;';
	var SQL_INSERT_NEWS = 'INSERT INTO wa_news(id,title,mark1,mark2,mark3,pubDate,image,source,time,view,type) VALUES(?,?,?,?,?,?,?,?,?,?,?);';
	var SQL_SELECT_NEWS_DETAIL = 'SELECT * FROM wa_news WHERE id = ? LIMIT 1;';
	var SQL_UPDATE_NEWS = 'UPDATE wa_news SET image = ? WHERE id = ?';
	var SQL_DELETE_NEWS = 'DELETE FROM wa_news';
	
	var SQL_SELECT_SLIDER= 'SELECT id,image,priority,pubDate FROM wa_slider ORDER BY priority DESC, pubDate DESC LIMIT 5;';
	var SQL_INSERT_SLIDER = 'INSERT INTO wa_slider(id,image,priority,pubDate) VALUES(?,?,?,?);';
	var SQL_SELECT_SLIDER_DETAIL = 'SELECT * FROM wa_slider WHERE id = ? LIMIT 1;';
	var SQL_UPDATE_SLIDER = 'UPDATE wa_slider SET image = ? WHERE id = ?';
	var SQL_DELETE_SLIDER = 'DELETE FROM wa_slider';
	
	var SQL_SELECT_RECOM = 'SELECT id,image,location FROM wa_recom ORDER BY location LIMIT 3;';
	var SQL_INSERT_RECOM = 'INSERT INTO wa_recom(id,image,location) VALUES(?,?,?);';
	var SQL_SELECT_RECOM_DETAIL = 'SELECT * FROM wa_recom WHERE id = ? LIMIT 1;';
	var SQL_UPDATE_RECOM = 'UPDATE wa_recom SET image = ? WHERE id = ?';
	var SQL_DELETE_RECOM = 'DELETE FROM wa_recom';
	
	wa.format = function(milliseconds) {
		var date = new Date(milliseconds);
		var _format = function(number) {
			return (number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDay()) + '-' + _format(date.getHours()) + ':' + _format(date.getMinutes());
	};
	wa.dbReady = function(successCallback, errorCallback) {
		html5sql.openDatabase("wafuli6", "wafuli", 5 * 1024 * 1024);
		if (html5sql.database.version === '') {
			html5sql.changeVersion('', DB_VERSION_NUMBER, SQL_TABLE, function() {
				successCallback && successCallback(true);
			}, function(error, failingQuery) {
				errorCallback && errorCallback(error, failingQuery);
			});
		} else {
			successCallback && successCallback(false);
		}
	};
	wa.toggleDownloadWhenWifi = function(whenWifi) {
		if (whenWifi) {
			localStorage.setItem(IMAGE_DOWNLOAD, IMAGE_DOWNLOAD_WHEN_WIFI);
		} else {
			localStorage.removeItem(IMAGE_DOWNLOAD);
		}
	};
	wa.isDownloadWhenWifi = function() {
		return !!localStorage.getItem(IMAGE_DOWNLOAD);
	};
	wa.isDownloadImage = function() {
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

	wa.isDownloadImageAsync = function(callback) {
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

	wa.clearCache = function() {
		plus.nativeUI.showWaiting('正在删除缓存...');
		wa.deleteSlider();
		wa.deleteRecom();
		wa.deleteNews();
			//清除图片缓存
		plus.io.resolveLocalFileSystemURL(DIR_IMAGE, function(entry) {
			entry.removeRecursively(function() {
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast("缓存删除成功");
			}, function() {
				plus.nativeUI.closeWaiting();
			});
		}, function(e) {
			plus.nativeUI.closeWaiting();
		});
		//通知首页重新拉取最新
		localStorage.removeItem(TIME_UPDATE); //移除上次更新时间
		localStorage.removeItem(LAST_PUBDATE);
//			plus.webview.getWebviewById("news").evalJS('getFeed("true")');
	};
	wa.downloadImage = function(name, imgUrl, successCallback, errorCallback) {
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
	wa.getFeed = function(successCallback, errorCallback) {
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
		wa.clearCache();
		var comp1 = false, comp2 = false, comp3 = false, ret = true;
		$.getNews(NEWS_URL + '?lastDate=' + latestPubDate, function(items) {
			if (items && items.length>0) {
				var news = [];
				$.each(items, function(index, item) {
					news.push([item.id, item.title, item.mark1, item.mark2, item.mark3, item.pubDate,
						item.image, item.source, item.time, item.view, item.type]);
				});
				wa.deleteNews();
				wa.addNews(news, function() {
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
				var news = [];
				$.each(items, function(index, item) {
					news.push([item.id, item.image, item.priority, item.pubDate]);
				});
				wa.deleteSlider();
				wa.addSlider(news, function() {
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
				var news = [];
				$.each(items, function(index, item) {
					news.push([item.id, item.image, item.location]);
				});
				wa.deleteRecom();
				wa.addRecom(news, function() {
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
	wa.getNewsByid = function(id, successCallback, errorCallback) {
		websql.process([{
			"sql": SQL_SELECT_NEWS_DETAIL,
			"data": [id]
		}], function(tx, results) {
			successCallback(results.rows.length > 0 && results.rows.item(0));
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	wa.getNews = function(latestId, pageSize, successCallback, errorCallback) {
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
			"sql": SQL_SELECT_NEWS,
			"data": [latestId, pageSize]
		}], function(tx, results) {
			successCallback(results.rows);
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	wa.addNews = function(news, successCallback, errorCallback) {
		var sqls = [];
		$.each(news, function(index, item) {
			sqls.push({
				"sql": SQL_INSERT_NEWS,
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
	wa.updateNews = function(id, image, successCallback, errorCallback) {
		websql.process([{
			"sql": SQL_UPDATE_NEWS,
			"data": [image, id],
		}], function(tx, results) {
			successCallback && successCallback();
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	wa.deleteNews = function(successCallback, errorCallback) {
		websql.process(SQL_DELETE_NEWS, function(tx, results) {
			successCallback && successCallback();
		}, function(error, failingQuery) {
			console.log(error.message);
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	wa.getSliderByid = function(id, successCallback, errorCallback) {
		websql.process([{
			"sql": SQL_SELECT_SLIDER_DETAIL,
			"data": [id]
		}], function(tx, results) {
			successCallback(results.rows.length > 0 && results.rows.item(0));
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	wa.getSlider = function(successCallback, errorCallback) {
		websql.process(SQL_SELECT_SLIDER, function(tx, results) {
			successCallback(results.rows);
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	wa.addSlider = function(news, successCallback, errorCallback) {
		var sqls = [];
		$.each(news, function(index, item) {
			sqls.push({
				"sql": SQL_INSERT_SLIDER,
				"data": item
			})
		});
		websql.process(sqls, function(tx, results) {
			successCallback(true);
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});

	};
	wa.updateSlider = function(id, image, successCallback, errorCallback) {
		websql.process([{
			"sql": SQL_UPDATE_SLIDER,
			"data": [image, id],
		}], function(tx, results) {
			successCallback && successCallback();
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	wa.deleteSlider = function(){
		websql.process(SQL_DELETE_SLIDER, function(tx, results) {
			
		}, function(error, failingQuery) {
			
		});
	};
	wa.getRecomByid = function(id, successCallback, errorCallback) {
		websql.process([{
			"sql": SQL_SELECT_RECOM_DETAIL,
			"data": [id]
		}], function(tx, results) {
			successCallback(results.rows.length > 0 && results.rows.item(0));
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	wa.getRecom = function(successCallback, errorCallback) {
		websql.process(SQL_SELECT_RECOM, function(tx, results) {
			successCallback(results.rows);
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	wa.addRecom = function(news, successCallback, errorCallback) {
		var sqls = [];
		$.each(news, function(index, item) {
			sqls.push({
				"sql": SQL_INSERT_RECOM,
				"data": item
			})
		});
		websql.process(sqls, function(tx, results) {
			successCallback(true);
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});

	};
	wa.updateRecom = function(id, image, successCallback, errorCallback) {
		websql.process([{
			"sql": SQL_UPDATE_RECOM,
			"data": [image, id],
		}], function(tx, results) {
			successCallback && successCallback();
		}, function(error, failingQuery) {
			errorCallback && errorCallback(error, failingQuery);
		});
	};
	wa.deleteRecom = function(){
		websql.process(SQL_DELETE_RECOM, function(tx, results) {
			
		}, function(error, failingQuery) {
			
		});
	};
})(mui, wa, html5sql);