/**
 * Color Object
 * @param settings {Object}
 * @param settings.r {Number} [0-255]
 * @param settings.g {Number} [0-255]
 * @param settings.b {Number} [0-255]
 * @param settings.a {Number} [0-1]
 * @return {kan.Color}
 */
kan.Color = function(settings) {
	kan.Object.call(this, settings);
};

kan.Color.prototype = {
	info: {
		type: 'Color',
		getType: function() {
			return kan.Color;
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
	 * @return {kan.Color} this
	 */
    inverts: function () {
        this.r = Math.abs(this.r - 255);
        this.g = Math.abs(this.g - 255);
        this.b = Math.abs(this.b - 255);
        return this;
    },
    /**
     * Check if this RGBA components are equals to another instance of kan.Color
     * @override
     * @param {kan.Color} o	other color
     * @returns {Boolean}
     */
    equals: function(o) {
    	return this.r == o.r && this.g == o.g && this.b == o.b && this.a == o.a;
    },
	/**
	* Compare two colors
	* @override
	* @param {kan.Color}
	* @return {kan.Color}
	*/
    compare: function(o) {
    	var r=0,g=0,b=0;
    	if (this.r > o.r) { r=1; } else if (this.r < o.r) { r=-1; }
    	if (this.g > o.g) { g=1; } else if (this.g < o.g) { g=-1; }
    	if (this.b > o.b) { b=1; } else if (this.b < o.b) { b=-1; }
    	if (this.a > o.a) { a=1; } else if (this.a < o.a) { a=-1; }
    	return new kan.Color({
    		r: r,
    		g: g,
    		b: b,
    		a: a
    	});
    },
	/**
	* Clone this instance of object
	* @override
	* @return {kan.Color}
	*/
    clone: function() {
    	return new kan.Color({
    		r: this.r,
    		g: this.g,
    		b: this.b,
    		a: this.a
    	});
    }
};
kan.extend(kan.Color, kan.Object);
/**
 * Reverse color without changing instance
 * @param {Number} o
 * @return {kan.Color}
 */
kan.Color.invert = function(o) {
	return new kan.Color({
		r: Math.abs(o.r - 255),
		g: Math.abs(o.g - 255),
		b: Math.abs(o.b - 255),
		a: o.a
	});
};
/**
 * Get a random color
 * @return {kan.Color}
 */
kan.Color.random = function() {
    return new kan.Color({
		r: Math.floor(Math.random() * 256), 
		g: Math.floor(Math.random() * 256),
		b: Math.floor(Math.random() * 256), 
		a: 1
	});
};

/**
* get the black color
* @return {kan.Color}
*/
kan.Color.BLACK = function() { return new kan.Color({ name:'black', r: 0, g: 0, b: 0 }); };
/**
* get the WHITE color
* @return {kan.Color}
*/
kan.Color.WHITE = function() { return new kan.Color({ r: 255, g: 255, b: 255, name:'white' }); };
/**
* get the RED color
* @return {kan.Color}
*/
kan.Color.RED = function() { return new kan.Color({ r: 255, name: 'red' }); };
/**
* get the GREEN color
* @return {kan.Color}
*/
kan.Color.GREEN = function() { return new kan.Color({ g: 255, name:'green' }); };
/**
* get the BLUE color
* @return {kan.Color}
*/
kan.Color.BLUE = function() { return new kan.Color({ b: 255, name:'blue' }); };
/**
* get the YELLOW color
* @return {kan.Color}
*/
kan.Color.YELLOW = function() { return new kan.Color({ r: 255, g: 255, name:'yellow' }); };
/**
* get the MAGENTA color
* @return {kan.Color}
*/
kan.Color.MAGENTA = function() { return new kan.Color({ r: 255, b: 255, name:'magenta' }); };
/**
* get the AQUA color
* @return {kan.Color}
*/
kan.Color.AQUA = function() { return new kan.Color({ g: 255, b: 255, name:'aqua' }); };
/**
* get the ORANGE color
* @return {kan.Color}
*/
kan.Color.ORANGE = function() { return new kan.Color({ r: 255, g: 165, name:'orange' }); };
/**
* get the PURPLE color
* @return {kan.Color}
*/
kan.Color.PURPLE = function() { return new kan.Color({ r: 160, g: 32, b: 240, name:'purple' }); };
/**
* get the PINK color
* @return {kan.Color}
*/
kan.Color.PINK = function() { return new kan.Color({ r: 255, g: 192, b: 203, name:'pink' }); };
/**
* get the CORNFLOWERBLUE color
* @return {kan.Color}
*/
kan.Color.CORNFLOWERBLUE = function() { return new kan.Color({ r: 100, g: 149, b: 237, name:'cornflower blue' }); }
/**
* get a gray color
* @return {kan.Color}
*/
kan.Color.Gray = function(factor) {
	return (new kan.Color({ name: 'Gray '+factor, r: factor, g: factor, b: factor }));
};
