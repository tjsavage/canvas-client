var util = require('util');
var events = require('events');

function BaseModule(){
	events.EventEmitter.call(this);
}
util.inherits(BaseModule, events.EventEmitter);

module.exports.BaseModule = BaseModule;