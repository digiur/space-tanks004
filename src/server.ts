// imports
import EXP from 'express';
import SOC from 'socket.io';
import PATH from 'path';

// static routing for page
var app = EXP();
app.use(EXP.static('dist'));
app.get('/', function (req, res) {
	res.sendFile(PATH.join(__dirname + '/src/index.html'));
});

// listen for requests :)
var server = app.listen(process.env.PORT || 3033);
var io = SOC.listen(server);

// Is this an object? WTF javascript?
// Is this an anonimous method?
io.on('connection', function (socket) {

	console.log("new connection: " + socket.id)

	socket.on('newShell', function (shellData) {
		socket.broadcast.emit('newShell', shellData);
	});

	socket.on('playerPosUpdate', function (playerPosData) {
		socket.broadcast.emit('playerPosUpdate', playerPosData);
	});
});

console.log('The server is out there...');
