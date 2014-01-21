var util = require("util");
var Animation = require("./animation");

var STEPS = 100;

function KeyFrame(setter, duration, options, onFinish) {
	Animation.call(this, setter, duration, options, onFinish);
	if (typeof this.options == 'undefined') {
		this.options = {};
	}
	if (typeof this.options.frames == 'undefined') {
		this.options.frames = [{
			r: 255,
			g: 0,
			b: 0
		}, {
			r: 0,
			g: 0,
			b: 255
		}];
	}
}
util.inherits(KeyFrame, Animation);

KeyFrame.prototype.refresh = function(percentComplete) {
	var numFrames = this.options.frames.length;
	var prevFrameNum = Math.floor(percentComplete * (numFrames - 1));
	var nextFrameNum = Math.ceil(percentComplete * (numFrames - 1)) % numFrames;
	var interpolation = (percentComplete % (1.0 / (numFrames - 1))) / (1.0 / (numFrames - 1));

	newColor = {};
	if (typeof this.options.frames[0].r != 'undefined') {
		newColor.r = (this.options.frames[nextFrameNum].r - this.options.frames[prevFrameNum].r) * interpolation + this.options.frames[prevFrameNum].r;
		newColor.g = (this.options.frames[nextFrameNum].g - this.options.frames[prevFrameNum].g) * interpolation + this.options.frames[prevFrameNum].g;
		newColor.b = (this.options.frames[nextFrameNum].b - this.options.frames[prevFrameNum].b) * interpolation + this.options.frames[prevFrameNum].b;
	} else if (typeof this.options.frames[0].h != 'undefined') {
		newColor.h = (this.options.frames[nextFrameNum].h - this.options.frames[prevFrameNum].h) * interpolation + this.options.frames[prevFrameNum].h;
		newColor.s = (this.options.frames[nextFrameNum].s - this.options.frames[prevFrameNum].s) * interpolation + this.options.frames[prevFrameNum].s;
		newColor.v = (this.options.frames[nextFrameNum].v - this.options.frames[prevFrameNum].v) * interpolation + this.options.frames[prevFrameNum].v;
	}
	this.setter.setColor(newColor);
	this.setter.emitState();
	this.setter.all();
};


module.exports = KeyFrame;