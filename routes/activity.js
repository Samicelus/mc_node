'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/activityService.js');

module.exports = function(app){
    var upload = multer({'dest': 'upload/'});
    app.route('/regist').post(upload.single('avatar'), handler.regist);
};