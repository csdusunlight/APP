(function($) {
	var parseNews = function(dstList) {
		var items = [];
		dstList.forEach(function(srcItem) {
			items.push({
				id: srcItem.id,
				title: srcItem.title,
				mark1: srcItem.mark1,
				mark2: srcItem.mark2,
				mark3: srcItem.mark3,
				pubDate: Date.parse(srcItem.pubDate),
				image: srcItem.image,
				time: srcItem.time,
				source: srcItem.source,
				view: srcItem.view,
				type: srcItem.type
			});
		});
		return items;
	};
	$.getNews = function(url, success, error) {
		var merror = error || $.noop;
		$.ajax({
			type: "get",
			url: url,
			dataType: 'json',
			success: function(response) {
				if (!response) {
					return error();
				}
				if(response.code!=0){
					mui.alert(response.msg)
				}
				else{
					success(parseNews(response.data));
				}
			},
			error:function(xhr,type,errorThrown){
				console.log(type);
				merror();
			},
			timeout:5000
		});
	};
	var parseSlider = function(dstList) {
		var items = [];
		dstList.forEach(function(srcItem) {
			items.push({
				id: srcItem.id,
				image: srcItem.image,
				priority: srcItem.priority,
				pubDate: Date.parse(srcItem.pubDate)
			});
		});
		return items;
	};
	$.getSlider= function(url, success, error) {
		error = error || $.noop;
		$.ajax({
			type: "get",
			url: url,
			dataType: 'json',
			success: function(response) {
				if (!response) {
					return error();
				}
				if(response.code!=0){
					mui.alert(response.msg)
				}
				else{
					success(parseSlider(response.data));
				}
			},
			error: error
		});
	};
	var parseRecom = function(dstList) {
		var items = [];
		dstList.forEach(function(srcItem) {
			items.push({
				id: srcItem.id,
				image: srcItem.image,
				type: srcItem.type,
				wel_id: srcItem.wel_id,
				location: srcItem.location,
				title: srcItem.title,
				
			});
		});
		return items;
	};
	$.getRecom = function(url, success, error) {
		$.ajax({
			type: "get",
			url: url,
			dataType: 'json',
			success: function(response) {
				if (!response) {
					return error();
				}
				if(response.code!=0){
					mui.alert(response.msg)
				}
				else{
					success(parseRecom(response.data));
				}
			},
			error:error
		});
	};
	$.getTodayNum = function(url, success, error) {
		$.ajax({
			type: "get",
			url: url,
			dataType: 'json',
			success: function(response) {
				if(response.code!=0){
					mui.alert(response.msg);
				}
				else{
					success(response);
				}
			},
			error:error
		});
	};
})(mui);