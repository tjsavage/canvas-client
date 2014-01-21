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
	this.on("action:notification", this.notification.bind(this));
	this.on("action:sunrise", this.sunrise.bind(this));

	this.state = "off";

	this.turnOff();
}
util.inherits(LedStrip, canvasModule.BaseModule);

LedStrip.prototype.turnOn = function() {
	this.lights.setColor({
		r: 1.0,
		g: 1.0,
		b: 1.0
	});
	this.state = "on";
	this.emit("event", "turnedOn");
};

LedStrip.prototype.turnOff = function() {
	if (this.animation) {
		this.animation.stop();
		this.animation = null;
	}
	this.lights.off();
	this.state = "off";
	this.emit("event", "turnedOff");
};

LedStrip.prototype.nightLight = function() {
	if (this.state == "off") {
		this.lights.setColor({
			r: 180,
			g: 40,
			b: 20
		});
		this.state = "nightlight";
	}
	this.emit("event", "nightLighted");
};

LedStrip.prototype.notification = function() {
	this.startAnimation("pulse", 300, {
		startColor: {
			r: 1.0,
			g: 1.0,
			b: 1.0
		},
		loop: true
	});
	this.state = "notification";
	this.emit("event", "notified");
	setTimeout(this.turnOff.bind(this), 2000);
};

LedStrip.prototype.sunrise = function() {
	this.startAnimation("sunrise", 600000, {
		hold: true
	}, function() {
		this.emit("event", "sunrose");
		this.turnOff();
	}.bind(this));
	this.state = "sunrise";
	this.emit("event", "sunrising");
};

LedStrip.prototype.endNightLight = function() {
	if (this.state == "nightlight") {
		this.turnOff();
	}
};

LedStrip.prototype.startAnimation = function(animationName, duration, options, onFinish) {
	this.animation = animations.load(animationName, this.lights, duration, options, onFinish);
	this.animation.start();
};

module.exports = LedStrip;