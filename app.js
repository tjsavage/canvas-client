var CanvasClient = require('./client');

var client = new CanvasClient((require(process.argv[2])));
client.connect();
