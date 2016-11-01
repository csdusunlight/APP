(function($) {
	var parseFeed = function(dstList) {
		var items = [];
		dstList.forEach(function(srcItem) {
			items.push({
				post_id: srcItem.id,
				title: srcItem.title,
				mark1: srcItem.mark1,
				mark2: srcItem.mark2,
				mark3: srcItem.mark3,
				pubDate: srcItem.pubDate,
				image: srcItem.image,
				time: Date.parse(srcItem.time),
				source: srcItem.source,
				view: srcItem.view
			});
		});
		return items;
	};
	$.getFeed = function(url, success, error) {
		error = error || $.noop;
		$.ajax({
			type: "get",
			url: url,
			dataType: 'json',
			success: function(response) {
				if (!response) {
					return error();
				}
				success(parseFeed(response));
			},
			error: error
		});
	};
})(mui);