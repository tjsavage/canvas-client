var util = require('util');
var canvasModule = require('../canvas-module');
var gpio = require('gpio');

function SimpleButton(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	console.log("starting simple button");

	this.gpioPin = gpio.export(options.pin, {
		direction: "in",
		ready: this.registerHandlers.bind(this)
	});
}
util.inherits(SimpleButton, canvasModule.BaseModule);

SimpleButton.prototype.registerHandlers = function() {
	console.log("called registerHandlers");
	this.gpioPin.on("change", this.gpioChanged.bind(this));
	console.log("registered handlers");
};

SimpleButton.prototype.gpioChanged = function(val) {
	console.log("got value",val);
	if (val == 1) {
		this.emit("event", "on");
	} else {
		this.emit("event", "off");
	}
};

module.exports = SimpleButton;