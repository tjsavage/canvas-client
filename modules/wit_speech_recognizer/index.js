var util = require('util');
var canvasModule = require('../canvas-module');
var path = require('path');
var fs = require('fs');
var https = require('https');
var request = require('request');

function WitSpeechRecognizer(options) {
    canvasModule.BaseModule.call(this);

    this.options = options;
    this.listening = false;
    this.name = this.options.name;
    this.witToken = options.token;

    var Speakable = require('./node-wit-speakable');

    // Setup google speech
    this.speakable = new Speakable({
        token: options.token
    });
    
    this.on("action:startListening", this.startListening.bind(this));
    this.on("action:stopListening", this.stopListening.bind(this));
    this.on("event:receivedMessage", this.receivedMessage.bind(this));
    this.on("event:soundStarted", this.stopListening.bind(this));
    this.on("event:soundEnded", this.startListening.bind(this));

    this.speakable.on('speechResult', this.speechResult.bind(this));
    this.speakable.on('error', this.speechError.bind(this));

    if (!this.options.ignoreMic) {
        this.startListening();
    }
}
util.inherits(WitSpeechRecognizer, canvasModule.BaseModule);

WitSpeechRecognizer.prototype.receivedMessage = function(eventMessage) {
    console.log("Processing message:",eventMessage);
    if (this.options.messageSources && this.options.messageSources.length > 0 && this.options.messageSources.indexOf(eventMessage.from) != -1) {
        this.sendWitText(eventMessage.data.body);
    } else {
        console.log(eventMessage.from, "not in messageSources:", this.options.messageSources, "...ignoring");
    }
};

WitSpeechRecognizer.prototype.sendWitText = function(text) {
    var options = {
        url: 'https://api.wit.ai/message',
        headers: {
          'Authorization': 'Bearer ' + this.witToken
        },
        qs: {
            "q": text
        }
    };

    request.get(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            this.speechResult(data);
        } else {
            console.log(error);
        }
    }.bind(this));
};

WitSpeechRecognizer.prototype.startListening = function() {
    console.log(this.name,"started listening");
    this.listening = true;
    this.speakable.recordVoice();
};

WitSpeechRecognizer.prototype.stopListening = function() {
    console.log(this.name,"stopping listening");
    this.listening = false;
    this.speakable.killRecording();
};

WitSpeechRecognizer.prototype.speechError = function(err) {
    console.log(this.name,"speech error:",err);
    if (this.listening) {
        this.speakable.recordVoice();
    }
};

WitSpeechRecognizer.prototype.speechResult = function(resultData) {
    console.log(this.name,"speech result:",resultData);
    if (resultData.outcome.intent == "set_device_power") {
        if (resultData.outcome.entities.canvas_client && resultData.outcome.entities.on_off) {
            var client = resultData.outcome.entities.canvas_client.value;
            var value = resultData.outcome.entities.on_off.value;
            
            this.setDevicePower(client, value);
        } else {
            // Try to specify
            console.log("didn't get all the info needed",resultData);
        }
            
    } else if (resultData.outcome.intent == "send_device_action") {
        if (resultData.outcome.entities.canvas_client && resultData.outcome.entities.canvas_client_action) {
            var client = resultData.outcome.entities.canvas_client.value;
            var action = resultData.outcome.entities.canvas_client_action.value;

            this.emit("action", client, action);
        } else {
            console.log("didn't get all the info needed",resultData);
        }
        
    } else if (resultData.outcome.intent == "set_timer") {
        var client = resultData.outcome.entities.canvas_client.value;
        var action = resultData.outcome.entities.canvas_client_action.value;
        var duration = resultData.outcome.entities.duration.value;

        this.emit("action", client, action, {duration: duration});
    } else if (resultData.outcome.intent == "search_and_play") {
        var client = resultData.outcome.entities.canvas_client.value;
        var action = "search_and_play";
        var query = resultData.outcome.entities.search_query.value;

        this.emit("action", client, action, {query: query});
    } else if (resultData.outcome.intent == "start_radio") {
        var client = resultData.outcome.entities.canvas_client.value;
        var action = "startRadio";
        var query = resultData.outcome.entities.search_query.value;

        this.emit("action", client, action, {query: query});
    } else if (resultData.outcome.intent == "stop_music") {
        var client = resultData.outcome.entities.canvas_client.value;
        var action = resultData.outcome.entities.canvas_client_action;

        this.emit("action", client, action, {});
    }

    if (this.listening) {
        this.speakable.recordVoice();
    }
};

WitSpeechRecognizer.prototype.setDevicePower = function(client, value) {
    if (value == "on") {
        var action = "turnOn";
    } else if (value == "off") {
        var action = "turnOff";
    }

    this.emit("action", client, action);
};


module.exports = WitSpeechRecognizer;