'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/panoramaService.js');

module.exports = function(app){
    app.route('/getObj/:filename').get(handler.getObj);
	app.route('/addPage').post(utils.authorize, handler.addPage);
    app.route('/getPages').get(utils.authorize, handler.getPages);
    var upload = multer({'dest': 'upload/'});
    app.route('/addPanorama').post(upload.single('panorama_pic'), utils.authorize, handler.addPanorama);
    app.route('/getPanoramaById').post(handler.getPanoramaById);
    app.route('/getPanorama').post(handler.getPanorama);
    app.route('/setInitPosition').post(handler.setInitPosition);
    app.route('/getPanoramas').get(handler.getPanoramas);
    app.route('/getDefaultPage').get(utils.authorize, handler.getDefaultPage);
    app.route('/modPageSound').post(upload.single('page_sound'), utils.authorize, handler.modPageSound);
};