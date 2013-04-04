/**
 * Color Object
 * @param settings {Object}
 * @param settings.r {Number} [0-255]
 * @param settings.g {Number} [0-255]
 * @param settings.b {Number} [0-255]
 * @param settings.a {Number} [0-1]
 * @return {ec.Color}
 */
ec.Color = function(settings) {
	ec.Object.call(this, settings);
};

ec.Color.prototype = {
	info: {
		type: 'Color',
		getType: function() {
			return ec.Color;
		}
	},
	r: 0,
	g: 0,
	b: 0,
	a: 1,
	valid: function() {
		this.r = this.r > 255 ? 255 : this.r < 0 ? 0 : this.r;
		this.g = this.g > 255 ? 255 : this.g < 0 ? 0 : this.g;
		this.b = this.b > 255 ? 255 : this.b < 0 ? 0 : this.b;
	},
	/**
	 * return the color as HexaDecimal
	 * @return {String}
	 */
	toHexa: function() {
		this.valid();
		return '#' + ((1 << 24) + (this.r << 16) + (this.g << 8) + this.b).toString(16).slice(1);
	},
	/**
	 * return this color as rgba(r, g, b, a) string
	 * @override
	 * @return {String}
	 */
	toString: function() {
		return '{ r: ' + this.r + ', g: ' + this.g + ', b: ' + this.b + ', a: ' + this.a + ' }';
	},
	toRGBA: function() {
		this.valid();
		return 'rgba( ' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a + ')';
	},
	toRGB: function() {
		this.valid();
		return 'rgb( ' + this.r + ', ' + this.g + ', ' + this.b + ')';
	},
	/**
	 * Reverse this instance of color
	 * @return {ec.Color} this
	 */
    inverts: function () {
        this.r = Math.abs(this.r - 255);
        this.g = Math.abs(this.g - 255);
        this.b = Math.abs(this.b - 255);
        return this;
    },
    /**
     * Check if this RGBA components are equals to another instance of ec.Color
     * @override
     * @param {ec.Color} o	other color
     * @returns {Boolean}
     */
    equals: function(o) {
    	return this.r == o.r && this.g == o.g && this.b == o.b && this.a == o.a;
    },
	/**
	* Compare two colors
	* @override
	* @param {ec.Color}
	* @return {ec.Color}
	*/
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
	/**
	* Clone this instance of object
	* @override
	* @return {ec.Color}
	*/
    clone: function() {
    	return new ec.Color({
    		r: this.r,
    		g: this.g,
    		b: this.b,
    		a: this.a
    	});
    }
};
ec.extend(ec.Color, ec.Object);
/**
 * Reverse color without changing instance
 * @param {Number} o
 * @return {ec.Color}
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
 * @return {ec.Color}
 */
ec.Color.random = function() {
    return new ec.Color({
		r: Math.floor(Math.random() * 256), 
		g: Math.floor(Math.random() * 256),
		b: Math.floor(Math.random() * 256), 
		a: 1
	});
};

/**
* get the black color
* @return {ec.Color}
*/
ec.Color.BLACK = function() { return new ec.Color({ name:'black', r: 0, g: 0, b: 0 }); };
/**
* get the WHITE color
* @return {ec.Color}
*/
ec.Color.WHITE = function() { return new ec.Color({ r: 255, g: 255, b: 255, name:'white' }); };
/**
* get the RED color
* @return {ec.Color}
*/
ec.Color.RED = function() { return new ec.Color({ r: 255, name: 'red' }); };
/**
* get the GREEN color
* @return {ec.Color}
*/
ec.Color.GREEN = function() { return new ec.Color({ g: 255, name:'green' }); };
/**
* get the BLUE color
* @return {ec.Color}
*/
ec.Color.BLUE = function() { return new ec.Color({ b: 255, name:'blue' }); };
/**
* get the YELLOW color
* @return {ec.Color}
*/
ec.Color.YELLOW = function() { return new ec.Color({ r: 255, g: 255, name:'yellow' }); };
/**
* get the MAGENTA color
* @return {ec.Color}
*/
ec.Color.MAGENTA = function() { return new ec.Color({ r: 255, b: 255, name:'magenta' }); };
/**
* get the AQUA color
* @return {ec.Color}
*/
ec.Color.AQUA = function() { return new ec.Color({ g: 255, b: 255, name:'aqua' }); };
/**
* get the ORANGE color
* @return {ec.Color}
*/
ec.Color.ORANGE = function() { return new ec.Color({ r: 255, g: 165, name:'orange' }); };
/**
* get the PURPLE color
* @return {ec.Color}
*/
ec.Color.PURPLE = function() { return new ec.Color({ r: 160, g: 32, b: 240, name:'purple' }); };
/**
* get the PINK color
* @return {ec.Color}
*/
ec.Color.PINK = function() { return new ec.Color({ r: 255, g: 192, b: 203, name:'pink' }); };
/**
* get the CORNFLOWERBLUE color
* @return {ec.Color}
*/
ec.Color.CORNFLOWERBLUE = function() { return new ec.Color({ r: 100, g: 149, b: 237, name:'cornflower blue' }); }
/**
* get a gray color
* @return {ec.Color}
*/
ec.Color.Gray = function(factor) {
	return (new ec.Color({ name: 'Gray '+factor, r: factor, g: factor, b: factor }));
};
