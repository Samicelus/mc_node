var Promise = require('bluebird');
var utils = require('./utils.js');
var sqlite = require('sqlite');
var sqlite_config = require(utils.configDir + '/sqliteConfig.json');

Promise.all([
    sqlite.open(sqlite_config.db, { Promise })
]).then(function([authmeDb]){
    console.log('sqlite连接成功。');
});

module.exports = sqlite;






