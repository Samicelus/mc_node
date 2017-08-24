var moment = require('moment');
var utils = {};

utils.datetimeFormat = function (time) {
    var res = moment(time).format('YYYY-MM-DD HH:mm:ss');
    return res == 'Invalid date' ? '' : res;
};
utils.moment = moment;

utils.configDir = (function () {
    var path = process.cwd() + '/config.dev';
    if (utils.env == 'production') {
        path = process.cwd() + '/config.production';
    }
    return path;
})();

module.exports = utils;