var util = require('util');
var canvasModule = require('../canvas-module');
var spi = require('spi');
var LightStrips = require('./LPD8806').LightStrips;

function LedStrip(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;

	var spiDevice = new spi.Spi('/dev/spidev0.0', {});
	this.lights = new LightStrips('/dev/spidev0.0', options.leds, spiDevice);

	this.on("turnOn", this.turnOn.bind(this));
	this.on("turnOff", this.turnOff.bind(this));
}
util.inherits(LedStrip, canvasModule.BaseModule);

LedStrip.prototype.turnOn = function() {
	console.log('led turn on');
	this.lights.all(255, 255, 255);
	this.lights.sync();
	this.emit("event", "turnedOn");
};

LedStrip.prototype.turnOff = function() {
	console.log('led turn off');
	this.lights.off();
	this.emit("event", "turnedOff");
};

module.exports = LedStrip;