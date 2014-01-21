var util = require('util');
var canvasModule = require('../canvas-module');
var http = require('http');
var express = require('express');

function APIMapper(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;

	this.app = express();
	this.app.set('port', this.options.httpPort);
	this.app.use(express.bodyParser());
	this.server = http.createServer(this.app);
	this.server.listen(this.app.get('port'), function() {
		console.log("api mapping express server listening on port " + this.app.get('port'));
	}.bind(this));

	this.app.get("/event", this.eventRequest.bind(this));
	this.app.head("/event", this.eventRequest.bind(this));

	for (var index in this.options.mappings) {
		var mapping = this.options.mappings[index];
		if (mapping.method == 'get') {
			this.app.get(mapping.uri, this.uriMap.bind(this, mapping.event));
		}
	}
	
}
util.inherits(APIMapper, canvasModule.BaseModule);

APIMapper.prototype.eventRequest = function(req, res) {
	var eventName = req.query.event;

	this.emit("event", eventName);
	res.send(200);
}

APIMapper.prototype.uriMap = function(event, req, res) {
	this.emit("event", event);
	res.send(200);
}

module.exports = APIMapper