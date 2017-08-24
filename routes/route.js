var importer = require('../libs/importer')();

module.exports = function(app){

	app.route('/test').get(function(req, res, next){
		res.send('it works!');
	});

	//自动加载routes目录下所有路由
	var routes = importer('./routes');
	for(var key in routes){
		if(key !== 'route'){
			var routeClass = routes[key];
			routeClass(app);
		}
	}
}