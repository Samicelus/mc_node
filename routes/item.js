'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/itemService.js');

module.exports = function(app){
	app.route('/addBagItem').post(handler.addBagItem);
}