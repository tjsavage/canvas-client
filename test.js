var should = require('should');
var request = require('request');
var Client = require('./client');

var dummyClientConfig = {
	"name": "Dummy Client",
	"serverIP": "127.0.0.1",
	"serverPort": 3030,
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
		"serverPort": 3030,
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
		"serverPort": 3030,
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
			"serverPort": 3030,
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

describe("temperature_sensor", function() {
	it("should read the temperature", function(done) {
		var temperatureConfig = {
			"name": "Test Temperature",
			"serverIP": "127.0.0.1",
			"serverPort": 3030,
			"moduleName": "temperature_sensor",
			"deviceFilepath": "/tmp/fake_temp_sensor"
		}

		var temperatureClient = new Client(temperatureConfig);
		var dummyClient = new Client(dummyClientConfig);

		var fs = require("fs");
		fs.writeFileSync("/tmp/fake_temp_sensor", "4b 01 4b 5d : crc=01 YES\4b 01 4b 5d t=2600");			
		dummyClient.connect(function() {
			dummyClient.socketListen("event", function(message) {
				dummyClient.disconnect();
				temperatureClient.disconnect();

				message.from.should.equal(temperatureConfig.name);
				message.event.should.equal("temperature");
				Math.round(message.data.temperature).should.equal(79);
				done();
			});
			temperatureClient.connect(function() {
				console.log("connected temp");
			});
		});
	});
})

describe("action trigger", function() {
	it("should trigger an action for a specific event", function(done) {
		var actionTriggerConfig = {
			"name": "Test Trigger",
			"serverIP": "127.0.0.1",
			"serverPort": 3030,
			"moduleName": "action_trigger",
			"recipes": [
				{
					"if_": [
						{
							"from": "Test Motion",
							"event": "tripped"
						}
					],
					"then": [
						{
							"to": "Test Speaker",
							"action": "ringDoorbell"
						}
					]
				}
			]
		};

		var speakerConfig = {
			"name": "Test Speaker",
			"serverIP": "127.0.0.1",
			"serverPort": 3030,
			"moduleName": "speaker",
		};

		var motionConfig = {
			"name": "Test Motion",
			"serverIP": "127.0.0.1",
			"serverPort": 3030,
			"moduleName": "motion_detector",
			"pin": 1
		};

		var motionClient = new Client(motionConfig);
		var speakerClient = new Client(speakerConfig);
		var actionTriggerClient = new Client(actionTriggerConfig);
		var dummyClient = new Client(dummyClientConfig);

		motionClient.connect(function() {
			speakerClient.connect(function() {
				actionTriggerClient.connect(function() {
					dummyClient.connect(function() {
						dummyClient.socketListen("event", function(message) {
							if (message.event == "playedSound") {
								dummyClient.disconnect();
								actionTriggerClient.disconnect();
								speakerClient.disconnect();
								motionClient.disconnect();
								done();
							}
						});

						motionClient.module.gpioChanged(1);
					});
				});
			});
		});
	});

	it("should trigger an action for a generic event, without requiring a sender", function(done) {
		var actionTriggerConfig = {
			"name": "Test Trigger",
			"serverIP": "127.0.0.1",
			"serverPort": 3030,
			"moduleName": "action_trigger",
			"recipes": [
				{
					"if_": [
						{
							"event": "tripped"
						}
					],
					"then": [
						{
							"to": "Test Speaker",
							"action": "ringDoorbell"
						}
					]
				}
			]
		};

		var speakerConfig = {
			"name": "Test Speaker",
			"serverIP": "127.0.0.1",
			"serverPort": 3030,
			"moduleName": "speaker",
		};

		var motionConfig = {
			"name": "Test Motion",
			"serverIP": "127.0.0.1",
			"serverPort": 3030,
			"moduleName": "motion_detector",
			"pin": 1
		};

		var motionClient = new Client(motionConfig);
		var speakerClient = new Client(speakerConfig);
		var actionTriggerClient = new Client(actionTriggerConfig);
		var dummyClient = new Client(dummyClientConfig);

		motionClient.connect(function() {
			speakerClient.connect(function() {
				actionTriggerClient.connect(function() {
					dummyClient.connect(function() {
						dummyClient.socketListen("event", function(message) {
							if (message.event == "playedSound") {
								dummyClient.disconnect();
								actionTriggerClient.disconnect();
								speakerClient.disconnect();
								motionClient.disconnect();
								done();
							}
						});

						motionClient.module.gpioChanged(1);
					});
				});
			});
		});
	});
})
