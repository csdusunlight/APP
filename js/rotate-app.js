var bRotate = false,
	angleBasic = 360*8;
var pointer = document.getElementById("pointer"),
	rotate = document.getElementById("rotate");
	
var item = -1; 	//此处item值为中奖的类别参数，由后台数据传入
var flag = 0;
function rnd(n, m) {
	return Math.floor(Math.random() * (m - n + 1) + n)
}
var rotateFn = function(f, angles, txt) {
	mui(".popup1 font")[0].innerText = txt;
	flag = f;
	choujiang(angles);
}
rotate.addEventListener("transitionend", function() {
	if(flag) {
		mui(".popup1")[0].style.display = "block";
	} else {
		mui(".popup6")[0].style.display = "block";
	}
	bRotate = false;
	rotate.de
});
function lottery(item) {
	var angle = rnd(3, 57) + angleBasic;
	switch(item) {
		case 2:
			angle += 30;
			rotateFn(1, angle, '10积分');
			break;
		case 4:
			angle += 90;
			rotateFn(1, angle, '0.8元现金');
			break;
		case 3:
			angle += 150;
			rotateFn(1, angle, '50积分');
			break;
		case 5:
			angle += -150;
			rotateFn(1, angle, '2元现金');
			break;

		case 1:
			angle += -90;
			rotateFn(0, angle, '谢谢参与');
			break;
		case 6:
			angle += -30;
			rotateFn(1, angle, 'iPhone');
			break;
	}
	return angle;
}

function choujiang(angle) {
	chongzhi();
	setTimeout(function() {
		rotate.setAttribute('style', 'transform:rotate(' + angle + 'deg)');
		rotate.style.transition = 'all 6s cubic-bezier(.2,.54,0,1)';
	}, 50)
}

function chongzhi() {
	rotate.style.transition = 'none';
	rotate.style.transform = 'rotate(0deg)';

}

pointer.addEventListener("tap", function() {
	if (bRotate){
			return;
		}
		else {
//			bRotate = true;
			mui(".popup4")[0].style.display = "block";
		}
});

mui('.btn_cont').on('tap', '.confirm_lottery', function() {
	bRotate = true;
	mui.ajax({
		url: "http://test.wafuli.cn/activity/lottery/get_lottery/",
		dataType:"json",
		type:"post",
		data:{
			token:UserInfo.token(),
		},
		success:function(ret){
			if(ret.code==-1){
				mui.openWindow({
		            url: "../a_login.html",
		            id:"login",
		            styles: {
		                top: 0,
		                bottom: 0
		            },
		            show: {
		                aniShow: 'slide-in-right',
		            },
		        });
		        bRotate = false;
			}
			else if(ret.code==0){
				var itemid = ret.itemid
				itemid = parseInt(itemid)
				lottery(itemid);
			}
			else if(ret.code==-2){
				$(".popup7").css("display","block");
				bRotate = false;
			}
			else{
				alert("参数错误，请联系电话客服！");
				bRotate = false;
			}
		},
		error:function(){
			alert('网络超时，请检查您的网络设置！');
			bRotate = false;
		}
    });
});

mui('.popup-box').on('tap', '.btn_x', function() {
	this.parentNode.parentNode.style.display = "none";
	bRotate = false;
});
mui('.popup-box').on('tap', '.btn_cont button', function() {
	this.parentNode.parentNode.parentNode.parentNode.style.display = "none";
});