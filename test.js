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