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
var entity_arr = [];

function Entity(opt){
    EventEmitter.call(this);
    this.id = id++;
    this.name = opt.name;
    this.annoncer;
}

util.inherits(Entity, EventEmitter);

Entity.prototype.start = function(){
	var self = this;
	this.emit("start", {name:this.name});
    this.annoncer = setInterval(function(){
    	self.emit("speak",{name:self.name});
	},1000);
    this.on("speak",function(data){
        if(this.name != data.name){
            console.log(data.name+" speaks");
        }
    });
    this.on("stop",function(data){
        if(this.name != data.name){
            console.log(data.name+" leaves");
        }
    })
    this.on("start",function(data){
        if(this.name != data.name){
            console.log(data.name+" comes");
        }
    });
    return this;
}

Entity.prototype.stop = function(){
    var self = this;
    clearInterval(this.annoncer);
    self.emit("stop",{name:this.name});
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
            entity_arr.push(new Entity({name:name}).start());
			break;
		case "delete":
            entity_arr[id].stop();
            entity_arr.splice(id,1);
            break;
		default:
			console.log("unknown command");
			break
	}
	var log = "command: "+action+ "executed";
    service.restSuccess(res, log);
}



module.exports = service;