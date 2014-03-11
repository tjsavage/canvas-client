var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    spawn = require('child_process').spawn,
    https = require('https');

var Speakable = function Speakable(options) {
  EventEmitter.call(this);

  options = options || {};

  this.recBuffer = [];
  this.recRunning = false;
  this.apiResult = {};
  this.apiLang = options.lang || "en-US";
  this.apiToken = options.token;
  this.cmd = 'sox';
  this.cmdArgs = [
    '-b','16',
    '-d','-t','wav','-',
    'rate','16000','channels','1',
    'highpass','100',
    'compand', '0.05,0.2', '6:-54,-90,-36,-36,-24,-24,0,-12', '0', '-90', '0.1',
    'vad', '-T', '0.6', '-p', '0.2', '-t', '5',
    'trim', '0','1.8'
  ];

};

util.inherits(Speakable, EventEmitter);
module.exports = Speakable;

Speakable.prototype.postVoiceData = function() {
  var self = this;

  var options = {
    hostname: 'api.wit.ai',
    path: '/speech',
    method: 'POST',
    headers: {
      'Content-type': 'audio/wav',
      'Authorization': 'Bearer ' + self.apiToken
    }
  };

  var req = https.request(options, function(res) {
    self.recBuffer = [];
    if(res.statusCode !== 200) {
      return self.emit(
        'error',
        'Non-200 answer from Wit Speech API (' + res.statusCode + '), '+ res.body
      );
    }
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      self.apiResult = JSON.parse(chunk);
    });
    res.on('end', function() {
      self.parseResult();
    });
  });

  req.on('error', function(e) {
    self.emit('error', e);
  });

  // write data to request body
  console.log('Posting voice data...');
  for(var i in self.recBuffer) {
    if(self.recBuffer.hasOwnProperty(i)) {
      req.write(new Buffer(self.recBuffer[i],'binary'));
    }
  }
  req.end();
};

Speakable.prototype.recordVoice = function() {
  var self = this;

  var rec = spawn(self.cmd, self.cmdArgs, "pipe");

  // Process stdout

  rec.stdout.on('readable', function() {
    self.emit('speechReady');
  });

  rec.stdout.setEncoding('binary');
  rec.stdout.on('data', function(data) {
    if(! self.recRunning) {
      self.emit('speechStart');
      console.log("starting...");
      self.recRunning = true;
    }
    console.log("data");
    self.recBuffer.push(data);
  });

  // Process stdin

  rec.stderr.setEncoding('utf8');
  rec.stderr.on('data', function(data) {
    console.log(data);
  });

  rec.on('close', function(code) {
    self.recRunning = false;
    if(code) {
      self.emit('error', 'sox exited with code ' + code);
    }
    console.log("stopping");
    self.emit('speechStop');
    self.postVoiceData();
  });
};

Speakable.prototype.resetVoice = function() {
  var self = this;
  self.recBuffer = [];
}

Speakable.prototype.parseResult = function() {
  this.emit("speechResult", this.apiResult);
}
