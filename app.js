var canvas = require('./client');
var argv = require('minimist')(process.argv.slice(2));

if ("message" in argv) {
	var Client = canvas.CanvasClient;
	var client = new Client({
		"name": "Test Logger",
		"slug": "network_logger",
		"moduleName": "logger",
		"serverIP": "10.0.1.19",
		"serverPort": 3030
	});
	if (argv.ip) {
		client.serverIP = argv.ip;
	}
	if (argv.data) {
		var data = JSON.parse(argv.data);
	}
	var type = argv.type;
	var message = argv.message;
	var to = argv.to;
	
	client.module.on("connected", function() {
		if ("event" in argv) {
			client.emitEvent(message, data);
		} else if ("action" in argv) {
			client.emitAction(to, message, data);
		}
		client.disconnect();
	});
	client.connect();
} else {
	var client = canvas.createClient((require(process.argv[2])));
}

