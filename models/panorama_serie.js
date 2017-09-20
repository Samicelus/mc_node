var BaseModel = require('../libs/baseModel.js');
var model  = new BaseModel();

var _Schema = new model.Schema({
    up: String,
    down: String,
    left: String,
    right: String,
    panorama_url: String,
    panorama_id: String
},{versionKey: false});

model.schema =  model.mongoose.model('panoram_series', _Schema);	//collection名

module.exports = model;