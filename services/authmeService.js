const BaseService = require('../libs/baseService.js');
const fs = require('fs');
const Promise = require('bluebird');
const sqlitedb = require('../libs/sqlite.js');
const utils = require('../libs/utils.js');
const authme = require('../libs/authme.js');
const service = new BaseService();
const crypto = require('crypto');
const redis = require('../libs/redis.js').redisClient;

service.login = function(req, res){
    const name = req.body.name;
    const password = req.body.password;
    let retToken = "";
    let expire_timestamp = "";
    sqlitedb.get('SELECT * FROM authme WHERE username = ?', name).then(function(user){
        if(!user){
            throw new Error("user not found!");
        }
        let hashedPassword = user.password;
        if(!password){
            throw new Error("no password entered!")
        }
        let auth = authme.comparePassword(password, hashedPassword, name);
        if(auth){
            if(!req.session.user_token){
                const newTokenInfo = authme.generateToken(user.username, user.ip, req);
                retToken = newTokenInfo.token;
                expire_timestamp = newTokenInfo.expire_timestamp;
            }else{
                let nowTimestamp = new Date().getTime();
                if(req.session.user_token_expire_timestamp > nowTimestamp){
                    retToken = req.session.user_token;
                    expire_timestamp = req.session.user_token_expire_timestamp;
                }else{
                    let newTokenInfo = authme.generateToken(user.username, user.ip, req);
                    retToken = newTokenInfo.token;
                    expire_timestamp = newTokenInfo.expire_timestamp;
                }
            }
            service.restSuccess(res, {token:retToken, expire_timestamp:expire_timestamp, username:user.username});
        }else{
            throw new Error("login failed!")
        }
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    })
};

service.checkLogin = function(req, res) {
    const username = req.body.user.username;
    service.restSuccess(res, username);
}

service.changePassword = function(req, res){
    const username = req.body.user.username;
    const ip = req.body.user.ip;
    const old_password = req.body.old_password;
    const new_password = req.body.new_password;
    console.log("username:"+username);
    console.log("ip:"+ip);
    sqlitedb.get('SELECT * FROM authme WHERE username = ?', username).then(function(user){
        if(!user){
            throw new Error("user: "+username+" not found!");
        }
        const hashedPassword = user.password;
        if(!old_password){
            throw new Error("no old_password entered!")
        }
        const auth = authme.comparePassword(old_password, hashedPassword, username);
        if(auth){
            const salt = authme.generate16salt(username);
            const password = authme.computeHash(new_password, salt, username);
            return sqlitedb.run("UPDATE authme SET password = '"+ password +"' WHERE username = ?", username);
        }else{
            throw new Error("old_password incorrect!");
        }
    }).then(function(){
        service.restSuccess(res, "修改成功！");
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    })
};

service.getEmail = function(req, res){
    const username = req.body.user.username;
    const ip = req.body.user.ip;
    sqlitedb.get('SELECT * FROM authme WHERE username = ?', username).then(function(user){
        if(!user){
            throw new Error("user: "+username+" not found!");
        }
        const email = user.email;
        service.restSuccess(res, email);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    })
};

service.getUserInfo = function(req, res){
    const username = req.body.user.username;
    const ip = req.body.user.ip;
    sqlitedb.get('SELECT * FROM authme WHERE username = ?', username).then(function(user){
        service.restSuccess(res, user);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    })
};

// service.createTable = function(req, res){
//     const username = req.body.user.username;
//     const ip = req.body.user.ip;
//     sqlitedb.run("CREATE TABLE user( ID INT PRIMARY KEY NOT NULL, username TEXT NOT NULL, phone TEXT, code TEXT, expire TEXT)").then(function(result){
//         service.restSuccess(res, result);
//     }).catch(function (e) {
//         console.error(e.stack || e);
//         service.restError(res, -1, e.toString());
//     })
// };

service.preBindPhone = function(req, res){
    const username = req.body.user.username;
    const ip = req.body.user.ip;

    sqlitedb.run("INSERT INTO user(username, code) VALUES ('"+ username +"','" + code + "')").then(function(result){
        service.restSuccess(res, result);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    })
};

function generate_code(){
    let random = Math.round(Math.random()*1000000).toString();
}

function zero_padding(str, length){

}

service.bindPhone = function(req, res){
    const username = req.body.user.username;
    const ip = req.body.user.ip;
    const phone = req.body.phone;
    sqlitedb.run("INSERT INTO user(username, phone) VALUES ('"+ username +"','" + phone + "')").then(function(result){
        service.restSuccess(res, result);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    })
};

module.exports = service;