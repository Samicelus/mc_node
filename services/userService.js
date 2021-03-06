var BaseService = require('../libs/baseService.js');
var fs = require('fs');
var Promise = require('bluebird');
var mongodb = require('../libs/mongodb.js');
var utils = require('../libs/utils.js');
var service = new BaseService();
var User = require('../models/user.js');
var authme = require('../libs/authme.js');
var crypto = require('crypto');
var redis = require('../libs/redis.js').redisClient;

var mail = require('emailjs').server.connect({
    host: 'smtp.163.com',
    user: '18180780531@163.com',
    
    password: '12e409i7',
    ssl: true
});


service.registUser = function(req, res){
	var user_name = req.body.user_name;
	var email = req.body.email;
	var password = req.body.password;
	var condition = {"$or":[{"user_name":user_name},{"email":email}]};
    User.schema.findOne(condition).execAsync().then(function(userObj) {
        if (userObj) {
        	return false;
        } else {
            var salt = authme.generate16salt(user_name);
            var crypt_pass = authme.computeHash(password, salt, user_name);
            mail.send({
                text:    "请点击以下连接以激活账户:\n\t http://samicelus.cc/panorama/validUser?user_name="+user_name+"&code="+utils.md5(user_name+crypt_pass),
                from:    "you <18180780531@163.com>",
                to:      user_name+" <"+email+">",
                subject: "mc360账户激活通知"
            },function (err, message) {
				if (err) throw err;
				console.log(message);
			});
            var temp = {
                user_name: user_name,
                email: email,
                password: crypt_pass,
                is_valid: false,
                max_page: 3,
                max_panorama: 6
            };
            return User.schema(temp).saveAsync();
        }
    }).then(function(rst){
    	if(rst){
            service.restSuccess(res, {result: true, msg:"注册成功,请去邮箱验证！"});
		}else{
            service.restSuccess(res, {result: false, msg: "用户名或邮箱已经注册"});
		}
	}).catch(function(e){
		console.error(e.stack || e);
	    service.restError(res, -1, e.toString());
	});
};

service.validUser = function(req, res){
    var code = req.query.code;
    var user_name = req.query.user_name;
    var condition = {user_name: user_name};
    User.schema.findOne(condition).execAsync().then(function(userObj){
        if(userObj){
            if(utils.md5(user_name+userObj.password) == code){
                userObj.is_valid = true;
                return userObj.saveAsync();
            }else{
                throw new Error("验证失败");
            }
        }else{
            throw new Error("未找到用户");
        }
    }).then(function(){
        service.restSuccess(res, {rasult:true, msg:"激活成功"});
    }).catch(function(e){
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    });
};

service.login = function(req, res){
    var user_name = req.body.user_name;
    var password = req.body.password;
    var retToken = "";
    var expire_timestamp = "";
    var hashedPassword = "";
    var condition = {user_name: user_name};
    User.schema.findOne(condition).execAsync().then(function(userObj){
        if(userObj){
            hashedPassword = userObj.password;
        }
        var auth = authme.comparePassword(password, hashedPassword, user_name);
        if(auth&&userObj.is_valid){
            if(!req.session.user_token){
                var newTokenInfo = authme.generateToken(userObj.user_name, userObj._id, req);
                retToken = newTokenInfo.token;
                expire_timestamp = newTokenInfo.expire_timestamp;
            }else{
                let nowTimestamp = new Date().getTime();
                if(req.session.user_token_expire_timestamp > nowTimestamp){
                    retToken = req.session.user_token;
                    expire_timestamp = req.session.user_token_expire_timestamp;
                }else{
                    let newTokenInfo = authme.generateToken(userObj.user_name, userObj._id, req);
                    retToken = newTokenInfo.token;
                    expire_timestamp = newTokenInfo.expire_timestamp;
                }
            }
            service.restSuccess(res, {token:retToken, expire_timestamp:expire_timestamp, username:userObj.user_name});
        }else{
            throw new Error("login failed!")
        }
    }).catch(function(e){
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    });
};

service.logoutUser = function(req, res){
    authme.delete_user_token(req);
    service.restSuccess(res, "success");
}

module.exports = service;