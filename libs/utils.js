const moment = require('moment');
const crypto = require('crypto');
const https = require('https');
let utils = {};


utils.datetimeFormat = function (time) {
    let res = moment(time).format('YYYY-MM-DD HH:mm:ss');
    return res == 'Invalid date' ? '' : res;
};
utils.moment = moment;

utils.configDir = (function () {
    let path = process.cwd() + '/config.dev';
    if (utils.env == 'production') {
        path = process.cwd() + '/config.production';
    }
    return path;
})();

const serverConfig = require(utils.configDir + '/serverConfig.json');

function decrypt_token(str){
    console.log("str:"+str);
    console.log("secret:"+serverConfig.cipher_secret);
    let decipher = crypto.createDecipher('aes192', serverConfig.cipher_secret);
    let decrypted = decipher.update(str,'hex','utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

utils.authorize = function(req, res, next){
    let nowTimestamp = new Date().getTime();
    let token = req.session.user_token;
    if(!token){
        res.send({result: 'FALSE', errorcode: 1, message: 'user_token不存在，请重新登录。'});
    }else{
        let decrypt_str = decrypt_token(token);
        let username = decrypt_str.split("$")[0];
        let ip = decrypt_str.split("$")[2];
        if( req.session.user_token_expire_timestamp > nowTimestamp){
            req.body.user = {};
            req.body.user.username = username;
            req.body.user.ip = ip;
            return next();
        }else{
            res.send({result: 'FALSE', errorcode: 1, message: 'user_token过期，请重新登录。'});
        }
    }
}

utils.https = function(options, data, cb){
    var req = https.request(options, function(res) {
        if (res.statusCode == 200) {
            var thunk = '';
            res.on('data', function(d) {
                thunk += d;
            });
            res.on('end', function(d) {
                cb(null, thunk.toString('utf8'));
            });
        } else {
            cb('http statusCode error: ' + res.statusCode, null);
        }
    }).on('error', function(e) {
        cb(e, null);
    });
    if(data != null){
        if(typeof data == 'string'){
            req.write(data + '\n');
        }else{
            req.write(data);
        }
    }
    req.end();
}

utils.md5 = function (text) {
    return crypto.createHash('md5').update(text, 'utf8').digest('hex');
};

//按照字段名的ASCII码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1
utils.sortByAscii = function(obj){
    var param_keys = [];
    for(var i in obj){
        param_keys.push(i);
    }
    //递归比较单词字母顺序
    function compare(w0, w1, i){
        if(w0.charCodeAt(i) === w1.charCodeAt(i)){
            return compare(w0, w1, ++i);
        }else if(isNaN(w0.charCodeAt(i)) && !isNaN(w1.charCodeAt(i))){
            return 0 - w1.charCodeAt(i);
        }else if(!isNaN(w0.charCodeAt(i)) && isNaN(w1.charCodeAt(i))){
            return w0.charCodeAt(i) - 0;
        }else{
            return w0.charCodeAt(i) - w1.charCodeAt(i);
        }
    }
    //排序后的键
    var new_param_keys = param_keys.sort(function(a, b){
        return compare(a, b, 0);
    });
    var new_obj = {};
    for(var i in new_param_keys){
        for(var j in obj){
            if(obj[j] != null && obj[j] !== '' && new_param_keys[i] == j){   //参数的值为空不参与签名
                // log(new_param_keys[i] + '\t' + j + '\t' + package[j]);
                new_obj[j] = obj[j];
            }
        }
    }
    return new_obj;
}

utils.sha1 = function (str) {
    var md5sum = crypto.createHash('sha1');
    md5sum.update(str, 'utf8');
    str = md5sum.digest('hex');
    return str;
};

module.exports = utils;