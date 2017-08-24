var moment = require('moment');
const crypto = require('crypto');
var utils = {};

utils.datetimeFormat = function (time) {
    var res = moment(time).format('YYYY-MM-DD HH:mm:ss');
    return res == 'Invalid date' ? '' : res;
};
utils.moment = moment;

utils.configDir = (function () {
    var path = process.cwd() + '/config.dev';
    if (utils.env == 'production') {
        path = process.cwd() + '/config.production';
    }
    return path;
})();

function decrypt_token(str){
    let decipher = crypto.createDecipher('aes192', 'a password');
    let decrypted = decipher.update(str,'hex','utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

utils.authorize = function(req, res, next){
    let nowTimestamp = new Date().getTime();
    let token = req.headers.token||'';
    let decrypt_str = decrypt_token(token);
    let username = decrypt_str.split("$")[0];
    let ip = decrypt_str.split("$")[2];
    if(user_tokens[username] && user_tokens[username].token == token && user_tokens[username].expire_timestamp > nowTimestamp){
        req.body.user = {};
        req.body.username = username;
        req.body.user.ip = ip;
        return next();
    }else{
        res.send({result: 'FALSE', errorcode: 1, message: 'token校验失败，用户信息无效。'});
    }
}

module.exports = utils;