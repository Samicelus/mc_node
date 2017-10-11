const BaseService = require('../libs/baseService.js');
const Promise = require('bluebird');
const utils = require('../libs/utils.js');
const service = new BaseService();
const fs = Promise.promisifyAll(require('fs'));
const crypto = require('crypto');
const redis = require('../libs/redis.js').redisClient;
const mongodb = require('../libs/mongodb.js');
const Marker = require('../models/marker.js');
const PanoramaSerie = require('../models/panorama_serie.js');
const Page = require('../models/page.js');
const User = require('../models/user.js');
const images =require('images');
let COS = require('cos-nodejs-sdk-v5');
let params = {
    AppId: '1254462566', /* 必须 */
    SecretId: 'AKIDWqwndEXlfKkwtcDWgfPuA9sLXTAaEwmM', /* 必须 */
    SecretKey: 'VordBUXMvHPHtFLErDJ9j25sRkqjNluo'
};
let cos = Promise.promisifyAll(new COS(params));

service.getObj = function (req, res) {
    let file_name = req.params.filename;
    let options = {
        Bucket : 'mcpanoram', /* 必须 */
        Region : 'ap-chengdu', /* 必须 */
        Key : file_name
    };
    cos.getObject(options, function(err, data){
        if(err){
            console.error(err.stack || err);
            service.restError(res, -1, err.stack);
        }else{
            res.end(data.Body);
        }
    });
}

//将本地文件上传到COS并命名为name
function upload_one_file(path, name, quality){
    var max_tail = 300;
    switch (quality) {
        case "high":
            max_tail = 600;
            break;
        case "normal":
            max_tail = 400;
            break;
        case "low":
            max_tail = 300;
            break;
        default:
            max_tail = 400;
            break;
    }
    console.log("resize the image to < "+ max_tail);
    return fs.readFileAsync(path).then(function(data) {
        console.log("file size KB:" + data.length / 1024);
        if (data.length / 1024 > max_tail) {
            var nowTimestamp = new Date().getTime();
            return reTailImage(path, 80, max_tail, nowTimestamp);
        }
    }).then(function(new_path) {
        return fs.readFileAsync(new_path);
    }).then(function(data){
        console.log("file resize KB:" + data.length / 1024);
        let options = {
            Bucket: 'mcpanoram', /* 必须 */
            Region: 'ap-chengdu', /* 必须 */
            Key: name, /* 必须 */
            contentLength: data.length,
            Body: data
        };
        return cos.putObjectAsync(options);
    }).then(function(){
        return fs.unlinkAsync(path);
    }).catch(function(e){
        throw e;
    })
}

function reTailImage(path, quality, max_tail, timestamp){
    var extract = images(path);
    var temp_file = "temp_"+timestamp+".jpg";
    if(extract.size().width > 2000){
        extract.size(2000).save(temp_file, {quality :quality});
    }else{
        extract.save(temp_file,{quality :quality});
    }
    return fs.readFileAsync(temp_file).then(function(data) {
        if(data.length/1024 > max_tail && quality > 10){
            return reTailImage(path, quality-10, max_tail, timestamp);
        }else{
            return temp_file;
        }
    });
}

service.addPage = function(req, res){
    var user_id = req.body.user.ip;
    var max_page = 0;
    if(!req.body.page){
        service.restError(res, -1, "未输入page名称");
    }else {
        User.schema.findById(user_id).execAsync().then(function(userObj) {
            if (userObj) {
                max_page = userObj.max_page;
            }
            return Page.schema.count({user_id: user_id}).execAsync();
        }).then(function(count){
            if(count < max_page){
                var temp_page = {
                    page_name: req.body.page,
                    user_id: user_id
                };
                return Page.schema(temp_page).saveAsync();
            }else{
                throw new Error("已达到可创建场景上限:"+max_page);
            }
        }).then(function(pageObj){
            service.restSuccess(res, pageObj);
        }).catch(function (e) {
            console.error(e.stack || e);
            service.restError(res, -1, e.stack);
        })
    }
};

service.getPages = function(req, res){
    var user_id = req.body.user.ip;
    var query = {user_id: user_id};
    Page.schema.find(query).execAsync().then(function(bars){
        service.restSuccess(res, bars);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    })
};

