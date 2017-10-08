'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/panoramaService.js');

module.exports = function(app){
	app.route('/addPage').post(handler.addPage);
    app.route('/getPages').get(handler.getPages);
    var upload = multer({'dest': 'upload/'});
    app.route('/addPanorama').post(upload.single('panorama_pic'), handler.addPanorama);
    app.route('/getPanoramaById').post(handler.getPanoramaById);
    app.route('/getPanorama').post(handler.getPanorama);
    app.route('/setInitPosition').post(handler.setInitPosition);
    app.route('/getPanoramas').get(handler.getPanoramas);
};