var argv = require('optimist')
			.usage('Usage: $0 [config file]')
			.argv;


var CanvasClient = require('./client');
console.log(argv);

var client = new CanvasClient((require(argv._[0])));
client.connect();
