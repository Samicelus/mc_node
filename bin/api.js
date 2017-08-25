#!/usr/bin/env node

/**
 * Module dependencies.
 */
var app = require('../app');
var http = require('http');
var utils = require('../libs/utils.js');
var serverPort = require(utils.configDir + '/serverConfig.json').port;

global.Cron = require('../services/cron.js')();
/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(serverPort || '8050');
app.set('port', port);

/**
 * Create HTTP server.
 */

var querystring = require('querystring');


var socketServer = require('http').Server(app);
var io = require('socket.io')(socketServer); 

//socket连接
io.on( "connection", function( socket ){
	//console.log('a user connected');
	var cid = "";			//咨询id
	var userType = "";		//用户类型	
	var name = "";			//用户名称
	//连接后要求用户注册	
	socket.emit('conn',socket.id);	
	//web端注册
	socket.on('reg',function(data){
		cid = data.cid;
		userType = data.userType;
		name = data.name;
		//console.log(cid);
		client.hmset("cid:"+cid, userType, socket.id, function(err,res){
			//console.log("res:"+res);
			socket.emit('reg_success',socket.id);
			//发送上线消息
			var obj = new Object();
			obj.from = '[系统]';
			obj.msg = ((userType == 'doctor')?'医生':'患者')+': '+name+' 已上线';
			obj.cid = cid;
			obj.type = 'system';
			var target = (userType == 'doctor')?'patient':'doctor';
			client.hgetall("cid:"+cid, function (err, cid) {
				try{
				    var socketid = cid[target];
				    io.to(socketid).emit('msg',obj);
					}catch(e){
						console.log(e);
						}
				});
			});
		});
		
	//web端动作
	socket.on('sendMsg', function(data){
		var obj = new Object();
		obj.from = name;
		obj.type = data.type;
		obj.msg = data.msg;
		obj.userType = userType;
		var nonestr = data.nonestr;
		obj.cid = cid;
		var target = (userType == 'doctor')?'patient':'doctor';
		recordMsg(obj);
		client.hgetall("cid:"+cid, function (err, cid) {
			try{
			    var socketid = cid[target];
			    io.to(socketid).emit('msg',obj);
			    var retsocketid = cid[userType];
			    io.to(retsocketid).emit('msg_success',nonestr);
				}catch(e){
					console.log(e);
					}
			});	
		});
			
	socket.on('disconnect', function(){
		//向义幻发送医生离线消息
		var obj = new Object();
		obj.from = '[系统]';
		obj.type = 'system';
		obj.msg = ((userType == 'doctor')?'医生':'患者')+': '+name+'已下线';
		obj.cid = cid;
		var target = (userType == 'doctor')?'patient':'doctor';
		client.hgetall("cid:"+cid, function (err, cid) {
			try{
			    var socketid = cid[target];
			    io.to(socketid).emit('msg',obj);
				}catch(e){
					console.log(e);
					}
			});				
		});
});

socketServer.listen(port,function(){
    console.log('正在监听'+port+'端口');
	});
socketServer.on('error', onError);
socketServer.on('listening', onListening);


function recordMsg(obj){
	var strData = querystring.stringify(obj);
		var options = {
		  hostname: '127.0.0.1',
		  port: port,
		  path: '/psy/createChatLog',
		  method: 'POST',
		  headers: {
		    'Content-Type': 'application/x-www-form-urlencoded',
		    'Content-Length': strData.length
		  }
		};
		utils.http(options,strData,function(err,msg){
			if(err){
				console.log(err);
				}else{
					//console.log(msg);
					}
			});	
	}
	
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    	}
    if (port >= 0) {
        // port number
        return port;
    	}
    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = socketServer.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);

    //初始化定时任务
    Cron.init();
}
