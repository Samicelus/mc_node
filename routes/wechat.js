'use strict';
var utils = require('../libs/utils.js');
var handler = require('../services/wechatService.js');

module.exports = function (app) {
    app.route('/wechat/accesstoken').get(handler.getAccessToken);
    //获取jsapi_ticket
    app.route('/wechat/jsapi_ticket').get(handler.getJSAPI_ticket);
    //生成JS-SDK所需signature
    app.route('/wechat/signature/generate').post(handler.generateSignature);
};