var util = require('util');
var canvasModule = require('../canvas-module');

function Logger(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
}
util.inherits(Logger, canvasModule.BaseModule);

module.exports = Logger;