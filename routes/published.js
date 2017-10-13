'use strict';
var utils = require('../libs/utils.js');
var multer  = require('multer');
var handler = require('../services/panoramaService.js');
const Page = require('../models/page.js');

module.exports = function(app){
    app.route('/panoramaPub/:page_id').get(function (req, res) {
        Page.schema.findById(req.params.page_id).execAsync().then(function(pageObj){
            res.render('../public/published/published',{page_id:req.params.page_id, page_name:pageObj.page_name});
        }).catch(function(e){
            res.setHeader("Access-Control-Allow-Origin", "www.samicelus.cc");
            res.setHeader("Access-Control-Allow-Headers","*");
            res.send({result:'FALSE',data:"页面找不到了"});
        });
    });
};



