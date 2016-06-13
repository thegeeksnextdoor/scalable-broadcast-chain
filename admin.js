var io = require('socket.io-client');
var signalSocket = io.connect("http://localhost:8080");
var taskSocket = io.connect("http://localhost:8888");

signalSocket.emit("admin");
taskSocket.emit("admin");
console.log("admin start to work");

signalSocket.on("host", function(userData){
	console.log(userData.host);
	taskSocket.emit("host", userData);
});

signalSocket.on("newUser", function(userData){
	taskSocket.emit("newUser", userData);
});

signalSocket.on("disconnectedUser", function(userData){
	taskSocket.emit("disconnectedUser", userData);
});

taskSocket.on("newPeerConnection", function(userData){
	signalSocket.emit("newPeerConnection", userData);
})

taskSocket.on("deletePeerConnection", function(userData){
	signalSocket.emit("deletePeerConnection", userData);
})
