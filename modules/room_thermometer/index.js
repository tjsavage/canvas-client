var util = require('util');
var canvasModule = require('../canvas-module');

function RoomThermometer(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	this.readFrequency = options.readFrequency;
	this.temperatureSensors = options.temperatureSensors;
	this.latestReadings = {};
	
	this.on("event:temperature", this.receivedTemperature.bind(this));
	this.on("action:readTemperature", this.requestTemperature.bind(this));
}
util.inherits(RoomThermometer, canvasModule.BaseModule);

RoomThermometer.prototype.requestTemperature = function() {
	for(var sensorIndex in this.temperatureSensors) {
		var tempSensor = this.temperatureSensors[sensorIndex];
		this.emit("action", tempSensor, "readTemperature");
	}
};

RoomThermometer.prototype.receivedTemperature = function(message) {
	console.log(message.from,this.temperatureSensors);
	if (this.temperatureSensors.indexOf(message.from) > -1) {
		console.log("in it");
		this.latestReadings[message.from] = message.data.temperature;

		this.calculateRoomTemperature();
	}
};

RoomThermometer.prototype.calculateRoomTemperature = function() {
	var sum = 0.0;
	for (var sensor in this.latestReadings) {
		sum += this.latestReadings[sensor];
	}

	var temp = sum / Object.keys(this.latestReadings).length;
	this.emit("event", "temperature", {
		temperature: temp
	});
}

module.exports = RoomThermometer;