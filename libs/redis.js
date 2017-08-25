var redis = require('redis');
var Promise = require('bluebird');
Promise.promisifyAll(redis);
var utils = require('./utils.js');


var redisConfig = require(utils.configDir+'/redisConfig.json');
var redisClient = redis.createClient(redisConfig.port, redisConfig.host);

module.exports = {
    redisClient: redisClient
};