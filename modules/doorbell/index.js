var util = require('util');
var canvasModule = require('../canvas-module');
var http = require('http');
var express = require('express');
var twilio = require('twilio');

function Doorbell(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;

	this.twilioClient = twilio(options.twilio.accountSid, options.twilio.authToken);

	this.app = express();
	this.app.set('port', this.options.httpPort);
	this.app.use(express.bodyParser());
	this.server = http.createServer(this.app);
	this.server.listen(this.app.get('port'), function() {
		console.log("doorbell express server listening on port " + this.app.get('port'));
	}.bind(this));
	this.app.get('/doorbell/twilio', this.twilio.bind(this));

	this.locked = true;

	this.on('action:unlock', this.unlock.bind(this));
	this.on('action:lock', this.lock.bind(this));
}
util.inherits(Doorbell, canvasModule.BaseModule);

Doorbell.prototype.twilio = function(req, res) {
	var resp = new twilio.TwimlResponse();

	if (this.locked) {
		resp.play({"digits": "1"});

		resp.dial({"timeout": 30}, function() {
			this.number("+1-310-266-3121");
			this.number("+1-973-216-8106");
		});
	} else {
		resp.play({"digits": "1"});
		resp.play({"digits": "9"});
	}
	
	res.send(resp.toString());

	this.emit("event", "rang");
	this.emit("action", this.options.speakerName, "ringDoorbell");
};

Doorbell.prototype.unlock = function() {
	this.locked = false;
};

Doorbell.prototype.lock = function() {
	this.locked = true;
};

module.exports = Doorbell;