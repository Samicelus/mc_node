'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/markerService.js');

module.exports = function(app){
	app.route('/addMarker').post(handler.addMarker);
    app.route('/getMarker').get(handler.getMarker);
    app.route('/removeMarker').post(handler.removeMarker);
}