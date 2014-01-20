var should = require('should');
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
	})
})