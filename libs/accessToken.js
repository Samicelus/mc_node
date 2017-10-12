var utils = require('./utils.js');
var Promise = require('bluebird');
var mongodb = require('./mongodb.js');
var Mp = require('../models/mp.js');

function AccessToken(redis){
    this.redis = redis;
    this.expireTime = 7000; //second
    this.weixin_key = 'mc360pano:weixin';
}

/**
 * 获取微信企业配置项，缓存到redis
 */
AccessToken.prototype.getWeixin = function(mp_id){
    var _this = this;
    return _this.redis.hgetAsync(_this.weixin_key, mp_id).then(function(weixinqy){
        if(weixinqy){
            var obj = {};
            try{
                return JSON.parse(weixinqy);
            }catch(e){
                //异步删除无效数据
                _this.redis.hdelAsync(_this.weixin_key, mp_id);
                throw e;
            }
        }else{
            log('查询mongodb，mp_id：' + mp_id + '\t' + typeof mp_id);
            var temp = null;
            return Mp.schema.findByIdAsync(mp_id).then(function(result){
                if(!result){
                    throw new Error(utils.datetimeFormat() + '\t不存在该帐号，mp_id：' + mp_id);
                }
                temp = result.weixin;
                return _this.redis.hmsetAsync(_this.weixin_key, mp_id, JSON.stringify(result.weixin));
            }).then(function(){
                return _this.redis.expireAsync(_this.weixin_key, 7200);   //缓存2小时，避免数据库改了redis没有刷新
            }).then(function(){
                return temp;
            });
        }
    });
}

/**
 * 获取accessToken，返回promise对象
 */
AccessToken.prototype.get = function(mp_id){
    var _this = this;
    return _this.getWeixin(mp_id).then(function (weixin) {
        var appSecret = weixin.appSecret;
        var k = '';
        if (weixin.appSecret) {
            k = weixin.appId + ':accessToken';
        } else {
            throw new Error("params error");
        }
        return _this.redis.getAsync(k).then(function(result){
            if(result){
                return result;
            }else{
                //生成新的accessToken
                var theToken = '';
                return _this.generate(weixin.appId, appSecret).then(function(accessToken){
                    theToken = accessToken;
                    return _this.redis.setAsync(k, accessToken).then(function(){
                        return _this.redis.expireAsync(k, _this.expireTime).then(function(){
                            return theToken;
                        });
                    });
                });
            }
        });
    }).catch(function(err){
        error(utils.datetimeFormat() + '\t获取accessToken失败：' + err.stack || err);
    });
};

AccessToken.prototype.generate = function(appId, appSecret){
    //https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=id&corpsecret=secrect
    var options = {
        host: 'api.weixin.qq.com',
        port: 443,
        path: '/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret,
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return new Promise(function(resolve, reject){
        utils.https(options, null, function(err, result){
            if(err){
                return reject(err);
            }
            resolve(JSON.parse(result).access_token);
        });
    });
}

AccessToken.prototype.get_jsapi_ticket = function(mp_id){
    var _this = this;
    return _this.getWeixin(mp_id).then(function(weixin){
        var k = '';
        if (weixin.appSecret) {
            k = weixin.appId + ':jsapiTicket';
        } else {
            throw new Error("params error");
        }

        return _this.redis.getAsync(k).then(function(result){
            if(result && result != 'undefined'){
                return result;
            }else{
                //生成新的jsapi_ticket
                var theJsapiTicket = '';
                return _this.get(mp_id).then(function(accessToken){
                    return _this.generate_jsapi_ticket(accessToken).then(function(jsapi_ticket){
                        theJsapiTicket = jsapi_ticket;
                        return _this.redis.setAsync(k, jsapi_ticket).then(function(){
                            return _this.redis.expireAsync(k, _this.expireTime).then(function(){
                                return theJsapiTicket;
                            });
                        });
                    });
                });
            }
        });
    }).catch(function(err){
        error(utils.datetimeFormat() + '\t获取jsapi_ticket失败：' + err.stack || err);
    });
}

AccessToken.prototype.generate_jsapi_ticket = function(accessToken){
    //https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=ACCESS_TOKEN
    var options = {
        host: 'api.weixin.qq.com',
        port: 443,
        path: '/cgi-bin/ticket/getticket?access_token=' + accessToken +'&type=jsapi',
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return new Promise(function(resolve, reject){
        utils.https(options, null, function(err, result){
            if(err){
                return reject(err);
            }
            resolve(JSON.parse(result).ticket);
        });
    });
}

module.exports = function(redis){
    return new AccessToken(redis);
}