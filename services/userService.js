var BaseService = require('../libs/baseService.js');
var fs = require('fs');
var Promise = require('bluebird');
var mongodb = require('../libs/mongodb.js');
var utils = require('../libs/utils.js');
var service = new BaseService();
var User = require('../models/user.js');

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
            mail.send({
                text:    "请点击以下连接以激活账户:\n\t http://samicelus.cc/panorama/validUser?user_name="+user_name+"&code="+utils.md5(user_name+utils.md5(password)),
                from:    "you <18180780531@163.com>",
                to:      "someone <50893818@qq.com>",
                subject: "mc360账户激活通知"
            },function (err, message) {
				if (err) throw err;
				console.log(message);
			});
            var temp = {
                user_name: user_name,
                email: email,
                password: utils.md5(password),
                is_valid: false
            };
            return User.schema(temp).saveAsync();
        }
    }).then(function(rst){
    	if(rst){
            service.restSuccess(res, rst);
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


module.exports = service;