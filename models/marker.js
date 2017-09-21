var BaseModel = require('../libs/baseModel.js');
var model  = new BaseModel();

var _Schema = new model.Schema({
    marker: Object,
    panorama_id: String
},{versionKey: false});

model.schema =  model.mongoose.model('markers', _Schema);	//collection名

module.exports = model;