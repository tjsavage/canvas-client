var util = require('util');
var canvasModule = require('../canvas-module');

function Thermostat(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	this.temperatureSensor = options.temperatureSensor;
	this.onOff = options.onOff;
	
	this.state = "off";
}
util.inherits(Thermostat, canvasModule.BaseModule);

module.exports = Thermostat;