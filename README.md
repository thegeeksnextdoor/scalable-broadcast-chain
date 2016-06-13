## Scalable broadcast

## Installation
```
npm install
```

## Bundle
```
double click bundle.bat
```

## Test
```
double click test.bat
```

## Current limitation
All user who join the room will be automatically linked to 
the host.
Client cannot send any special command to the server.

## To login with callback
```javascript
webrtc.login(userName, successCallback, failCallback);
```

## To create a new room with callback(will be set as the default host)
```javascript
webrtc.createRoom(roomName, successCallback, failCallback);
```

## To join a new room with callback
```javascript
webrtc.joinRoom(roomName, successCallback, failCallback);
```
