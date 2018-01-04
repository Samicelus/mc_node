var BaseModel = require('../libs/baseModel.js');
var model  = new BaseModel();

var _Schema = new model.Schema({
    user_name: {type:String, required:true, unique:true},
    avatar: String,
    password: String,
    user_info: Object,
},{versionKey: false});

model.schema =  model.mongoose.model('activity_users', _Schema);	//collection名

module.exports = model;