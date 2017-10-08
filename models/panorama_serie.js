var BaseModel = require('../libs/baseModel.js');
var model  = new BaseModel();

var _Schema = new model.Schema({
    x: Number,
    y: Number,
    z: Number,
    page_id: String,
    panorama_url: String,
    title: String,
    content: String,
    init_position: Object
},{versionKey: false});

model.schema =  model.mongoose.model('panoram_series', _Schema);	//collection名

module.exports = model;