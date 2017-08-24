var BaseService = require('../libs/baseService.js');
var fs = require('fs');
var Promise = require('bluebird');
var mongodb = require('../libs/mongodb.js');
var utils = require('../libs/utils.js');
var service = new BaseService();

var Psedo_item = require('../models/psedo_item.js');

service.addBagItem = function(req, res){
	var item_name = req.body.param;
	var condition = {param: param};
	Psedo_item.schema.findOne(condition).execAsync().then(function(t_model){
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