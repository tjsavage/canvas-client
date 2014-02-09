var util = require('util');
var canvasModule = require('../canvas-module');
var gpio = require('gpio');

function SimpleOnOff(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	this.status = "off";

	this.gpioPin = gpio.export(options.pin, {
		direction: "out",
		ready: this.registerHandlers.bind(this)
	});
}
util.inherits(SimpleOnOff, canvasModule.BaseModule);

SimpleOnOff.prototype.registerHandlers = function() {
	this.on("action:turnOn", this.turnOn.bind(this));
	this.on("action:turnOff", this.turnOff.bind(this));
	this.on("action:toggle", this.toggle.bind(this));
};

SimpleOnOff.prototype.turnOn = function() {
	console.log("turning on");
	this.gpioPin.set(function() {
		this.emit("event", "turnedOn");
	}.bind(this));
	this.status = "on";
};

SimpleOnOff.prototype.turnOff = function() {
	console.log("turning off");
	this.gpioPin.set(0, function() {
		this.emit("event", "turnedOff");
	}.bind(this));
	this.status = "off";
};

SimpleOnOff.prototype.toggle = function() {
	if (this.status == "off") {
		this.turnOn();
	} else {
		this.turnOff();
	}
};

module.exports = SimpleOnOff;