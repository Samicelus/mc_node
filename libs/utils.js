const moment = require('moment');
const crypto = require('crypto');
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

module.exports = utils;