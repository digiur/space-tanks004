// init libs
var express = require('express');
var path = require('path');
var app = express();

// static routing for page
app.use(express.static('dist'));
app.get('/', function (req, res) {
  console.log(__dirname + '/index.html');
  res.sendFile(path.join(__dirname + '/index.html'));
});

// listen for requests :)
var server = app.listen(process.env.PORT || 3033);
var io = require('socket.io').listen(server);

// Is this an object? WTF javascript?
// Is this an anonimous method?
io.on('connection', function (socket) {

  console.log("new connection: " + socket.id)

  socket.on('newShell', function (shellData) {
    socket.broadcast.emit('newShell', shellData);
    console.log("Shell broadcast");
  });

  socket.on('playerPosUpdate', function (playerPosData) {
    socket.broadcast.emit('playerPosUpdate', playerPosData);
  });
});

console.log('The server is out there...');
