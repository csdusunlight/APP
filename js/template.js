var templates = {}
var getTemplate = function(name, main_url, sub_url) {
	console.log(name);
	var template = templates[name];
	if (!template) {
		console.log("注意！！！新建的模板！");
		//预加载共用父模板；
		var headerWebview = mui.preload({
			url: main_url,
			id: name + "_main",
			styles: {
				popGesture: "hide",
				hardwareAccelerated: true
			},
			extras: {
				mType: 'main'
			}
		});
		//预加载共用子webview
		var subWebview = mui.preload({
			url: sub_url,
			id: name + "_sub",
			styles: {
				top: '45px',
				bottom: '0px',
				popGesture: "hide",
				hardwareAccelerated: true
			},
			extras: {
				mType: 'sub'
			}
		});
		headerWebview.append(subWebview);
		//iOS平台支持侧滑关闭，父窗体侧滑隐藏后，同时需要隐藏子窗体；
		if (mui.os.ios) { //5+父窗体隐藏，子窗体还可以看到？不符合逻辑吧？
			headerWebview.addEventListener('hide', function() {
				subWebview.hide("none");
			});
		}
		templates[name] = template = {
			name: name,
			header: headerWebview,
			content: subWebview,
		};
	}
	console.log("已有模板");
	return template;
};