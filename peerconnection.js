
function PeerConnection(local, peer, socket, localVideo){
	var p2pConnection;
	var indicator;
	this.user = local;
	this.remote = peer;
	this.socket = socket;
	this.localVideo = localVideo;
	this.configuration = {
			"iceServers": [{ "url": "stun:stun.1.google.com:19302"
			}]
	};
	console.log("local video is " + localVideo);
}

//Visitor setup the p2p connection with a peer
PeerConnection.prototype.visitorSetupPeerConnection = function(peer, streamCallback, cb) {
	var self = this;
	// Setup stream listening
	console.log("listen to stream");
	this.p2pConnection.onaddstream = function (e) {
		self.localVideo.src = window.URL.createObjectURL(e.stream);
		streamCallback(e.stream);
	};

	

//	Setup ice handling
	console.log("start ice handling");
	this.p2pConnection.onicecandidate = function (event) {
		if (event.candidate) {
			console.log(event.candidate);
			self.socket.emit("candidate", {
				type: "candidate",
				local: self.user,
				remote: peer,
				candidate: event.candidate
			});
		}
	};
	cb();
}

//Host setup the p2p connection with a peer
PeerConnection.prototype.hostSetupPeerConnection = function(peer, stream, cb) {
	var self = this;
	// Add stream
	this.p2pConnection.addStream(stream);

	// Setup ice handling
	this.p2pConnection.onicecandidate = function (event) {
		if (event.candidate) {
			console.log("send an ice candidate");
			console.log(event.candidate);
			self.socket.emit("candidate", {
				type: "candidate",
				local: self.user,
				remote: peer,
				candidate: event.candidate
			});
		}
	};
	cb();
}

//initialise p2pconnection at the start of a peer connection 
PeerConnection.prototype.startConnection = function(cb){
	this.p2pConnection = new RTCPeerConnection(this.configuration);
	cb();
}

//make an sdp offer
PeerConnection.prototype.makeOffer = function(cb)	{
	var self = this;
	this.p2pConnection.createOffer(function (sdpOffer) {
		sdpOffer.sdp = sdpOffer.sdp.replace(/a=sendrecv/g,"a=sendonly");
		self.p2pConnection.setLocalDescription(sdpOffer);
		cb(sdpOffer);
	}, function(error){
		console.log(error);
	});
}

//receive an sdp offer and create an sdp answer
PeerConnection.prototype.receiveOffer = function(sdpOffer, cb){
	var self = this;
	var SDPOffer = new RTCSessionDescription(sdpOffer.offer);
	this.p2pConnection.setRemoteDescription(SDPOffer, function(){
		self.p2pConnection.createAnswer(function (answer) {
			answer.sdp = answer.sdp.replace(/a=sendrecv/g,"a=recvonly");
			self.p2pConnection.setLocalDescription(answer);
			console.log(self.p2pConnection.localDescription);
			console.log(self.p2pConnection.remoteDescription);
			cb(answer);
		},function(error){
			console.log(error);
		});
	}, function(){});
}

//receive an spd answer
PeerConnection.prototype.receiveAnswer = function(sdpAnswer){
	var SDPAnswer = new RTCSessionDescription(sdpAnswer.answer);
	this.p2pConnection.setRemoteDescription(SDPAnswer,function(){}, function(){});
	console.log(this.p2pConnection.localDescription);
	console.log(this.p2pConnection.remoteDescription);
}

//add ice candidate when receive one
PeerConnection.prototype.addCandidate = function(iceCandidate) {
	this.p2pConnection.addIceCandidate(new RTCIceCandidate(iceCandidate.candidate));
}

module.exports = PeerConnection;