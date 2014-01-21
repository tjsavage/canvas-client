var util = require('util');
var canvasModule = require('../canvas-module');

function ActionTrigger(options) {
	canvasModule.BaseModule.call(this);

	this.options = options;
	for(var index in this.options.recipes) {
		var ifs = this.options.recipes[index].if_;
		var thens = this.options.recipes[index].then;
		for (var ifIndex in ifs) {
			var if_ = ifs[ifIndex];
			this.registerHandler(if_.event, if_, thens);
		}
	}
}
util.inherits(ActionTrigger, canvasModule.BaseModule);

ActionTrigger.prototype.registerHandler = function(eventName, testData, actionsData) {
	this.on("event:" + eventName, function(message) {
		console.log("got event:",message);
		if (message.from == testData.from) {
			for (var actionIndex in actionsData) {
				this.emit("action", actionsData[actionIndex].to,
									actionsData[actionIndex].action,
									actionsData[actionIndex].data);
			}
		}
	});
};

module.exports = ActionTrigger;