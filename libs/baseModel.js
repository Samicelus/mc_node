'use strict';
var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require("mongoose"));
class BaseModel{
    constructor() {
        this.mongoose = mongoose;
        this.Schema = this.mongoose.Schema;
        this.ObjectId = this.Schema.ObjectId;
    };
}
module.exports = BaseModel;