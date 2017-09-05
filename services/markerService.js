const BaseService = require('../libs/baseService.js');
const fs = require('fs');
const Promise = require('bluebird');
const utils = require('../libs/utils.js');
const service = new BaseService();
const crypto = require('crypto');
const redis = require('../libs/redis.js').redisClient;
const mongodb = require('../libs/mongodb.js');
const Marker = require('../models/marker.js');

service.addMarker = function(req, res){
    var marker = JSON.parse(req.body.marker);
    var page_name = req.body.page_name;
    var panorama_id = req.body.panorama_id;
    var temp_obj = {
        marker: marker,
        page_name: page_name,
        panorama_id: panorama_id
    }
    Marker.schema(temp_obj).then(function(markerObj){
        service.restSuccess(res, markerObj);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    })
};

service.getMarker = function(req, res){
    var query = {
        page_name: req.query.page_name
    }
    Marker.schema.find(query).saveAsync().then(function(bars){
        service.restSuccess(res, bars);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    })
};

module.exports = service;