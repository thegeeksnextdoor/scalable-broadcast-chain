var app = require("http").createServer();
var io = require("socket.io")(app);
//user stores all the sockets
var user = {};
//room stores all the room id
var room = {};
var admin;

app.listen(8080);

io.on("connection", function(socket){

	socket.on("login", function(userName){

		console.log("User " + userName + " logins");

		try {
			if (user[userName]){

				socket.emit("login", {
					type: "login",
					userName: userName,
					status: "fail"
				});

				console.log("Login unsuccessfully");
			} else{
				user[userName] = socket;
				user[userName].userName = userName;

				socket.emit("login", {
					type: "login",
					userName: userName,
					status: "success"
				});
			}}catch (e){
				console.log(e);
			}
	})

	socket.on("createRoom", function(roomId){
		try {
			if (room[roomId]){
				socket.emit("createRoom", {
					type: "createRoom",
					userName: socket.userName,
					room: roomId,
					status: "fail"
				});
			} else{
				room[roomId] = {};
				room[roomId].roomId = roomId;
				room[roomId].host = socket.userName;
				user[socket.userName].room = roomId; 
				user[socket.userName].join(roomId); 
				admin.emit("host", {
					type: "host",
					host: socket.userName
				});

				socket.emit("createRoom", {
					type: "createRoom",
					userName: socket.userName,
					room: roomId,
					status: "success"
				});

			}
		}catch (e){
			console.log(e);
		}
	})

	socket.on("joinRoom", function(roomId){
		try {
			if (room[roomId]){

				socket.emit("host", {
					type: "host",
					host: room[roomId].host
				});

				user[socket.userName].room = roomId;
				user[socket.userName].join(roomId); 

				admin.emit("newUser", {
					type: "newUser",
					userName: socket.userName,
					host:	room[roomId].host
				});

				socket.emit("joinRoom", {
					type: "joinRoom",
					userName: socket.userName,
					status: "success"
				});
			} else{
				socket.emit("joinRoom", {
					type: "joinRoom",
					userName: socket.userName,
					room: roomId,
					status: "fail"
				});

			}}catch (e){
				console.log(e);
			}
	})

	socket.on("SDPOffer", function(sdpOffer){

		console.log(sdpOffer.local + " is Sending offer to " + sdpOffer.remote);

		try {
			if (user[sdpOffer.remote]){
				user[sdpOffer.remote].emit("SDPOffer", {
					type: "SDPOffer",
					local: sdpOffer.remote,
					remote: sdpOffer.local,
					offer: sdpOffer.offer
				});
			}else{
				socket.emit("feedback", "Sending Offer: User does not exist or currently offline");
			}} catch(e){
				console.log(e);
			}
	})

	socket.on("SDPAnswer", function(sdpAnswer){
		console.log( sdpAnswer.remote + " is Receiving Answer from " + sdpAnswer.local);

		try {
			if (user[sdpAnswer.remote]){
				user[sdpAnswer.remote].emit("SDPAnswer",{
					type: "SDPAnswer",
					local: sdpAnswer.remote,
					remote: sdpAnswer.local,
					answer: sdpAnswer.answer
				});	

			}else{
				socket.emit("feedback", "Sending Answer: User does not exist or currently offline");
			}} catch(e){
				console.log(e);
			}
	})

	socket.on("candidate", function(iceCandidate){
		console.log("an ice candidate is transfered");
		console.log(iceCandidate.local);
		console.log(iceCandidate.remote);
		user[iceCandidate.remote].emit("candidate", {
			type: "candidate",
			local: iceCandidate.remote,
			remote: iceCandidate.local,
			candidate: iceCandidate.candidate
		});
	})

	socket.on("disconnect", function(){
		if (socket.userName){
			admin.emit("disconnectedUser", {
				type: "disconnectedUser",
				userName: socket.userName,
				host:	room[socket.room].host
			});
			socket.broadcast.to(socket.room).emit("disconnectedUser", socket.userName);
			user[socket.userName] = null;
		}
	})

	socket.on("newPeerConnection", function(userData){
		try {
			console.log("host is " + userData.host + " and username is " + userData.userName);
			user[userData.host].emit("initConnection", userData.userName);
			//	console.log("User " + command[1] + " initialise connection to user " + command[2]);
		} catch(e){
			console.log(e);
		}

	})

	socket.on("deletePeerConnection", function(userData){
		try {
			console.log("peer is " + userData.peer + " and username is " + userData.userName);
			user[userData.userName].emit("deleteConnection", userData.userName);
			//	console.log("User " + command[1] + " initialise connection to user " + command[2]);
		} catch(e){
			console.log(e);
		}
	})

	socket.on("admin", function(){
		try {
			admin = socket;
		} catch(e){
			console.log(e);
		}
	})

})
