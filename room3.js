function Node(userName) {
	this.userName = userName;
	this.next = null;
}

function Room2() {
	this._length = 0;
	this.head = null;
}

Room2.prototype.addHost = function(userName, successCallback, failCallback) {
	try {
		var node = new Node(userName);
		var currentNode = this.head;

		this.head = node;
		this._length++;
		successCallback(node.userName);
		console.log("from room " + node.userName);

	}catch (e){
		console.log(e);
		failCallback();
	}
}

Room2.prototype.addUser = function(userName, successCallback, failCallback) {
	try {
		var node = new Node(userName);
		var currentNode = this.head;

		while (currentNode.next) {			
			parentNode = currentNode;
			currentNode = currentNode.next;
		}		
		currentNode.next = node;
		this._length++;
		successCallback(node.userName, this.head.userName);
	}catch (e){
		console.log(e);
		failCallback();
	}
};

Room2.prototype.deleteUser = function(userName, successCallback, failCallback) {
	var currentNode = this.head;
	var parentNode = currentNode;
	if (userName === currentNode.userName){
		this.Room2 = null;
		failCallback();
	}

	while (userName !== currentNode.userName) {
		parentNode = currentNode;
		currentNode = currentNode.next;
	}

	parentNode.next = currentNode.next;
	currentNode = null;
	successCallback(parentNode.next.userName, this.head.userName);
};

module.exports = Room2;