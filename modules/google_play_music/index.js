var util = require('util');
var canvasModule = require('../canvas-module');
var GoogleMusic = require('./GoogleMusicApi').GoogleMusicApi;

function GooglePlayMusic(options) {
	console.log("NEW");
	canvasModule.BaseModule.call(this);

	this.options = options;
	this.api = new GoogleMusic(options.username, options.password);
	
	this.api.Login(this.ready.bind(this));
	setTimeout(function() {
		this.search("get lucky");
	}.bind(this), 2000);
}
util.inherits(GooglePlayMusic, canvasModule.BaseModule);

GooglePlayMusic.prototype.ready = function() {
	this.emit("ready");
};

GooglePlayMusic.prototype.getAllSongs = function() {
	console.log("getting all songs");
	this.api.GetAllSongs(null, function(result) {
		console.log(result);
	});
};

GooglePlayMusic.prototype.search = function(query) {
	this.api.Search(query, function(result) {
		console.log(result.entries[20]);
	});
};

GooglePlayMusic.prototype.getStreamURL = function(song_id) {
	
};


module.exports = GooglePlayMusic;