/**
 * Color Object
 * @param settings {Object}
 * @param settings.r {Number} [0-255]
 * @param settings.g {Number} [0-255]
 * @param settings.b {Number} [0-255]
 * @param settings.a {Number} [0-1]
 * @returns {ec.Color}
 */
ec.Color = function(settings) {
	ec.Object.call(this, settings);
};

ec.Color.prototype = {
	info: {
		type: 'ec.Color',
		getType: function() {
			return ec.Color;
		}
	},
	r: 0,
	g: 0,
	b: 0,
	a: 1,
	/**
	 * return the color as HexaDecimal
	 * @returns {String}
	 */
	toHexa: function() {
		return '#' + ((1 << 24) + (this.r << 16) + (this.g << 8) + this.b).toString(16).slice(1);
	},
	/**
	 * return this color as rgba(r, g, b, a) string
	 * @return {String}
	 */
	toString: function() {
		return 'rgba( ' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a + ')';
	},
	/**
	 * Reverse this instance of color
	 * @returns {ec.Color} this
	 */
    inverts: function () {
        this.r = Math.abs(this.r - 255);
        this.g = Math.abs(this.g - 255);
        this.b = Math.abs(this.b - 255);
        return this;
    },
    /**
     * Check if this RGBA components are equals to another instance of ec.Color
     * @param o	{ec.Color}	other color
     * @returns {Boolean}
     */
    equals: function(o) {
    	return this.r == o.r && this.g == o.g && this.b == o.b && this.a == o.a;
    },
    compare: function(o) {
    	var r=0,g=0,b=0;
    	if (this.r > o.r) { r=1; } else if (this.r < o.r) { r=-1; }
    	if (this.g > o.g) { g=1; } else if (this.g < o.g) { g=-1; }
    	if (this.b > o.b) { b=1; } else if (this.b < o.b) { b=-1; }
    	if (this.a > o.a) { a=1; } else if (this.a < o.a) { a=-1; }
    	return new ec.Color({
    		r: r,
    		g: g,
    		b: b,
    		a: a
    	});
    },
    clone: function() {
    	return new ec.Color({
    		r: this.r,
    		g: this.g,
    		b: this.b,
    		a: this.a
    	});
    }
};
/**
 * Reverse color without changing instance
 * @param {Number} o
 * @type ec.Color
 * @returns {ec.Color}
 */
ec.Color.invert = function(o) {
	return new ec.Color({
		r: Math.abs(o.r - 255),
		g: Math.abs(o.g - 255),
		b: Math.abs(o.b - 255),
		a: o.a
	});
};
/**
 * Get a random color
 * @returns {ec.Color}
 */
ec.Color.random = function () {
    return new ec.Color(Math.random() * 256, Math.random() * 256, Math.random() * 256, 1);
};
ec.extend(ec.Color, ec.Object);
/**
 * 
 * @type ec.Color
 * @returns {ec.Color}
 */
ec.Color.BLACK = function() { return new ec.Color({ name:'black' }); };
ec.Color.WHITE = function() { return new ec.Color({ r: 255, g: 255, b: 255, name:'white' }); };
ec.Color.RED = function() { return new ec.Color({ r: 255, name: 'red' }); };
ec.Color.GREEN = function() { return new ec.Color({ g: 255, name:'green' }); };
ec.Color.BLUE = function() { return new ec.Color({ b: 255, name:'blue' }); };
ec.Color.YELLOW = function() { return new ec.Color({ r: 255, g: 255, name:'yellow' }); };
ec.Color.MAGENTA = function() { return new ec.Color({ r: 255, b: 255, name:'magenta' }); };
ec.Color.AQUA = function() { return new ec.Color({ g: 255, b: 255, name:'aqua' }); };
ec.Color.ORANGE = function() { return new ec.Color({ r: 255, g: 165, name:'orange' }); };
ec.Color.PURPLE = function() { return new ec.Color({ r: 160, g: 32, b: 240, name:'purple' }); };
ec.Color.PINK = function() { return new ec.Color({ r: 255, g: 192, b: 203, name:'pink' }); };
ec.Color.Gray = function(factor) {
	return (new ec.Color({ name: 'Gray '+factor, r: factor, g: factor, b: factor }));
};