
/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes');

var app = module.exports = express.createServer();
io = require('socket.io')(app)
// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get("/hi",function(req,res){
	res.write("hi lcs");
	res.end();
});
;

io.on("connection",(function(){
	var socketMap = {};
	app.post("/upload",function(req,res){
		for( var id in socketMap ){
			socketMap[id].emit("data",req.body.data)
		}
		res.write("uploaded");
		res.end();
	});
	return function(socket){
		socketMap[socket.id] = socket;
		socket.on("disconnect",function(){
			delete socketMap[socket.id];
		});
	}
})());

app.listen(9595, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
