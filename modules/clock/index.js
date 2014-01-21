var util = require('util');
var canvasModule = require('../canvas-module');

function Clock(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	this.alarms = options.alarms;

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

module.exports = Clock;