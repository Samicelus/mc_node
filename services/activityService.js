const BaseService = require('../libs/baseService.js');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const utils = require('../libs/utils.js');
const service = new BaseService();
const Activity_user = require('../models/activity_user.js');
const util = require('util');

service.regist = function(req, res){
  	let user_name = req.body.user_name;
  	let password = req.body.password;
    let avatar_file = req.file;
	let save_path = "./upload/activity/user/"+user_name+".jpg";
    fs.renameAsync(avatar_file.path, save_path).then(()=>{
        return Activity_user.schema({
            user_name: user_name,
            password: password,
			avatar: save_path,
			user_info:{}
        }).saveAsync();
    }).then((user_obj)=>{
		service.restSuccess(res, user_obj);
	}).catch((e)=>{
		console.error(e.stack || e);
		service.restError(res, -1, e.toString());
	})
}

service.login = function(req, res){
    let user_name = req.body.user_name;
    let password = req.body.password;
}


module.exports = service;