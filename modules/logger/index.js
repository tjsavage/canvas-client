var util = require('util');
var canvasModule = require('../canvas-module');

function Logger(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;

	this.on("*", function(data) {
		console.log(data);
	}.bind(this));
	
}
util.inherits(Logger, canvasModule.BaseModule);

module.exports = Logger;