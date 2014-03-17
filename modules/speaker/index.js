var util = require('util');
var canvasModule = require('../canvas-module');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var sys = require('sys');

function Speaker(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	this.volume = options.volume;

	this.playChildProcess = null;

	this.on('action:playSound', this.playSound.bind(this));
	this.on('action:streamMP3', this.streamMP3.bind(this));
	this.on('action:stopStreaming', this.stopStreaming.bind(this));
	this.on('action:ringDoorbell', this.ringDoorbell.bind(this));
}
util.inherits(Speaker, canvasModule.BaseModule);

function puts(error, stdout, stderr) {
	sys.puts(stdout);
}

Speaker.prototype.playSound = function(data) {
	var soundFile = __dirname + "/sounds/" + data.name;
	this.playChildProcess = spawn("aplay", [soundFile]);
	this.emit("event", "playedSound", {
		name: data.name
	});
};

Speaker.prototype.streamMP3 = function(data) {
	this.stopStreaming({});
	this.playChildProcess = spawn('play', ['-t', 'mp3', '"' + data.url + '"']);
	this.emit("event", "soundStarted");
	this.emit("event", "streamStarted");
	this.playChildProcess.on("exit", function(code, signal) {
		console.log("child process ended. code:",code,"signal:",signal);
		this.emit("event", "soundEnded");
		if (signal || code !== 0) {
			this.emit("event", "streamKilled");
		} else {
			this.emit("event", "streamEnded");
			this.playChildProcess = null;
		}
	}.bind(this));
};

Speaker.prototype.stopStreaming = function(data) {
	if (this.playChildProcess !== null) {
		this.playChildProcess.kill('SIGHUP');
		console.log("killed stream");
	}
};

Speaker.prototype.ringDoorbell = function(data) {
	this.playSound({
		name: "doorbell.wav"
	});
};

module.exports = Speaker;