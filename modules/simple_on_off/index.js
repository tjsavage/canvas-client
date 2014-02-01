var util = require('util');
var canvasModule = require('../canvas-module');
var gpio = require('gpio');

function SimpleOnOff(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;

	this.gpioPin = gpio.export(options.pin, {
		direction: "out",
		ready: this.registerHandlers.bind(this)
	});
}
util.inherits(SimpleOnOff, canvasModule.BaseModule);

SimpleOnOff.prototype.registerHandlers = function() {
	this.on("action:turnOn", this.turnOn.bind(this));
	this.on("action:turnOff", this.turnOff.bind(this));
};

SimpleOnOff.prototype.turnOn = function() {
	this.gpioPin.set(function() {
		this.emit("event", "turnedOn");
	}.bind(this));
};

SimpleOnOff.prototype.turnOff = function() {
	this.gpioPin.set(0, function() {
		this.emit("event", "turnedOff");
	}.bind(this));
};

module.exports = SimpleOnOff;