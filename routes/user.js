'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/userService.js');

module.exports = function(app){
	app.route('/registUser').post(handler.registUser);
}