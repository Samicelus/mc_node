var BaseService = require('../libs/baseService.js');
var fs = require('fs');
var Promise = require('bluebird');
var mongodb = require('../libs/mongodb.js');
var utils = require('../libs/utils.js');
var service = new BaseService();
var User = require('../models/user.js');

var mail = require('email').server.connect({
    host: 'smtp.qq.com',
    user: 'mc_360@qq.com',
    password: '123edsaqw',
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
                text:    "i hope this works",
                from:    "you <mc_360@qq.com>",
                to:      "someone <50893818@qq.com>",
                subject: "test"
            },function (err, message) {
				if (err) throw err;
				console.log(message);
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