'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/testService.js');

module.exports = function(app){
	app.route('/testSer').get(handler.testSer);
	app.route('/testSave').post(handler.testSave);
	var upload = multer({'dest': 'upload/'});
	app.route('/uploadFile').post(upload.single('uploaded_file'), handler.uploadFile);
}