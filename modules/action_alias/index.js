var util = require('util');
var canvasModule = require('../canvas-module');

function ActionAlias(options) {
	canvasModule.BaseModule.call(this);

	this.name = options.name;
	this.options = options;

	this.on("action:_", function(message) {
		console.log(message);
		for(var index in this.options.clients) {
			var client = this.options.clients[index];

			this.emit("action", client, message.action, message.data);
		}
	}.bind(this));
	
}
util.inherits(ActionAlias, canvasModule.BaseModule);


module.exports = ActionAlias;