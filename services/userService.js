var BaseService = require('../libs/baseService.js');
var fs = require('fs');
var Promise = require('bluebird');
var mongodb = require('../libs/mongodb.js');
var utils = require('../libs/utils.js');
var service = new BaseService();
var User = require('../models/user.js');

var mail = require('mail').Mail({
    host: 'smtp.qq.com',
    username: 'mc_360@qq.com',
    password: '123edsaqw'
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
            mail.message({
                from: 'mc_360@qq.com',
                to: [email],
                subject: '欢迎注册mc360'
            })
			.body('激活账户')
			.send(function (err) {
				if (err) throw err;
				console.log('Sent!');
			});
            var temp = {
                user_name: user_name,
                email: email,
                password: utils.md5(password)
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

module.exports = service;