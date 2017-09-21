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
    var panorama_id = req.body.panorama_id;
    var temp_obj = {
        marker: marker,
        panorama_id: panorama_id
    }
    Marker.schema(temp_obj).saveAsync().then(function(markerObj){
        service.restSuccess(res, markerObj);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    })
};

service.getMarker = function(req, res){
    var query = {
        panorama_id: req.query.panorama_id
    }
    Marker.schema.find(query).execAsync().then(function(bars){
        service.restSuccess(res, bars);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    })
};

service.removeMarker = function(req, res){
    var query = {
        "panoram_id": req.body.panoram_id,
        "marker.id": req.body.id
    };
    Marker.schema.removeAsync(query).then(function(result){
        service.restSuccess(res, result);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    })
};

module.exports = service;