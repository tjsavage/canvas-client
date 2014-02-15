var util = require('util');
var canvasModule = require('../canvas-module');

function Clock(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	this.alarms = options.alarms;

	this.on("action:timer", this.setTimer.bind(this));
	this.minuteTick();
}
util.inherits(Clock, canvasModule.BaseModule);

Clock.prototype.minuteTick = function() {
	this.emit("event", "minuteTick");
	for (var index in this.alarms) {
		var alarm = this.alarms[index];
		var date = new Date();
		if (alarm.days.indexOf(date.getDay()) > -1 && date.getHours() == alarm.hour && date.getMinutes() == alarm.minute) {
			this.emit("event", alarm.eventName);
		}
	}
	setTimeout(this.minuteTick.bind(this), 60000);
};

Clock.prototype.setTimer = function(data) {
	setTimeout(function() {
		this.emit("event", "timerDone");
	}.bind(this), data.duration * 1000);
};

module.exports = Clock;