var Speakable = require('./');

// Setup google speech
var speakable = new Speakable({
	token: "UAYF5C5GUYE7PO7FZNKQMJMFCUPQXVVY"
});

speakable.on('speechStart', function() {
  console.log('onSpeechStart');
});

speakable.on('speechStop', function() {
  console.log('onSpeechStop');
});

speakable.on('speechReady', function() {
  console.log('onSpeechReady');
});

speakable.on('error', function(err) {
  console.log('onError:');
  console.log(err);
  speakable.recordVoice();
});

speakable.on('speechResult', function(spokenWords) {
  console.log('onSpeechResult:')
  console.log(spokenWords);
  speakable.recordVoice();
});

speakable.recordVoice();
