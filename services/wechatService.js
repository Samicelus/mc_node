var BaseService = require('../libs/baseService.js');
var utils = require('../libs/utils.js');
var service = new BaseService();
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var superagent = Promise.promisifyAll(require('superagent'));
var redis = require('../libs/redis.js').redisClient;
var AccessToken = require('../libs/accessToken.js')(redis);


/**
 * 获取mp_id对应的accessToken
 */
service.getAccessToken = function (req, res) {
    var mp_id = req.body.mp_id;
    if (!mp_id || mp_id.length !== 24) {
        return res.send({result: 'FALSE', code: -1, message: 'mp_id 无效：' + mp_id, data: {}});
    }
    AccessToken.get(mp_id).then(function (accessToken) {
        service.restSuccess(res, accessToken);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    });
};


//获取jsapi_ticket
service.getJSAPI_ticket = function (req, res) {
    var mp_id = req.body.mp_id;
    if (!mp_id || mp_id.length !== 24) {
        return res.send({result: 'FALSE', code: -1, message: 'mp_id 无效：' + mp_id, data: {}});
    }
    AccessToken.get_jsapi_ticket(mp_id).then(function (jsapi_ticket) {
        service.restSuccess(res, jsapi_ticket);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    });
}


//生成JS-SDK所需signature
service.generateSignature = function (req, res) {
    var url = req.body.url;
    var mp_id = req.body.mp_id;
    var nowTime = new Date().getTime();
    if (!mp_id || mp_id.length !== 24) {
        throw new Error('mp_id 无效：' + mp_id);
    }
    var conf = {};
    AccessToken.getWeixin(mp_id).then(function (weixin) {
        conf = weixin;
    }).then(function () {
        return AccessToken.get_jsapi_ticket(mp_id);
    }).then(function (jsapi_ticket) {
        var data = {
            noncestr: utils.md5(nowTime.toString()),
            jsapi_ticket: jsapi_ticket,
            timestamp: parseInt(nowTime / 1000),
            url: url
        }
        var sortObj = utils.sortByAscii(data);
        var p_str = '';
        for (var k in sortObj) {
            p_str += k + '=' + sortObj[k] + '&';
        }
        p_str = p_str.substring(0, p_str.length - 1);
        data.appId = conf.appId;
        data.signature = utils.sha1(p_str);
        delete data.jsapi_ticket;
        service.restSuccess(res, data);
    }).catch(function (e) {
        console.error(e.stack || e);
        service.restError(res, -1, e.stack);
    });
};

    // var dreamix11 = [
    //     "混沌是创造的开端。",
    //     "保持谦卑。",
    //     "最好的东西通常隐藏在绝望的背后。",
    //     "成长在于敢做决定并承担责任。",
    //     "成熟在于承认自己的需要并愿意寻求帮助。",
    //     "忍耐是必须的。",
    //     "所谓完成任务是确认你的“下游”已经收到了你的输出。",
    //     "以小时为单位来衡量工作量。",
    //     "领导就是服务。",
    //     "“我已经尽力了”距离你的能力极限还有21.1公里。",
    //     "我们可以接受失败，僵化和麻木才是死亡的同义词。"
    // ];

module.exports = service;

