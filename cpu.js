var io = require('socket.io-client');
var cpuSocket = io.connect("http://localhost:8888");
var Room = require('./room.js');
var userList = {};

cpuSocket.emit("cpu");

console.log("cpu start to work");
/*	Create new room according to host name or join 
 * a existing room if a new user enter. Delete an existing 
 * user in the room if it is disconnected*/

cpuSocket.on("host", function(userData){
	console.log("Set Host " + userData.host);
	if (!userList[userData.host]){
		userList[userData.host] = new Room();
	}
	userList[userData.host].addHost(userData.host, function(userName, host){
		cpuSocket.emit("newPeerConnection", {
			type: "newPeerConnection",
			userName: userName,
			host: host
		});
		console.log(host)
	}, function(){
		console.log("add host failed");
		cpuSocket.emit("addHostFailure", {
			type: "addHostFailure",
			userName: userData.userName
		});
	});
});

cpuSocket.on("newUser", function(userData){
	console.log("add user " + userData.userName);
	userList[userData.host].addUser(userData.userName, function(userName, host){
		cpuSocket.emit("newPeerConnection", {
			type: "newPeerConnection",
			userName: userName,
			host: host
		});
	}, function(){
		console.log("add user failed");
		cpuSocket.emit("addUserFailure", {
			type: "addUserFailure",
			userName: userData.userName
		});
	});
});

cpuSocket.on("disconnectedUser", function(userData){
	console.log("start to work");

	userList[userData.host].deleteUser(userData.userName, function(userName, host){
		
		cpuSocket.emit("deletePeerConnection", {
			type: "deletePeerConnection",
			peer: userData.userName,
			child: userName,
			parent: host
		});

		cpuSocket.emit("newPeerConnection", {
			type: "newPeerConnection",
			userName: userName,
			host: host
		});
	}, function(){
		cpuSocket.emit("deleteUserFailure", {
			type: "deleteUserFailure",
			userName: userData.userName,
		});
	});
});
