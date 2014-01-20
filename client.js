var io = require('socket.io-client');
var util = require('util');
var events = require('events');

function CanvasClient(options) {
	events.EventEmitter.call(this);

	this.name = options.name;
	this.moduleName = options.moduleName;
	this.port = options.port;
	this.serverIP = options.serverIP;
	this.serverPort = options.serverPort;
	this.options = options;

	var Module = require("./modules/" + this.moduleName);
	this.module = new Module(this.options);
	this.socket = null;
}
util.inherits(CanvasClient, events.EventEmitter);

CanvasClient.prototype.connect = function(callback) {
	console.log("connecting",this.name,"...");
	this.socket = io.connect(this.serverIP, {
		port: this.serverPort,
		transports: ['websocket'],
		'force new connection': true
	});

	this.socket.on('connect', function(){
		console.log('socket client connected:',this.name);
		this.socket.on('event', this.onEvent.bind(this));
		this.socket.on('action', this.onAction.bind(this));
		this.socket.on('state', this.onState.bind(this));
		this.socket.on('update', this.onUpdate.bind(this));

		this.module.on('event', this.emitEvent.bind(this));
		this.module.on('action', this.emitAction.bind(this));
		this.module.on('state', this.emitState.bind(this));
		this.module.on('update', this.emitUpdate.bind(this));

		if (callback) {
			callback();
		}
	}.bind(this));
};

CanvasClient.prototype.disconnect = function() {
	this.socket.disconnect();
};

CanvasClient.prototype.onEvent = function(message) {
	console.log(this.name,"onEvent",message);
};

CanvasClient.prototype.onAction = function(message) {
	console.log("action",message);
	if (message.to === this.name) {
		this.module.emit(message.action, message.data);
	}
};

CanvasClient.prototype.onState = function(message) {
	console.log("state",message);
};

CanvasClient.prototype.onUpdate = function(message) {
	console.log("update");
};

CanvasClient.prototype.emitEvent = function(event, eventData) {
	var message = {
		from: this.name,
		event: event,
		data: eventData
	};
	console.log(this.name,"emitEvent",message);
	this.socket.emit("event", message);
};

CanvasClient.prototype.emitAction = function(to, action, data) {
	var message = {
		from: this.name,
		to: to,
		action: action,
		data: data
	};
	console.log(this.name,"emitAction",message);
	this.socket.emit("action", message);
};

CanvasClient.prototype.emitState = function(message) {
};

CanvasClient.prototype.emitUpdate = function(message) {
};

CanvasClient.prototype.socketEmit = function(name, message) {
	console.log("emit",name,message);
	if (!this.socket) {
		console.log("client has no socket - did you run connect()?");
	}
	this.socket.emit(name, message);
};

CanvasClient.prototype.socketListen = function(name, callback) {
	if (!this.socket) {
		console.log("client has no socket - did you run connect()?");
	}
	this.socket.on(name, callback);
};


module.exports = CanvasClient;