var util = require('util');
var canvasModule = require('../canvas-module');
var gpio = require('gpio');

function MotionDetector(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;

	this.gpioPin = gpio.export(options.pin, {
		direction: "in",
		ready: this.registerHandlers.bind(this)
	});
}
util.inherits(MotionDetector, canvasModule.BaseModule);

MotionDetector.prototype.registerHandlers = function() {
	this.gpioPin.on("change", this.gpioChanged.bind(this));
};

MotionDetector.prototype.gpioChanged = function(val) {
	if (val == 1) {
		this.emit("event", "tripped");
	} else {
		this.emit("event", "reset");
	}
};

module.exports = MotionDetector;