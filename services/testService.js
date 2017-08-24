var BaseService = require('../libs/baseService.js');
var fs = require('fs');
var Promise = require('bluebird');
var mongodb = require('../libs/mongodb.js');
var utils = require('../libs/utils.js');
var service = new BaseService();

var Test_model = require('../models/test_model.js');


service.uploadFile = function(req, res){
	var uploaded_file = req.file;
	var save_path = req.body.save_path;
	fs.rename(uploaded_file.path, save_path, function(err, ret){
		if(err){
			console.error(err.stack || err);
   			service.restError(res, -1, err.toString());
		}else{
			service.restSuccess(res, ret);
		}
	});
}


service.testSer = function(req, res){
	var param = req.query.param;
	var condition = {param: param};
	Test_model.schema.findOne(condition).execAsync().then(function(t_model){
		//数据库逻辑
		service.restSuccess(res, t_model);
	}).catch(function(e){
		console.error(e.stack || e);
	    service.restError(res, -1, e.toString());
	});
}

service.testSave = function(req, res){
	var param = req.body.param;
	var model = {param: param};
	Test_model.schema(model).saveAsync().then(function(t_model){
		//数据库逻辑
		service.restSuccess(res, t_model);
	}).catch(function(e){
		console.error(e.stack || e);
	    service.restError(res, -1, e.toString());
	});
}

module.exports = service;