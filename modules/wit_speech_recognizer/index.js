var util = require('util');
var canvasModule = require('../canvas-module');
var path = require('path');
var fs = require('fs');

function WitSpeechRecognizer(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	this.listening = false;

	var Speakable = require('./node-wit-speakable');

	// Setup google speech
	this.speakable = new Speakable({
		token: options.token;
	});
	
	this.on("action:startListening", this.startListening.bind(this));
	this.on("action:stopListening", this.stopListening.bind(this));

	this.speakable.on('speechResult', this.speechResult.bind(this));
	this.speakable.on('error', this.speechError.bind(this));
}
util.inherits(WitSpeechRecognizer, canvasModule.BaseModule);

WitSpeechRecognizer.prototype.startListening = function() {
	this.listening = true;
	this.speakable.recordVoice();
};

WitSpeechRecognizer.prototype.stopListening = function() {
	this.listening = false;
}

WitSpeechRecognizer.prototype.speechError = function(err) {
	console.log("speech error:",err);
	if (this.listening == true) {
		this.speakable.recordVoice();
	}
}

WitSpeechRecognizer.prototype.speechResult = function(resultData) {
	if (resultData.outcome.intent == "set_device_power") {
		var client = resultData.outcome.entities.canvas_client.value;
		var value = resultData.outcome.entities.on_off.value;

		this.setDevicePower(client, value);
	}

	if (resultData.outcome.intent == "send_device_action") {
		var client = resultData.outcome.entities.canvas_client.value;
		var action = resultData.outcome.entities.canvas_client_action.value;

			this.emit("action", client, action);
	}

	if (resultData.outcome.intent == "set_timer") {
		var client = resultData.outcome.entities.canvas_client.value;
		var action = resultData.outcome.entities.canvas_client_action.value;
		var duration = resultData.outcome.entities.duration.value;

		this.emit("action", client, action, {duration: duration});
	}

	if (this.listening) {
		this.speakable.recordVoice();
	}
};

WitSpeechRecognizer.prototype.setDevicePower = function(client, value) {
	if (value == "on") {
		var action = "turnOn";
	} else if (value == "off") {
		var action = "turnOff";
	}

	this.emit("action", client, action);
};


module.exports = WitSpeechRecognizer;