service.addPanorama = function(req, res){
    var user_id = req.body.user.ip;
    var panorama_pic = req.file;
    var page_id = req.body.page_id;
    var x = req.body.x;
    var y = req.body.y;
    var z = req.body.z;
    var title = req.body.title;
    var content = req.body.content;
    var quality = req.body.quality?req.body.quality:"normal";
    var filename = page_id+"."+x+"."+y+"."+z+".jpg";
    var save_path = "./public/images/"+filename;
    var panorama_url = "/panorama/getObj/"+filename;
    var max_panorama = 0;
    fs.renameAsync(panorama_pic.path, save_path).then(function() {
        return upload_one_file(save_path, filename, quality);
    }).then(function(){
        return User.schema.findById(user_id).execAsync();
    }).then(function(userObj) {
        if (userObj) {
            max_panorama = userObj.max_panorama;
        }
        return PanoramaSerie.schema.count({page_id: page_id}).execAsync();
    }).then(function(count){
        if(count < max_panorama){
            var temp_pano = {
                x: Number(x),
                y: Number(y),
                z: Number(z),
                page_id: page_id,
                panorama_url: panorama_url,
                title: title,
                content: content
            };
            return PanoramaSerie.schema(temp_pano).saveAsync()
        }else{
            return fs.unlinkAsync(save_path);
            throw new Error("已达到该场景容纳全景图上限:"+max_panorama);
        }
    }).then(function(panoramaObj){
        service.restSuccess(res, panoramaObj);
    }).catch(function(err){
        console.error(err.stack || err);
        service.restError(res, -1, err.toString());
    })
};

service.getPanoramaById = function(req, res){
    var panorama_id = req.body.panorama_id;
    var ret_env = {};
    var page_id = "";
    PanoramaSerie.schema.findById(panorama_id).execAsync().then(function(panoramaObj){
        if(panoramaObj){
            ret_env.origin = panoramaObj;
            page_id = panoramaObj.page_id;
            var up_condition = {
                page_id: page_id,
                x: ret_env.origin.x,
                y: ret_env.origin.y,
                z: ret_env.origin.z+1
            };
            return PanoramaSerie.schema.findOne(up_condition).execAsync();
        }else{
            throw new Error("未找到该全景图");
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
        var level_condition = {page_id:page_id, z:ret_env.origin.z};
        return PanoramaSerie.schema.find(level_condition,{_id:-1, x:1, y:1, z:1}).execAsync();
    }).then(function(bars){
        var list = JSON.parse(JSON.stringify(bars));
        var current_position = {
            x: ret_env.origin.x,
            y: ret_env.origin.y,
            z: ret_env.origin.z
        };
        service.restSuccess(res, {ret_env:ret_env, current_position:current_position, level_env:list});
    }).catch(function(e){
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
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
        var level_condition = {page_id:page_id, z:now_condition.z};
        return PanoramaSerie.schema.find(level_condition,{_id:-1, x:1, y:1, z:1}).execAsync();
    }).then(function(bars){
        var list = JSON.parse(JSON.stringify(bars));
        var current_position = {
            x: now_condition.x,
            y: now_condition.y,
            z: now_condition.z
        };
        service.restSuccess(res, {ret_env:ret_env, current_position:current_position, level_env:list});
    }).catch(function(e){
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    });
};

service.setInitPosition = function(req, res){
    var page_id = req.body.page_id;
    var current_position = req.body.current_position?JSON.parse(req.body.current_position):{x:0, y:0, z:0};
    var init_position = JSON.parse(req.body.init_position);
    var condition = {page_id:page_id, x:current_position.x, y:current_position.y, z:current_position.z};
    PanoramaSerie.schema.findOne(condition).execAsync().then(function(panoramaObj){
        if(panoramaObj){
            panoramaObj.init_position = init_position;
            panoramaObj.markModified("init_position");
            return panoramaObj.saveAsync();
        }
    }).then(function(panoramaObj){
        service.restSuccess(res, panoramaObj);
    }).catch(function(e){
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    });
};

service.getPanoramas = function(req, res){
    var query = {page_id:req.query.page_id};
    PanoramaSerie.schema.find(query).execAsync().then(function(bars){
        service.restSuccess(res, bars);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    })
};

service.getDefaultPage = function(req, res){
    var user_id = req.body.user.ip;
    var query = {user_id: user_id};
    Page.schema.findOne(query).execAsync().then(function(pageObj){
        service.restSuccess(res, pageObj._id);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    })
}

module.exports = service;