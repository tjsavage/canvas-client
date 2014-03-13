var GoogleClientLogin = require('googleclientlogin').GoogleClientLogin;
var restler = require('restler');

function GoogleMusic(email, password) {
    this.googleAuth = new GoogleClientLogin({
      email: email,
      password: password,
      service: 'sj',
      accountType: GoogleClientLogin.accountTypes.google
    });
}

GoogleMusic.prototype = {
    Login: function(onSuccess) {
        console.log("logging in");
        var self = this;
        self.googleAuth.on(GoogleClientLogin.events.login, function(){
            self._getCookies(onSuccess);
        });
        self.googleAuth.on(GoogleClientLogin.events.error, function(e) {
            switch(e.message) {
                case GoogleClientLogin.errors.loginFailed:
                    if (this.isCaptchaRequired()) {
                        onCaptchaRequest(this.getCaptchaUrl(), this.getCaptchaToken());
                    }
                    console.log("login failed");
                    break;
                case GoogleClientLogin.errors.tokenMissing:
                case GoogleClientLogin.errors.captchaMissing:
                    throw new Error('You must pass the both captcha token and the captcha');
            }
            throw new Error('Unknown error');
        });
        self.googleAuth.login();
    },

    // get basic inforamtion( total tracks, total albums, personolized ads :) )
    GetStatus: function(callback) {
        return this._sendRequest('post','https://play.google.com/music/services/getstatus', option, null, callback);
    },

    // get all songs for Google Play, google play could respond with chunks, to receive with chunks get songs with continuationToken
    GetAllSongs: function(continuationToken, callback) {
        console.log("calling get all songs");
        var option = {};
        option.continuationToken = continuationToken;
        return this._sendRequest('post','https://www.googleapis.com/sj/v1.1/trackfeed', option, null, callback);
    },

    GetStreamURL: function(sond_id, callback) {
        var options = {
            query: {

            }
        }
        this._sendRequest('get', 'https://android.clients.google.com/music/mplay', options, null, function(result, response) {
            
        });
    },

    Search: function(query, callback) {
        return this._sendRequest('get', 'https://www.googleapis.com/sj/v1.1/query?q=' + query + '&max-results=10&u=0&xt=' + this.cookies["xt"], null, null, callback);
    },
    
    _getCookies: function(callback) {
        var self = this;
        self._sendRequest('get','https://play.google.com/music/listen?u=0', null, null, function(result, response) {
            self.cookies = {};
            response.headers['set-cookie'] && response.headers['set-cookie'].forEach(function(cookie) {
                var parts = cookie.split('=');
                self.cookies[parts[0].trim()] = (parts[1]||'').trim();
            });
            if (typeof callback !== "undefined") {
                console.log("calling back",callback);
                callback();
            }
        });
    },

    _sendRequest: function(type, url, option, body, callback) {
        var self = this;

        if(body && typeof body == 'object'){
            body = JSON.stringify(body);
        }
          
        if (self.googleAuth.getAuthId() === undefined)
        {
            throw 'Try to login first';
        }
                    
        var restRequest = null;
        var requestOption = { query : option || {}, parser : restler.parsers.json };
        requestOption.headers = {};
        requestOption.headers['Authorization'] = 'GoogleLogin auth=' + self.googleAuth.getAuthId();
        if (body) {
            requestOption.data = body;
            requestOption.headers['content-type'] = 'application/json';
        }
        
        switch(type.toLowerCase()){         
            case 'post': restRequest = restler.post(url + '?u=0&xt=' + this.cookies['xt'], requestOption);
              break;
            default : restRequest = restler.get(url, requestOption);
        }
          

        restRequest.on('complete', function(result, response ) {
            if(result instanceof Error || response.statusCode != 200){
                console.log(result);
                callback(result, response);
            } else {
                callback(result, response);
            }
        });
    }
}

exports.GoogleMusicApi = GoogleMusic;