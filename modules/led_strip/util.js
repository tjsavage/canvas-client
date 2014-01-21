module.exports.HSVtoRGB = function(hsvData) {
	var chroma = hsvData.v * hsvData.s;
	var hprime = hsvData.h / 60.0;
	var x = chroma * (1 - Math.abs(hprime % 2 - 1));
	
	var rgb1 = {
		r: 0,
		g: 0,
		b: 0
	};

	if (typeof hsvData.h === 'undefined') {
		rgb1 = {r: 0, g:0, b:0};
	} else if (hprime >= 0 && hprime < 1) {
		rgb1 = {r:chroma, g:x, b:0};
	} else if (hprime >= 1 && hprime < 2) {
		rgb1 = {r:x, g:chroma, b:0};
	} else if (hprime >= 2 && hprime < 3) {
		rgb1 = {r:0, g:chroma, b:x};
	} else if (hprime >= 3 && hprime < 4) {
		rgb1 = {r:0, g:x, b:chroma};
	} else if (hprime >= 4 && hprime < 5) {
		rgb1 = {r:x, g:0, b:chroma};
	} else if (hprime >= 5 && hprime < 6) {
		rgb1 = {r:chroma, g:0, b:x};
	} else {
		rgb1 = {r:0, g:0, b:0};
	}

	var m = hsvData.v - chroma;
	return {
		"r": (rgb1.r + m) * 255,
		"g": (rgb1.g + m) * 255,
		"b": (rgb1.b + m) * 255
	};
};

module.exports.RGBtoHSV = function(rgbData) {
	var hsv = {h:0, s:0, v:0};
	var r = rgbData.r / 255.0;
	var g = rgbData.g / 255.0;
	var b = rgbData.b / 255.0;

	var minRGB = Math.min(r, Math.min(g,b));
	var maxRGB = Math.max(r,Math.max(g,b));

	if (minRGB == maxRGB) {
		hsv.v = minRGB;
		return hsv;
	}

	var d = (r == minRGB) ? (g-b) : ((b == minRGB) ? (r-g) : (b-r))
	var h = (r == minRGB) ? (3) : ((b == minRGB) ? 1 : 5);
	hsv.h = 60 * (h - d / (maxRGB - minRGB));
	hsv.s = (maxRGB - minRGB) / maxRGB;
	hsv.v = maxRGB;
	return hsv;
}