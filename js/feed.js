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
		console.log("laile");
		$.ajax({
			type: "get",
			url: url,
			dataType: 'json',
			success: function(response) {
				if (!response) {
					return error();
				}
				success(parseNews(response));
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
				success(parseSlider(response));
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
				location: srcItem.location,
			});
		});
		return items;
	};
	$.getRecom = function(url, success, error) {
		error = error || $.noop;
		$.ajax({
			type: "get",
			url: url,
			dataType: 'json',
			success: function(response) {
				if (!response) {
					return error();
				}
				success(parseRecom(response));
			},
			error: error
		});
	};
})(mui);