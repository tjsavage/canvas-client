var util = require("util");
var KeyFrame = require("./keyframe");

var STEPS = 100;

function Sunrise(setter, duration, options, onFinish) {
	options.frames = [
		{r: 0, g: 0, b: 0},
		{r: 63, g: 64, b: 81},
		{r: 114, g: 71, b: 72},
		{r: 208, g: 114, b: 76},
		{r: 216, g: 148, b: 91},
		{r: 238, g: 212, b: 95},
		{r: 252, g: 244, b: 127},
		{r: 253, g: 251, b: 235}
	];
	KeyFrame.call(this, setter, duration, options, onFinish);
}
util.inherits(Sunrise, KeyFrame);


module.exports = Sunrise;