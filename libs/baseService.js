'use strict';
var mongodb = require('./mongodb.js');
var utils = require('./utils.js');
var RESULT_TRUE = 'TRUE';
var RESULT_FALSE = 'FALSE';

class BaseService{
    constructor() {
        this.restSuccess = restSuccess;
        this.restError  = restError;
    };
}

/**
 * 处理成功返回
 */
function restSuccess(res, data, other_datas){
    var result = {result: RESULT_TRUE};
    if (data) {
        result.data = data;
    }
    if (other_datas) {
        for (var key in other_datas) {
            result[key] = other_datas[key];
        }
    }
    rest(res,result);
}

/**
 * 处理错误返回
 */
function restError(res,err_code, err_msg){
    var result = {result: RESULT_FALSE};
    if (err_code) {
        result.errorcode = err_code;
    }
    if (err_msg) {
        result.msg = err_msg;
    }
    rest(res,result);
}

function rest(res, data){
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers","x-requested-with");	
    res.send(data);
}

module.exports = BaseService;