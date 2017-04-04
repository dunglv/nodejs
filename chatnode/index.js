var express = require('express');
var app = express();
var port = 3000;

// Loading View Engine
app.set('view engine', 'pug');
app.set('views', './views');
app.get('/', function(req, res){
	res.render('home');
});

// Declare Public Folder
app.use(express.static(__dirname+'/public'));

// Declare IO SOcket
var io = require('socket.io').listen(app.listen(port));
io.sockets.on('connection', function(socket){
	socket.emit('message', {message:'Welocome to bot chat'});
	socket.on('send', function(data){
		io.sockets.emit('message', data);
	});
});

