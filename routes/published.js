'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/panoramaService.js');
var html = require('html');

module.exports = function(app){
    app.route('/panoramaPub/:page_id').get(function (req, res) {
        res.render('../public/published/published.ejs',{page_id:req.params.page_id});
    });
};



