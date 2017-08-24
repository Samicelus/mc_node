var BaseService = require('../libs/baseService.js');
var fs = require('fs');
var Promise = require('bluebird');
var sqlitedb = require('../libs/sqlite.js');
var utils = require('../libs/utils.js');
var authme = require('../libs/authme.js');
var service = new BaseService();
const crypto = require('crypto');


service.listAll = function(req, res){
    sqlitedb.all('SELECT * FROM authme').then(function(user){
        console.log(user);
        service.restSuccess(res, user);
	}).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    })
}

service.testSHA256 = function(req, res){
    var str = req.query.str;
    const secret = 'abcdefg';
    const hash = crypto.createHmac('sha256', secret)
        .update('I love cupcakes')
        .digest('hex');
    console.log(hash);
}

service.login = function(req, res){
    var name = req.body.name;
    var password = req.body.password;
    sqlitedb.get('SELECT * FROM authme WHERE username = ?', name).then(function(user){
        var hashedPassword = user.password;
        if(!password){
            throw new Error("no password entered!")
        }
        if(!user){
            throw new Error("user not found!");
        }
        var auth = authme.comparePassword(password, hashedPassword, name);
        if(auth){
            service.restSuccess(res, "login succeseed!");
        }else{
            throw new Error("login failed!")
        }
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.toString());
    })
}

module.exports = service;