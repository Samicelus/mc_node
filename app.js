var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var utils = require('./libs/utils.js');
var compression = require('compression');

var app = express();
process.setMaxListeners(0);
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//var partials = require('express-partials');
//app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip + ' - - [' + utils.datetimeFormat() + '] ' + '"' + req.method + ' ' + req.url + ' - ' + req.statusCode + ' - "-" "-" "-"');
    console.log(utils.datetimeFormat() + ' [headers]:' + JSON.stringify(req.headers) + ' [params]:' + JSON.stringify(req.params) + '[body]:' + JSON.stringify(req.body));
    next();
});

const sessionConfig = require(utils.configDir + '/session.json');
const redisConfig = require(utils.configDir + '/redisConfig.json');

if (sessionConfig && sessionConfig.store && sessionConfig.store == 'redis') {
    console.log("---session store in redis---");
    app.use(session({
        secret: sessionConfig.secret,
        store: new RedisStore({
            host: redisConfig.ip,
            port: redisConfig.port,
            ttl: redisConfig.ttl
        }),
        cookie: {maxAge: sessionConfig.maxAge, secure: false},
        resave: false,
        saveUninitialized: true
    }));
} else {//tmp file
    console.log("---session store in tmp_file---");
    app.use(session({
        secret: sessionConfig.secret,
        cookie: {maxAge: sessionConfig.maxAge, secure: false},
        resave: false,
        saveUninitialized: true
    }));
}

require('./routes/route.js')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('404 Not Found：' + req.path);
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        res.render('error.ejs', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error.ejs', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
