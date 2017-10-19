
var express = require('express');
var socket_app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var socketServer = require('http').Server(socket_app);
var io = require('socket.io')(socketServer);
var socketPort = require(utils.configDir + '/serverConfig.json').socket_port;
socket_app.use(bodyParser.json());
socket_app.use(bodyParser.urlencoded({ extended: false }));
socket_app.use(cookieParser());
socket_app.set('port', socketPort);
var role_handler = require('./role_service.js');


//socket连接
io.on( "connection", function( socket ){
    socket.emit('conn',socket.id);
    socket.on('put_role',function(data){
        role_handler.putRole(socket, data);
    });
    socket.on('disconnect', function(){
    });
});

socketServer.listen(socketPort,function(){
    console.log('正在监听'+socketPort+'端口');
});
