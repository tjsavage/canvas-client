var util = require("./util");

function LightStrips(device, num_pixels, spiDevice) {
    this.gamma = [];
    
    for(var i = 0; i <= 255; i++){
            // Color calculations from
            // http://learn.adafruit.com/light-painting-with-raspberry-pi
            this.gamma[i] = 0x80 | ~~(Math.pow(i / 255.0, 2.5) * 127.0 + 0.5);
    }
    
    this.num_pixels = num_pixels;
    this.pixel_buffer = new Buffer(num_pixels*3);
    this.off_buffer = new Buffer(num_pixels*3);
    this.device = spiDevice;
    this.device.open();
    this.pixel_buffer.fill(0);
    this.state = {};
    this.setColor({
        r: 0,
        g: 0,
        b: 0
    });
    this.off();
    this.animate = null;
  
}

LightStrips.prototype.off = function() {
    this.setColor({
        v: 0
    });
};

LightStrips.prototype.sync = function() {
    this.device.write(this.pixel_buffer);
    this.device.write(new Buffer([0x00,0x00,0x00]));
    
};

LightStrips.prototype.all = function(r,g,b) {
    for(var i = 0; i < this.num_pixels; i++) {
        this.set(i, r, g, b);
    }
};

LightStrips.prototype.fill = function(r, g, b, start, end) {
    
    var to = this.num_pixels < end ? this.num_pixels : end;
    var from = start || 0;
    for(var i = from; i < to; i++) {
        this.set(i, r, g, b);
    }
};

LightStrips.prototype.clear = function() {
    this.pixel_buffer.fill(this.gamma[0]);
};

LightStrips.prototype.set = function(pixel, r, g, b) {
    this.pixel_buffer[pixel*3] = this.gamma[Math.floor(g)];
    this.pixel_buffer[pixel*3+1] = this.gamma[Math.floor(r)];
    this.pixel_buffer[pixel*3+2] = this.gamma[Math.floor(b)];
};

LightStrips.prototype.setColor = function(colorData) {
    var newColorData = this.state.color;
    var rgbChanged = false;
    var hsvChanged = false;
    if (typeof colorData.r != 'undefined') {
        newColorData.r = colorData.r;
        rgbChanged = true;
    }
    if (typeof colorData.g != 'undefined') {
        newColorData.g = colorData.g;
        rgbChanged = true;
    }
    if (typeof colorData.b != 'undefined') {
        newColorData.b = colorData.b;
        rgbChanged = true;
    }
    if (typeof colorData.h != 'undefined') {
        newColorData.h = colorData.h;
        hsvChanged = true;
    }
    if (typeof colorData.s != 'undefined') {
        newColorData.s = colorData.s;
        hsvChanged = true;
    }
    if (typeof colorData.v != 'undefined') {
        newColorData.v = colorData.v;
        hsvChanged = true;
    }
    if (hsvChanged && !rgbChanged) {
        var newRGBData = util.HSVtoRGB(newColorData);
        newColorData.r = newRGBData.r;
        newColorData.g = newRGBData.g;
        newColorData.b = newRGBData.b;
    } else if (rgbChanged && !hsvChanged) {
        var newHSVData = util.RGBtoHSV(newColorData);
        newColorData.h = newHSVData.h;
        newColorData.s = newHSVData.s;
        newColorData.v = newHSVData.v;
    }
    this.all(newColorData.r, newColorData.g, newColorData.b);
    this.state.color = newColorData;
    this.sync();
};

LightStrips.prototype.setValue = function(valuePercentage) {
    this.setColor({
        v: valuePercentage
    });
};

LightStrips.prototype.setHue = function(newHue) {
    this.setColor({
        h: newHue
    });
};

module.exports.LightStrips = LightStrips;
