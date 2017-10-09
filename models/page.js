var BaseModel = require('../libs/baseModel.js');
var model  = new BaseModel();

var _Schema = new model.Schema({
    page_name: String,
    user_id: String
},{versionKey: false});

model.schema =  model.mongoose.model('pages', _Schema);	//collection名

module.exports = model;