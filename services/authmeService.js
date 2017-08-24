var BaseService = require('../libs/baseService.js');
var fs = require('fs');
var Promise = require('bluebird');
var sqlitedb = require('../libs/sqlite.js');
var utils = require('../libs/utils.js');
var service = new BaseService();

service.testdb = function(req, res){
    var id = req.query.id;
    console.log("search for id:"+id);
    sqlitedb.all('SELECT * FROM USER').then(function(user){
        console.log(user);
        service.restSuccess(res, user);
	}).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    })
}

service.test = function(req, res){
	service.restSuccess(res, "测试");
}

module.exports = service;