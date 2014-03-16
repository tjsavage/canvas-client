var util = require('util');
var canvasModule = require('../canvas-module');
var http = require('http');
var express = require('express');
var twilio = require('twilio');

function TwilioSMS(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	this.number = options.number;

	this.twilioClient = twilio(options.twilio.accountSid, options.twilio.authToken);

	this.app = express();
	this.app.set('port', this.options.httpPort);
	this.app.use(express.json());
	this.app.use(express.urlencoded());
	this.server = http.createServer(this.app);
	this.server.listen(this.app.get('port'), function() {
		console.log("twilio sms express server listening on port " + this.app.get('port'));
	}.bind(this));
	this.app.get('/twilio/sms', this.incomingSMS.bind(this));

	this.clientWaitingForResponse = null;

	this.on("action:sendSMS", this.sendSMS.bind(this));
}
util.inherits(TwilioSMS, canvasModule.BaseModule);

TwilioSMS.prototype.incomingSMS = function(req, res) {
	if(req.query.From != this.number) {
		console.log("Wrong number...",req.query.From,"!=",this.number);
		return;
	}

	var smsBody = req.query.Body;
	this.emit("event", "receivedMessage", {
		"body": smsBody
	});
	res.send(200);

	if (this.clientWaitingForResponse) {
		this.emit("action", this.clientWaitingForResponse, "receivedReponse", {
			"body": smsBody
		});
	}
};

TwilioSMS.prototype.sendSMS = function(actionData) {
	var smsBody = actionData.body;
	if (actionData.expectsResponse) {
		this.clientWaitingForResponse = actionData.from;
	}

	this.twilioClient.sms.messages.create({
		body: smsBody,
		to: this.number,
		from: this.options.twilio.number
	}, function(err, message) {
		if (err) {
			console.log("ERROR sending SMS: ", err.message);
		} else {
			console.log("Sent SMS, ", message.body, message.sid);
		}
	});
};


module.exports = TwilioSMS;