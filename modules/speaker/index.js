var util = require('util');
var canvasModule = require('../canvas-module');
var exec = require('child_process').exec;
var sys = require('sys');

function Speaker(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;

	this.on('playSound', this.playSound.bind(this));
}
util.inherits(Speaker, canvasModule.BaseModule);

function puts(error, stdout, stderr) {
	sys.puts(stdout);
}

Speaker.prototype.playSound = function(data) {
	exec("aplay " + data.name, puts);
	this.emit("event", "playedSound", {
		name: data.name
	});
};


module.exports = Speaker;