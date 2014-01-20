var util = require('util');
var canvasModule = require('../canvas-module');

function LedStrip(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;

	this.on("turnOn", this.turnOn.bind(this));
	this.on("turnOff", this.turnOff.bind(this));
}
util.inherits(LedStrip, canvasModule.BaseModule);

LedStrip.prototype.turnOn = function() {
	console.log('led turn on');
	this.emit("event", "turnedOn");
};

LedStrip.prototype.turnOff = function() {
	console.log('led turn off');
	this.emit("event", "turnedOff");
};

module.exports = LedStrip;