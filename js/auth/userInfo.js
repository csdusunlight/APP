;function UserInfo(){
};

//清除登录信息
UserInfo.clear = function(){
    plus.storage.removeItem('username');
    plus.storage.removeItem('mobile');
    plus.storage.removeItem('token');
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
    var mobile = UserInfo.mobile();
    var token = UserInfo.token();
    if(!token){
        return false;
    }
    return true;
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

UserInfo.mobile = function(){
    if(arguments.length == 0){
        return plus.storage.getItem('mobile');        
    }
    if(arguments[0] === ''){
        plus.storage.removeItem('mobile');
        return;
    }
    plus.storage.setItem('mobile', arguments[0]);
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