/* An api to allow cpu to add host, add user or delete
 * user in a specific room. The structure of user list 
 * in a room is linked list*/

function Node(userName) {
	this.userName = userName;
	this.next = null;
}

function Room() {
	this._length = 0;
	this.head = null;
}

Room.prototype.addHost = function(userName, successCallback, failCallback) {
	try {
		if (!this.head){
			var node = new Node(userName);
			this.head = node;
			console.log("head is null");
			successCallback(node.userName, node.userName);
		}else {
			console.log("head is not null");
			childNode = this.head.next;
			console.log(childNode.userName);
			var node = new Node(userName);
			node.next = childNode;
			this.head = node;
			successCallback(childNode.userName, node.userName);
		}
	}catch (e){
		console.log(e);
		failCallback();
	}
}

Room.prototype.addUser = function(userName, successCallback, failCallback) {
	try {
		var node = new Node(userName);
		var currentNode = this.head;

		while (currentNode.next) {			
			parentNode = currentNode;
			currentNode = currentNode.next;
		}		
		currentNode.next = node;
		this._length++;
		successCallback(node.userName, currentNode.userName);
	}catch (e){
		console.log(e);
		failCallback();
	}
};

Room.prototype.deleteUser = function(userName, successCallback, failCallback) {
	try {
		var currentNode = this.head;
		var parentNode = currentNode;

		if (userName === currentNode.userName){
			childNode = this.head.next;
			this.head.userName = null;
			successCallback(childNode.userName, null);
		}
		else{
			while (userName !== currentNode.userName) {
				parentNode = currentNode;
				currentNode = currentNode.next;
			}

			this._length--;
			parentNode.next = currentNode.next;
			currentNode = null;
			if (parentNode.next === null){
				successCallback(null, parentNode.userName);
			} else{
				successCallback(parentNode.next.userName, parentNode.userName);
			}
		}
	}catch(e){
		console.log(e);
		failCallback();
	}
};

module.exports = Room;