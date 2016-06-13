var io = require('socket.io-client');
var cpuSocket = io.connect("http://localhost:8888");
var Room = require('./room2.js');
var userList = {};

cpuSocket.emit("cpu2");

console.log("cpu2 start to work");

cpuSocket.on("host", function(userData){
	console.log("Set Host " + userData.host);
	userList[userData.host] = new Room();
	userList[userData.host].addHost(userData.host, function(host){
		cpuSocket.emit("newPeerConnection", {
			type: "newPeerConnection",
			userName: host,
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
	if (userData.userName === userData.host){
		userList[userData.host] = null;
	}else{
		userList[userData.host].deleteUser(userData.userName, function(userName, host){
			/*	cpuSocket.emit("newPeerConnection", {
			type: "newPeerConnection",
			userName: userName,
			host: host
		});*/
			cpuSocket.emit("freeCPU");
		}, function(){
			cpuSocket.emit("deleteUserFailure", {
				type: "deleteUserFailure",
				userName: userData.userName,
			});
		});
	}
});
