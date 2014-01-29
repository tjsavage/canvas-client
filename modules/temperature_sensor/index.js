var util = require('util');
var canvasModule = require('../canvas-module');
var path = require('path');
var fs = require('fs');

function TemperatureSensor(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	this.deviceFilepath = options.deviceFilepath;
	this.readFrequency = options.readFrequency;

	this.on("connected", this.readTemperature.bind(this));
}
util.inherits(TemperatureSensor, canvasModule.BaseModule);

TemperatureSensor.prototype.celsiusToFahrenheit = function(c) {
	return c * 1.8 + 32.0;
};

TemperatureSensor.prototype.readTemperature = function() {
	fs.readFile(this.deviceFilepath, {encoding: "utf-8"}, function(err, data) {
		if (err) throw err;
		data = String(data);
		if (data.indexOf("YES") != -1) {
			var tempReadingIndex = data.indexOf("t=");
			var tempReading = parseInt(data.substring(tempReadingIndex + 2)) / 100.0;
			var fTemp = this.celsiusToFahrenheit(tempReading);
			this.emit("event", "temperature", {
				temperature: fTemp
			});
		}
	}.bind(this));
	if (this.readFrequency && this.readFrequency > 0) {
		setTimeout(this.readTemperature.bind(this), this.readFrequency);
	}
};

module.exports = TemperatureSensor;