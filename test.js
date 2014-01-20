var should = require('should');
var request = require('request');
var Client = require('./client');

var dummyClientConfig = {
	"name": "Dummy Client",
	"serverIP": "127.0.0.1",
	"moduleName": "logger"
};

describe("client", function() {
	it("should connect correctly", function(done) {
		var dummyClient = new Client(dummyClientConfig);
		dummyClient.connect(function() {
			dummyClient.disconnect();
			done();
		});
	});
});

describe("led_strip", function() {
	var ledConfig = {
		"name": "Test LED Strip",
		"serverIP": "127.0.0.1",
		"moduleName": "led_strip",
		"pin": 18
	};

	it("should turn on when asked", function(done) {
		var ledClient = new Client(ledConfig);
		var dummyClient = new Client(dummyClientConfig);

		ledClient.connect(function() {
			console.log("got led connection");
			dummyClient.connect(function() {
				console.log("got dummy connection");
				dummyClient.socketListen("event", function(message) {
					message.from.should.equal(ledConfig.name);
					message.event.should.equal("turnedOn");
					dummyClient.disconnect();
					ledClient.disconnect();
					done();
				});

				dummyClient.socketEmit("action", {
					"to": "Test LED Strip",
					"action": "turnOn"
				});
			});
		});
	});
});

describe("speaker", function(){
	var speakerConfig = {
		"name": "Test Speaker",
		"serverIP": "127.0.0.1",
		"moduleName": "speaker",
	};

	it("should play a sound by name when asked", function(done) {
		var dummyClient = new Client(dummyClientConfig);
		var speakerClient = new Client(speakerConfig);

		speakerClient.connect(function() {
			console.log("got speaker connection");
			dummyClient.connect(function() {
				console.log("got dummy connection");
				dummyClient.socketListen("event", function(message) {
					message.from.should.equal(speakerConfig.name);
					message.event.should.equal("playedSound");
					message.data.name.should.equal("doorbell.wav");

					dummyClient.disconnect();
					speakerClient.disconnect();
					done();
				});

				dummyClient.socketEmit("action", {
					"to": speakerClient.name,
					"action": "playSound",
					"data": {
						"name": "doorbell.wav"
					}
				});
			});
		});
	});
});

describe("motion_detector", function() {
	it("should emit a tripped state when tripped", function(done) {
		var motionConfig = {
			"name": "Test Motion",
			"serverIP": "127.0.0.1",
			"moduleName": "motion_detector",
			"pin": 1
		};

		var motionClient = new Client(motionConfig);
		var dummyClient = new Client(dummyClientConfig);
		motionClient.connect(function() {
			dummyClient.connect(function() {
				dummyClient.socketListen("event", function(message) {
					message.from.should.equal(motionConfig.name);
					message.event.should.equal("tripped");

					dummyClient.disconnect();
					motionClient.disconnect();
					done();
				});

				motionClient.module.gpioChanged(1);
			});
		});
	});
});


describe("doorbell", function() {
	it("should ring the doorbell", function(done) {
		var doorbellConfig = {
			"name": "Test Doorbell",
			"serverIP": "127.0.0.1",
			"moduleName": "doorbell",
			"httpPort": 3003,
			"twilio": {
				"accountSid": "account123",
				"authToken": "auth123"
			}
		};

		var doorbellClient = new Client(doorbellConfig);
		doorbellClient.connect(function() {
			request("http://127.0.0.1:3003", function(err, resp, body) {
				console.log(body);
				done();
			});
		});
	});
});
