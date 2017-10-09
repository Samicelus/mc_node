var BaseModel = require('../libs/baseModel.js');
var model  = new BaseModel();

var _Schema = new model.Schema({
    user_name: String,
    email: String,
    password: String,
    is_valid: Boolean,          //帐号的激活状态
    max_page: Number,           //最大可以建立的场景数
    max_panorama: Number        //每个场景最多容纳的全景图数
},{versionKey: false});

model.schema =  model.mongoose.model('users', _Schema);	//collection名

module.exports = model;