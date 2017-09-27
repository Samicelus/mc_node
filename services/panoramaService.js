const BaseService = require('../libs/baseService.js');
const fs = require('fs');
const Promise = require('bluebird');
const utils = require('../libs/utils.js');
const service = new BaseService();
const crypto = require('crypto');
const redis = require('../libs/redis.js').redisClient;
const mongodb = require('../libs/mongodb.js');
const Marker = require('../models/marker.js');
const PanoramaSerie = require('../models/panorama_serie.js');
const Page = require('../models/page.js');

service.addPage = function(req, res){
    if(!req.body.page){
        service.restError(res, -1, "未输入page名称");
    }else{
        var temp_page = {
            page_name: req.body.page
        };
        Page.schema(temp_page).saveAsync().then(function(pageObj){
            service.restSuccess(res, pageObj);
        }).catch(function (e) {
            console.error(e.stack || e);
            service.restError(res, -1, e.stack);
        })
    }
};

service.getPages = function(req, res){
    var query = {};
    Page.schema.find(query).execAsync().then(function(bars){
        service.restSuccess(res, bars);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    })
};

service.addPanorama = function(req, res){
    var panorama_pic = req.file;
    var page_id = req.body.page_id;
    var x = req.body.x;
    var y = req.body.y;
    var z = req.body.z;
    var title = req.body.title;
    var content = req.body.content;
    var filename = page_id+"."+x+"."+y+"."+z+".jpg";
    var save_path = "./public/images/"+filename;
    var panorama_url = "../images/"+filename;

    console.log("page_id:",page_id);
    console.log("title:",title);
    console.log("content:",content);
    console.log("filename:",filename);
    fs.rename(panorama_pic.path, save_path, function(err, ret){
        if(err){
            console.error(err.stack || err);
            service.restError(res, -1, err.toString());
        }else {
            var temp_pano = {
                x: x,
                y: y,
                z: z,
                page_id: page_id,
                panorama_url: panorama_url,
                title: title,
                content: content
            };
            PanoramaSerie.schema(temp_pano).saveAsync().then(function(panoramaObj){
                fs.unlink(panorama_pic.path);
                service.restSuccess(res, panoramaObj);
            }).catch(function(e){
                console.error(e.stack || e);
                service.restError(res, -1, e.stack);
            });
        }
    });
};

service.getPanorama = function(req, res){
    var page_id = req.body.page_id;
    var current_position = req.body.current_position?JSON.parse(req.body.current_position):{x:0, y:0, z:0};
    var move = req.body.move?req.body.move:"";
    var current_condition = {
        page_id: page_id,
        x: current_position.x,
        y: current_position.y,
        z: current_position.z
    };
    var now_condition = {
        page_id: page_id,
        x: current_position.x,
        y: current_position.y,
        z: current_position.z
    };
    switch(move){
        case "up":
            now_condition.z += 1;
            break;
        case "down":
            now_condition.z -= 1;
            break;
        case "left":
            now_condition.x -= 1;
            break;
        case "right":
            now_condition.x += 1;
            break;
        case "front":
            now_condition.y += 1;
            break;
        case "back":
            now_condition.y -= 1;
            break;
        default :
            break;
    }
    var ret_env = {};
    PanoramaSerie.schema.findOne(now_condition).execAsync().then(function(panoramaObj) {
        if (panoramaObj) {
            return panoramaObj;
        } else {
            return PanoramaSerie.schema.findOne(current_condition).execAsync();
        }
    }).then(function(panoramaObj){
        if(panoramaObj){
            ret_env.origin = panoramaObj;
            var up_condition = {
                page_id: page_id,
                x: ret_env.origin.x,
                y: ret_env.origin.y,
                z: ret_env.origin.z+1
            };
            return PanoramaSerie.schema.findOne(up_condition).execAsync();
        }else{
            throw new Error("尚未设置原点");
        }
    }).then(function(panoramaObj){
        if(panoramaObj){
            ret_env.up = panoramaObj;

        }else{
            ret_env.up = {};
        }
        var down_condition = {
            page_id: page_id,
            x: ret_env.origin.x,
            y: ret_env.origin.y,
            z: ret_env.origin.z-1
        };
        return PanoramaSerie.schema.findOne(down_condition).execAsync();
    }).then(function(panoramaObj){
        if(panoramaObj){
            ret_env.down = panoramaObj;
        }else{
            ret_env.down = {};
        }
        var left_condition = {
            page_id: page_id,
            x: ret_env.origin.x-1,
            y: ret_env.origin.y,
            z: ret_env.origin.z
        };
        return PanoramaSerie.schema.findOne(left_condition).execAsync();
    }).then(function(panoramaObj){
        if(panoramaObj){
            ret_env.left = panoramaObj;
        }else{
            ret_env.left = {};
        }
        var right_condition = {
            page_id: page_id,
            x: ret_env.origin.x+1,
            y: ret_env.origin.y,
            z: ret_env.origin.z
        };
        return PanoramaSerie.schema.findOne(right_condition).execAsync();
    }).then(function(panoramaObj){
        if(panoramaObj){
            ret_env.right = panoramaObj;
        }else{
            ret_env.right = {};
        }
        var front_condition = {
            page_id: page_id,
            x: ret_env.origin.x,
            y: ret_env.origin.y+1,
            z: ret_env.origin.z
        };
        return PanoramaSerie.schema.findOne(front_condition).execAsync();
    }).then(function(panoramaObj){
        if(panoramaObj){
            ret_env.front = panoramaObj;
        }else{
            ret_env.front = {};
        }
        var back_condition = {
            page_id: page_id,
            x: ret_env.origin.x,
            y: ret_env.origin.y-1,
            z: ret_env.origin.z
        };
        return PanoramaSerie.schema.findOne(back_condition).execAsync();
    }).then(function(panoramaObj){
        if(panoramaObj){
            ret_env.back = panoramaObj;
        }else{
            ret_env.back = {};
        }
        service.restSuccess(res, ret_env);
    }).catch(function(e){
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    });
};

module.exports = service;