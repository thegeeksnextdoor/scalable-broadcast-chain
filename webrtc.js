var AllConnection = require('./allconnection.js');
var io = require('socket.io-client');

function WebRTC(server){
	var self = this;
	var user;
	var peer;
	this.allConnection = new AllConnection();;
	this.socket = io(server);

	//responde to different socket received from server

	self.socket.on("feedback", function(feedback) {
		document.getElementById("feedback").value = feedback;
	})

	//receive a sdp offer
	self.socket.on("SDPOffer", function(sdpOffer) {
		self.allConnection.onOffer(sdpOffer, function(){
			if (self.peer){
				self.allConnection.initConnection(self.peer);
			}
		});
	})

	//receive a sdp answer
	self.socket.on("SDPAnswer", function(sdpAnswer) {
		self.allConnection.onAnswer(sdpAnswer);
	})

	//receive an ice candidate
	self.socket.on("candidate", function(iceCandidate) {
		console.log("receive an ice candidate");
		self.allConnection.onCandidate(iceCandidate);
	})

	// when a user in the room disconnnected
	self.socket.on("disconnectedUser", function(disConnectedUserName) {
		console.log("user " + disConnectedUserName + " is disconnected");
		self.onUserDisconnect(disConnectedUserName);
		self.socket.emit("message", {
			type: "message",
			action: "leave",
			user: self.user,
			content: ""
		});
	})

	// initialize 1 way peer connection or start host's camera
	self.socket.on("initConnection", function(peer){
		if (self.user === peer){
			console.log("init camera");
			self.allConnection.initCamera(function(){
				/* setup camera before build connection	
				 * self.onHostSetup();
				 */
			});
		}else {		
			self.allConnection.initConnection(peer);
			self.peer = peer;
		}
	});

	// delete peer connection when peer left
	self.socket.on("deleteConnection", function(peer){
		self.allConnection.deleteConnection(peer);
		self.peer = null;
	});
	
	self.socket.on("message", function(messageData){
		console.log("received message");
		self.onMessage(messageData);
	});
}


//find more details of following api in readme
WebRTC.prototype.login = function(userName, successCallback, failCallback) {
	var self = this;
	this.socket.emit("login", userName);
	this.socket.on("login", function(loginResponse){
		if (loginResponse.status === "success") {
			self.user = loginResponse.userName;
			self.allConnection.init(loginResponse.userName, self.socket);
			successCallback();
		} else if (loginResponse.status === "fail") {
			failCallback();
		}
	});
}

WebRTC.prototype.createRoom = function(roomId, successCallback, failCallback){
	var self = this;
	this.socket.emit("createRoom", roomId);
	this.socket.on("createRoom", function(createRoomResponse){
		if (createRoomResponse.status === "success") {
			successCallback();
		} else if (createRoomResponse.status === "fail") {
			failCallback();
		}
	});
}

WebRTC.prototype.joinRoom = function(roomId, successCallback, failCallback) {
	var self = this;
	this.socket.emit("joinRoom", roomId);
	this.socket.on("joinRoom", function(joinRoomResponse){
		if (joinRoomResponse.status === "success") {
			self.socket.emit("message", {
				type: "message",
				action: "join",
				user: self.user,
				content: ""
			});
			successCallback();
		} else if (joinRoomResponse.status === "fail") {
			failCallback();
		}
	});
}

WebRTC.prototype.onUserDisconnect = function(userDisconnected){
}

WebRTC.prototype.sendChatMessage = function(chatMessage){
	var self = this;
	self.socket.emit("message", {
		type: "message",
		action: "chat",
		user: self.user,
		content: chatMessage
	})
}

WebRTC.prototype.onMessage = function(messageData){
}

/*
WebRTC.prototype.onHostSetup = function(){
}
 */

module.exports = WebRTC;