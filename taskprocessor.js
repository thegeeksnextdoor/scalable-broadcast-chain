var MESSAGE_CPU_FREE = "FREE";
var MESSAGE_CPU_BUSY = "BUSY";
var app = require("http").createServer();
var io = require("socket.io")(app);
app.listen(8888);
var tasks = [];
var cpuSocket;
var cpu2Socket;
var adminSocket;

var cpuStatus = MESSAGE_CPU_FREE;

console.log("taskProcessor start to work");
/* Tasks are stored in a queue and automatically being processed 
 * if cpuStatus is "FREE" or there are tasks remained in the task
 * list after processed a task*/


// process the first task and remove it from the queue
function processingTask(){
	if (tasks.length !== 0){
		userProcessing = tasks.shift;
		cpuSocket.emit(userProcessing.type, userProcessing);
	} else {
		cpuStatus = MESSAGE_CPU_FREE;		
	}
}

io.on("connection", function(taskSocket){
// cpu is connected
	taskSocket.on("cpu", function(){
		cpuSocket = taskSocket;
	});

	taskSocket.on("cpu2", function(){
		cpuSocket = taskSocket;
	});

//	admin is connected
	taskSocket.on("admin", function(){
		adminSocket = taskSocket;
	});

	taskSocket.on("host", function(userData){
		tasks.push(userData);
//		TO DO: setTime out for cpu processing
		if (cpuStatus === MESSAGE_CPU_FREE){
			cpuStatus = MESSAGE_CPU_BUSY;
			userProcessing = tasks.shift();

			cpuSocket.emit("host", userProcessing);
		}
	});

	taskSocket.on("newUser", function(userData){
		tasks.push({
			type: "newUser",
			userName: userData.userName,
			host: userData.host
		});
//		TO DO: setTime out for cpu processing
		if (cpuStatus === MESSAGE_CPU_FREE){
			cpuStatus = MESSAGE_CPU_BUSY;
			userProcessing = tasks.shift();

			cpuSocket.emit("newUser", userProcessing);
		}
	});

	taskSocket.on("disconnectedUser", function(userData){
		tasks.push(userData);

		if (cpuStatus === MESSAGE_CPU_FREE){
			cpuStatus = MESSAGE_CPU_BUSY;
			userProcessing = tasks.shift();

			cpuSocket.emit("disconnectedUser", userProcessing);
		}
	});

	taskSocket.on("newPeerConnection", function(userData){
		console.log(userData.userName);
		console.log(userData.host);

//		TO DO: setTime out for cpu processing
		if (userData.userName !== null && userData.host !== null){
			adminSocket.emit("newPeerConnection", {
				type: "newPeerConnection",
				userName: userData.userName,
				host: userData.host
			});
		}
		processingTask();
	});

	taskSocket.on("deletePeerConnection", function(userData){	

		if (userData.child !== null){
			adminSocket.emit("deletePeerConnection", {
				type: "deletePeerConnection",
				peer: userData.peer,
				userName: userData.child
			});
		}
		
		if (userData.parent !== null){
			adminSocket.emit("deletePeerConnection", {
				type: "deletePeerConnection",
				peer: userData.peer,
				userName: userData.parent
			});
		}
	});
	
});