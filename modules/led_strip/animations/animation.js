var REFRESH_TIME = 50;

function Animation(setter, duration, options, onFinish) {
	this.startTime = null;
	this.setter = setter;
	this.duration = duration; //milliseconds
	this.running = false;
	this.options = options;
	this.onFinish = onFinish;
}

Animation.prototype.start = function() {
	var T = this;

	this.startTime = (new Date()).getTime();
	this.running = true;

	setTimeout(function() {
		T.tick();
	}, REFRESH_TIME);
};

Animation.prototype.stop = function() {
	this.running = false;
	if (this.onFinish) {
		this.onFinish();
	}
};

Animation.prototype.tick = function() {
	var T = this;

	if (this.running) {
		var d = new Date();
		if (this.startTime + this.duration < d.getTime()) {
			if (this.options && this.options.loop) {
				this.startTime = this.startTime + this.duration;
			} else if (this.options && this.options.hold) {
				return;
			} else {
				this.stop();
				return;
			}
		}
		var percentComplete = (d.getTime() - this.startTime) / this.duration * 1.0;

		this.refresh(percentComplete);
		setTimeout(function() {
			T.tick();
		}, REFRESH_TIME);
	}
};

Animation.prototype.refresh = function(percentComplete) {
	console.log("refresh should be overridden");
};

module.exports = Animation;