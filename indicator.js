function Indicator(){}

//indicate whether the browser supports user media
Indicator.prototype.hasUserMedia = function(){
	navigator.getUserMedia = navigator.getUserMedia ||
	navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
	navigator.msGetUserMedia;
	return !!navigator.getUserMedia;
}

//indicate whether the browser supports RTCPeerConnection
Indicator.prototype.hasRTCPeerConnection = function() {
	window.RTCPeerConnection = window.RTCPeerConnection ||
	window.webkitRTCPeerConnection || window.mozRTCPeerConnection
	window.RTCSessionDescription = window.RTCSessionDescription
	window.webkitRTCSessionDescription ||
	window.mozRTCSessionDescription;
	window.RTCIceCandidate = window.RTCIceCandidate ||
	window.webkitRTCIceCandidate || window.mozRTCIceCandidate;
	return !!window.RTCPeerConnection;
}

module.exports = Indicator;