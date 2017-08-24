var BaseService = require('../libs/baseService.js');
var fs = require('fs');
var Promise = require('bluebird');
var sqlitedb = require('../libs/sqlite.js');
var utils = require('../libs/utils.js');
var authme = require('../libs/authme.js');
var service = new BaseService();
const crypto = require('crypto');

service.login = function(req, res){
    var name = req.body.name;
    var password = req.body.password;
    var retToken = "";
    var expire_timestamp = "";
    sqlitedb.get('SELECT * FROM authme WHERE username = ?', name).then(function(user){
        if(!user){
            throw new Error("user not found!");
        }
        var hashedPassword = user.password;
        if(!password){
            throw new Error("no password entered!")
        }
        var auth = authme.comparePassword(password, hashedPassword, name);
        if(auth){
            if(!user_tokens[user.username]){
                var newTokenInfo = authme.generateToken(user.username, user.ip);
                retToken = newTokenInfo.token;
                expire_timestamp = newTokenInfo.expire_timestamp;
            }else{
                let nowTimestamp = new Date().getTime();
                if(user_tokens[user.username].expire_timestamp > nowTimestamp){
                    retToken = user_tokens[user.username].token;
                    expire_timestamp = user_tokens[user.username].expire_timestamp;
                }else{
                    var newTokenInfo = authme.generateToken(user.username, user.ip);
                    retToken = newTokenInfo.token;
                    expire_timestamp = newTokenInfo.expire_timestamp;
                }
            }
            service.restSuccess(res, {token:retToken, expire_timestamp:expire_timestamp});
        }else{
            throw new Error("login failed!")
        }
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    })
};

service.changePassword = function(req, res){
    var username = req.body.user.username;
    var old_password = req.body.old_password;
    var new_password = req.body.new_password;
    sqlitedb.get('SELECT * FROM authme WHERE username = ?', username).then(function(user){
        if(!user){
            throw new Error("user: "+username+" not found!");
        }
        var hashedPassword = user.password;
        if(!old_password){
            throw new Error("no old_password entered!")
        }
        var auth = authme.comparePassword(old_password, hashedPassword, username);
        if(auth){
            let salt = authme.generate16salt(username);
            let password = authme.computeHash(new_password, salt, username);
            return sqlitedb.set("UPDATE authme SET password = '"+ password +"' WHERE username = ?", username);
        }else{
            throw new Error("old_password incorrect!");
        }
    }).then(function(result){
        console.log(result);
        service.restSuccess(res, result);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    })
};

module.exports = service;