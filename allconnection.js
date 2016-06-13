var PeerConnection = require('./peerconnection.js');
var Indicator = require('./indicator.js');

function AllConnection(){
	var local;
	var stream;
	var socket;
	this.connection = {};
	this.indicator = new Indicator();
	var localVideo;
}

//initialise the setup of AllConnection
AllConnection.prototype.init = function(user, socket){
	this.local = user;
	this.socket = socket;
}

//initialise the setup of own camera
AllConnection.prototype.initCamera = function(cb){
	this.localVideo = document.getElementById("localVideo");
	this.localVideo.autoplay = true;
//	To Do: Problem: create 2 video when 2 users enter simultaneously
	if (!localVideo.src){
		var self = this;
		if (this.indicator.hasUserMedia()) {
			navigator.getUserMedia({ video: true, audio: true }, function (stream) {
				self.localVideo.src = window.URL.createObjectURL(stream);
				self.stream = stream;
				console.log("stream is ");
				console.log(stream);
				cb();
			}, function (error) {
				console.log(error);
			});
		} else {
			alert("Sorry, your browser does not support WebRTC.");
		}
	}
	else {
		console.log(this.stream);
		cb();
	}
}

//initialise a connection with peers
AllConnection.prototype.initConnection = function(peer){	
	var self = this;
	self.connection[peer] = new PeerConnection(self.local, peer, self.socket, self.localVideo);
	self.initCamera(function(){
		self.connection[peer].startConnection(function(){
			console.log("initiate connection");
			self.connection[peer].hostSetupPeerConnection(peer, self.stream, function(){
				self.connection[peer].makeOffer( function(offer){
					console.log("send offer to " + peer);
					self.socket.emit("SDPOffer", {
						type: "SDPOffer",
						local: self.local,
						remote: peer,
						offer: offer
					});
				});
			});
		});
	});
}

//when receive an spd offer
AllConnection.prototype.onOffer = function(sdpOffer, cb){
	var self = this;
	self.localVideo = document.getElementById("localVideo");
	self.localVideo.autoplay = true;
	peer = sdpOffer.remote;
	self.connection[peer] = new PeerConnection(self.local, peer, self.socket, self.localVideo);
	self.connection[peer].startConnection(function(){
		self.connection[peer].visitorSetupPeerConnection(peer, function(stream){
			self.stream = stream;
			cb();
		}, function(){
			self.connection[sdpOffer.remote].receiveOffer(sdpOffer, function(sdpAnswer){
				self.socket.emit("SDPAnswer", {
					type: "SDPAnswer",
					local: self.local,
					remote: sdpOffer.remote,
					answer: sdpAnswer
				});
			});
		});
	});
}

//when receive an spd answer
AllConnection.prototype.onAnswer = function(sdpAnswer){
	this.connection[sdpAnswer.remote].receiveAnswer(sdpAnswer);
}

//when receive an ice candidate
AllConnection.prototype.onCandidate = function(iceCandidate){
	this.connection[iceCandidate.remote].addCandidate(iceCandidate);
}

AllConnection.prototype.deleteConnection = function(peer){
	self.connection[peer] = null;
}

module.exports = AllConnection;
