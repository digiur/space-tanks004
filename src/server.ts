// imports
import EXP from "express";
import SOC from "socket.io";
import PATH from "path";

// static routing for page
const app = EXP();
app.use(EXP.static("dist"));

// listen for requests :)
const server = app.listen(process.env.PORT || 3033);
const io = SOC.listen(server);

// Is this an object? WTF javascript?
// Is this an anonymous method?
io.on("connection", function (socket) {
	console.log("new connection: " + socket.id);

	socket.on("newShell", function (shellData) {
		socket.broadcast.emit("newShell", shellData);
		console.log("new shell server-side")
	});
});

console.log("The server is out there...");
