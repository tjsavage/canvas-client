var util = require('util');
var canvasModule = require('../canvas-module');
var gpio = require('gpio');

function SimpleToggle(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	this.state = "off";

	this.gpioPin = gpio.export(options.pin, {
		direction: "in",
		ready: this.registerHandlers.bind(this)
	});
}
util.inherits(SimpleToggle, canvasModule.BaseModule);

SimpleToggle.prototype.registerHandlers = function() {
	this.gpioPin.on("change", this.gpioChanged.bind(this));
};

SimpleToggle.prototype.gpioChanged = function(val) {
	if (val == 1) {
		if (this.state == "off") {
			this.state = "on";
			this.emit("event", "on");
		} else if (this.state == "on") {
			this.state = "off";
			this.emit("event", "off");
		}
	}
};

module.exports = SimpleToggle;