var util = require("util");
var Animation = require("./animation");

var STEPS = 100;

function Pulse(setter, duration, options, onFinish) {
	Animation.call(this, setter, duration, options, onFinish);

	this.minValue = 0;
	this.maxValue = 1;
	if (typeof options.minValue != "undefined") {
		this.minValue = options.minValue;
	}
	if (typeof options.maxValue != "undefined") {
		this.maxValue = options.maxValue;
	}
}
util.inherits(Pulse, Animation);

Pulse.prototype.refresh = function(percentComplete) {
	var angle = (Math.PI * 2) * percentComplete;
	var value = (Math.sin(angle)) / (2.0) * (this.maxValue - this.minValue) + this.minValue + (this.maxValue - this.minValue) / 2.0;
	this.setter.setValue(value);
	this.setter.emitState();
	this.setter.all();
};


module.exports = Pulse;