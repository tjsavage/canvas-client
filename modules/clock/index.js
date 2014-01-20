var util = require('util');
var canvasModule = require('../canvas-module');

function Clock(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;

	this.minuteTick();
}
util.inherits(Clock, canvasModule.BaseModule);

Clock.prototype.minuteTick = function() {
	this.emit("event", "minuteTick");
	setTimeout(this.minuteTick.bind(this), 60000);
};

module.exports = Clock;