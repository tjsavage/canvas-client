var util = require('util');
var canvasModule = require('../canvas-module');
var exec = require('child_process').exec;
var sys = require('sys');

function Speaker(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;

	this.on('playSound', this.playSound.bind(this));
	this.on('ringDoorbell', this.ringDoorbell.bind(this));
}
util.inherits(Speaker, canvasModule.BaseModule);

function puts(error, stdout, stderr) {
	sys.puts(stdout);
}

Speaker.prototype.playSound = function(data) {
	var soundFile = __dirname + "/sounds/" + data.name;
	console.log(soundFile);
	exec("aplay " + soundFile, puts);
	this.emit("event", "playedSound", {
		name: data.name
	});
};

Speaker.prototype.ringDoorbell = function(data) {
	this.playSound({
		name: "doorbell.wav"
	});
};

module.exports = Speaker;