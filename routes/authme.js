'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/authmeService.js');

module.exports = function(app){
	app.route('/login').post(handler.login);
    app.route('/checkLogin').get(utils.authorize, handler.checkLogin);
    app.route('/changePassword').post(utils.authorize, handler.changePassword);
    app.route('/getEmail').get(utils.authorize, handler.getEmail);
    app.route('/getUserInfo').get(utils.authorize, handler.getUserInfo);
    //app.route('/createTable').post(utils.authorize, handler.createTable);
}