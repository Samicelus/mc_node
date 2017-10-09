var BaseModel = require('../libs/baseModel.js');
var model  = new BaseModel();

var _Schema = new model.Schema({
    user_name: String,
    email: String,
    password: String
},{versionKey: false});

model.schema =  model.mongoose.model('users', _Schema);	//collection名

module.exports = model;