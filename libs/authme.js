const crypto = require('crypto');
var utils = require('./utils.js');
var serverConfig = require(utils.configDir + '/serverConfig.json');
var authme = {};

authme.computeHash = function (password, salt, name) {
    return "$SHA$" + salt + "$" + sha256(sha256(password) + salt)
};

function sha256(str){
    return  crypto.createHash('sha256').update(str).digest('hex');
}

function encrypt_token(str){
    let cipher = crypto.createCipher('aes192', 'a password');
    let encrypted = cipher.update(str,'utf8','hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt_token(str){
    let decipher = crypto.createDecipher('aes192', 'a password');
    let decrypted = decipher.update(str,'hex','utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

authme.comparePassword = function (password, hashedPassword, playerName) {
    let hash = authme.getHash(hashedPassword);
    let salt = authme.getSalt(hashedPassword);
    return hash == authme.getHash(authme.computeHash(password, salt, ""));
};

authme.getHash = function (hashedPassword){
    return hashedPassword.split("$")[3];
};

authme.getSalt = function (hashedPassword){
    return hashedPassword.split("$")[2];
};

authme.generateToken = function(username, ip){
    let nowTimestamp = new Date().getTime();
    let origin_str = username+"$"+nowTimestamp+"$"+ip;
    let token = encrypt_token(origin_str);
    let expire_timestamp = nowTimestamp + serverConfig.token_expire_time;
    renew_user_token(username, token, expire_timestamp);
    return {token:token, expire_timestamp:expire_timestamp};
};

function renew_user_token(username, token, expire_timestamp){
    if(!user_tokens.hasOwnProperty('username')){
        user_tokens[username] = {};
    }
    user_tokens[username].token = token;
    user_tokens[username].expire_timestamp = expire_timestamp;
}

module.exports = authme;