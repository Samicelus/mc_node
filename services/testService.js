var BaseService = require('../libs/baseService.js');
var fs = require('fs');
var Promise = require('bluebird');
var mongodb = require('../libs/mongodb.js');
var utils = require('../libs/utils.js');
var service = new BaseService();
var Test_model = require('../models/test_model.js');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var id = 0;
global.entity_group = {};

function Entity(opt){
    EventEmitter.call(this);
    this.id = id++;
    this.name = opt.name;
    this.annoncer;
}

util.inherits(Entity, EventEmitter);

Entity.prototype.start = function(){
	console.log(this.name + "start...")
	var self = this;
	this.emit("start", this.name);
    this.annoncer = setInterval(function(){
    	self.emit("speak",self.name);
	},1000);
    this.on("speak",function(data){
        if(this.name != data){
            console.log(data+" speaks");
        }
    });
    this.on("stop",function(data){
        if(this.name != data){
            console.log(data+" leaves");
        }
    })
    this.on("start",function(data){
        if(this.name != data){
            console.log(data+" comes");
        }
    });
    return this;
}

Entity.prototype.stop = function(){
    console.log(this.name + "stops...")
    var self = this;
    clearInterval(this.annoncer);
    self.emit("stop",this.name);
    return this;
}

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

service.testEntity = function(req, res){
    var name = req.body.name;
	var action = req.body.action;
	var id = Number(req.body.id);
	switch(action){
		case "create":
            global.entity_group[name] = new Entity({name:name});
            global.entity_group[name].start();
			break;
		case "stop":
			if(global.entity_group[name]){
                global.entity_group[name].stop();
			}
            break;
		default:
			console.log("unknown command");
			break
	}
	var log = "command: "+action+ "executed";
    service.restSuccess(res, log);
}



module.exports = service;