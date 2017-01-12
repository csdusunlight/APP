;function UserInfo(){
};

//清除登录信息
UserInfo.clear = function(){
//  localStorage.removeItem('username');
//  localStorage.removeItem('password');
    localStorage.removeItem('token');
    localStorage.removeItem('expire');
    localStorage.removeItem('userinfo');
}

//检查是否包含自动登录的信息
UserInfo.auto_login = function(){
    var username = UserInfo.username();
    var pwd = UserInfo.password();
    if(!username || !pwd){
        return false;
    }
    return true;
}

//检查是否已登录
UserInfo.has_login = function(){
    var username = UserInfo.username();
    var token = UserInfo.token();
    var expire = parseInt(UserInfo.expire());
    var currentTime = Date.parse(new Date());
    if(username && token && expire){
    	if (expire > currentTime){
    		return true;
    	}
    }
    return false;
};

UserInfo.username = function(){
    if(arguments.length == 0){
        return localStorage.getItem('username');
    }
    if(arguments[0] === ''){
        localStorage.removeItem('username');
        return;
    }
    localStorage.setItem('username', arguments[0]);
};

UserInfo.password = function(){
    if(arguments.length == 0){
        return localStorage.getItem('password');        
    }
    if(arguments[0] === ''){
        localStorage.removeItem('password');
        return;
    }
    localStorage.setItem('password', arguments[0]);
};

UserInfo.token = function(){
    if(arguments.length == 0){
        return localStorage.getItem('token');       
    }
    if(arguments[0] === ''){
        localStorage.removeItem('token');
        return;
    }
    localStorage.setItem('token', arguments[0]);
};

UserInfo.expire = function(){
    if(arguments.length == 0){
        return localStorage.getItem('expire');       
    }
    if(arguments[0] === ''){
        localStorage.removeItem('expire');
        return;
    }
    localStorage.setItem('expire', arguments[0].toString());
};

UserInfo.userinfo = function(){
    if(arguments.length == 0){
        var userinfo_str = localStorage.getItem('userinfo');
    	return JSON.parse(userinfo_str);
    }
    if(!arguments[0]){
        localStorage.removeItem('userinfo');
        return;
    }
    var userinfo_str = JSON.stringify(arguments[0]);
    localStorage.setItem('userinfo', userinfo_str);
};