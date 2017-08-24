var BaseModel = require('../libs/baseModel.js');
var model  = new BaseModel();

var _Schema = new model.Schema({
    type: String,			//1-bag 2-money 3-task
    item_name: String,
    item_quatity: Number,
    item_property: Object,
    belonging_id: String
},{versionKey: false});

model.schema =  model.mongoose.model('psedo_item', _Schema);	//collection名

module.exports = model;