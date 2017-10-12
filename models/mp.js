var BaseModel = require('../libs/baseModel.js');
var model  = new BaseModel();

var _Schema = new model.Schema({
    app_name: String,
    weixin: Object
},{versionKey: false});

model.schema =  model.mongoose.model('mps', _Schema);	//collection名

module.exports = model;