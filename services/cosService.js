let BaseService = require('../libs/baseService.js');
let Promise = require('bluebird');
let mongodb = require('../libs/mongodb.js');
let utils = require('../libs/utils.js');
let fs = Promise.promisifyAll(require('fs'));
var multer  = require('multer');
var upload = multer({'dest': 'public/temp/'}).array('file_upload');
let COS = require('cos-nodejs-sdk-v5');
let params = {
    AppId: '1254462566', /* 必须 */
    SecretId: 'AKID4CKQK2rsJakiU7DLlXNacXHpBMOMe1cw', /* 必须 */
    SecretKey: 'OcfXIsuoX5TghkvvlPtBHCvY0LyZ3Rkw'
};
let cos = new COS(params);
let service = new BaseService();

service.save_cos = function(req, res){
    upload(req, res, function (err) {
        if (err) {
            service.restError(res, err);
        }
        let files = req.files;
        files.forEach((file)=>{
            let originalname = file.originalname;
            let name = split_filename(originalname);
            upload_one_file(file.path, name);
            });
        service.restSuccess(res, "OK");
        });
};

//将本地文件上传到COS并命名为name
function upload_one_file(path, name){
    fs.readFile(path,(err, data)=>{
        if (err) throw err;
        //console.log(data);
        let options = {
            Bucket : 'health', /* 必须 */
            Region : 'cn-south', /* 必须 */
            Key : name, /* 必须 */
            contentLength: data.length,
            Body: data
        };
        //console.log(options);
        cos.putObject(options, function(err, data) {
            if(err) {
                throw err;
            } else {
                fs.unlink(path);
            }
        });
    })
}

function split_filename(filename){
    let temp_arr = filename.split('.');
    let len = temp_arr.length;
    let name = temp_arr[0];
    if(len > 2){
        for(let i = 1;i < (len - 1);i++){
            name += "."+temp_arr[i];
        }
    }
    return name;
}

service.upload_single = function (req, res) {
    fs.readFile('./bin/upload/5785a12ec86f8bf22d8b458a.txt',(err, data)=>{
        if (err) throw err;
        console.log(data);
        let options = {
            Bucket : 'health', /* 必须 */
            Region : 'cn-south', /* 必须 */
            Key : '5785a12ec86f8bf22d8b458a.txt', /* 必须 */
            contentLength: data.length,
            Body: data
        };
        //console.log(options);
        cos.putObject(options, function(err, data) {
            if(err) {
                service.restError(res, err);
            } else {
                service.restSuccess(res, data);
            }
        });
    });
}

service.upload = function (req, res) {
    let file_list = [];
    fs.readdirAsync('./bin/upload').then(function(files) {
        files.forEach((file)=>{
            file_list.push(file);
        });
        file_list.forEach((file)=>{
            return fs.readFileAsync('./bin/upload/'+file)
                .then((data)=> {
                    let options = {
                        Bucket: 'health', /* 必须 */
                        Region: 'cn-south', /* 必须 */
                        Key: file, /* 必须 */
                        ContentLength: data.length, /* 必须 */
                        Body: data
                    };
                    console.log(options);
                    cos.putObject(options);
                })
                .catch((e)=>{
                    throw e;
                })
            });
        })
        .then(()=>{
            service.restSuccess(res, 'success');
        })
        .catch((e)=>{
            service.restError(res, e);
        });
};

service.getFile = function (req, res) {
    let file_name = req.query.file_name;
    let options = {
        Bucket : 'health', /* 必须 */
        Region : 'cn-south', /* 必须 */
        Key : file_name
    };
    console.log(options);
    cos.getObject(options, function(err, data) {
        if(err) {
            service.restError(res, err);
        } else {
            res.end(data.Body);
        }
    });
}


function getAuth(key){
    let data = {
        Method:"post",
        Key:key_name
    };
    return cos.getAuth(data);
}

module.exports = service;
