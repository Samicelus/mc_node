'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/authmeService.js');

module.exports = function(app){
	app.route('/listAll').get(handler.listAll);
	app.route('/login').post(handler.login);
    app.route('/testSHA256').get(handler.testSHA256);
}