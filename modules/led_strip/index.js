var util = require('util');
var canvasModule = require('../canvas-module');
var spi = require('spi');
var LightStrips = require('./LPD8806').LightStrips;
var animations = require('./animations');

function LedStrip(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;

	var spiDevice = new spi.Spi('/dev/spidev0.0', {});
	this.lights = new LightStrips('/dev/spidev0.0', options.leds, spiDevice);

	this.on("action:turnOn", this.turnOn.bind(this));
	this.on("action:turnOff", this.turnOff.bind(this));
	this.on("action:nightLight", this.nightLight.bind(this));
	this.on("action:endNightLight", this.endNightLight.bind(this));

	this.state = "off";

	this.turnOff();
}
util.inherits(LedStrip, canvasModule.BaseModule);

LedStrip.prototype.turnOn = function() {
	console.log('led turn on');
	this.lights.all(255, 255, 255);
	this.lights.sync();
	this.state = "on";
	this.emit("event", "turnedOn");
};

LedStrip.prototype.turnOff = function() {
	console.log('led turn off');
	this.lights.off();
	this.state = "off";
	this.emit("event", "turnedOff");
};

LedStrip.prototype.nightLight = function() {
	if (this.state == "off") {
		this.lights.all(190, 38, 41);
		this.lights.sync();
		this.startAnimation("pulse", 2000, {
			minValue: 0.4,
			maxValue: 0.6,
			loop: true
		});
		this.state = "nightlight";
	}
	this.emit("event", "nightLighted");
};

LedStrip.prototype.endNightLight = function() {
	if (this.state == "nightlight") {
		this.animation.stop();
		this.turnOff();
	}
};

LedStrip.prototype.startAnimation = function(animationName, duration, options) {
	this.animation = animations.load(animationName, this.lights, duration, options);
	this.animation.start();
};

module.exports = LedStrip;