'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/authmeService.js');

module.exports = function(app){
	app.route('/login').post(handler.login);
    app.route('/changePassword').post(utils.authorize, handler.changePassword);
}