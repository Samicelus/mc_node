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

module.exports = utils;