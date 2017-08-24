var BaseModel = require('../libs/baseModel.js');
var model  = new BaseModel();

var _Schema = new model.Schema({
    param: String
},{versionKey: false});

model.schema =  model.mongoose.model('test_model', _Schema);	//collection名

module.exports = model;