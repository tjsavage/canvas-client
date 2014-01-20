var argv = require('optimist')
			.usage('Usage: $0 [options file]')
			.argv;


var CanvasClient = require('./client');

var client = new CanvasClient((require(argv._[0])));
client.connect();
