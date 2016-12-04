;function UserInfo(){
};

//清除登录信息
UserInfo.clear = function(){
    plus.storage.removeItem('username');
    plus.storage.removeItem('password');
    plus.storage.removeItem('token');
    plus.storage.removeItem('expire');
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
    console.log(username);console.log(token);console.log(UserInfo.expire());
    if(username && token && expire){
    	if (expire > currentTime){
    		return true;
    	}
    }
    return false;
};

UserInfo.username = function(){
    if(arguments.length == 0){
        return plus.storage.getItem('username');
    }
    if(arguments[0] === ''){
        plus.storage.removeItem('username');
        return;
    }
    plus.storage.setItem('username', arguments[0]);
};

UserInfo.password = function(){
    if(arguments.length == 0){
        return plus.storage.getItem('password');        
    }
    if(arguments[0] === ''){
        plus.storage.removeItem('password');
        return;
    }
    plus.storage.setItem('password', arguments[0]);
};

UserInfo.token = function(){
    if(arguments.length == 0){
        return plus.storage.getItem('token');       
    }
    if(arguments[0] === ''){
        plus.storage.removeItem('token');
        return;
    }
    plus.storage.setItem('token', arguments[0]);
};

UserInfo.expire = function(){
    if(arguments.length == 0){
        return plus.storage.getItem('expire');       
    }
    if(arguments[0] === ''){
        plus.storage.removeItem('expire');
        return;
    }
    plus.storage.setItem('expire', arguments[0].toString());
};