/**
* EasyCanvas
* @package ec
* @version 0.2.5 (2013-03-14)
* @author Matthieu BOHEAS <matthieuboheas@gmail.com>
* @copyright Copyright (c) 2013 Matthieu BOHEAS
* @link https://github.com/Kelgors/EasyCanvas
* @license http://opensource.org/licenses/mit-license.php MIT License
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy of this
* software and associated documentation files (the "Software"), to deal in the Software
* without restriction, including without limitation the rights to use, copy, modify, merge,
* publish, distribute, sublicense, and/or sell copies of the Software, and to permit
* persons to whom the Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
* INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
* PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
* OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function() {

window.ec = {
	/** 
	* @type {String}
	* @const 
	*/
	LANG: 'FR-fr',
	/** 
	* @type {Boolean}
	* @const 
	*/
	DEBUG: false,
	/**
	* Extend a type with another type
	* @param {?}
	* @param {ec.Object} an ec.Object's type
	*/
	extend: function(that, p) {
		/* Inheritance based on John Resigs code
		* http://ejohn.org/blog/simple-javascript-inheritance */
		var fnTest = /xyz/.test(function(){xyz;}) ? /\bparent\b/ : /.*/;
		/* parent object */
		var parent = p.prototype;
		/* the object to extends */
		var prop = that.prototype;
		/* the final prototype */
		var prototype = {};
		var type = that.prototype.info.type.split('.')[1];
		/* Loop each value of that.prototype (this) */
		for (var name in prop){
			if (typeof(prop[name]) == 'function'
			 && typeof(parent[name]) == 'function'
			 && fnTest.test(prop[name])) 
			{
				prototype[name] = (function(name, fn){
					return function() {
						var tmp = this.parent;
						this.parent = parent[name];
						var ret = fn.apply(this, arguments);			 
						this.parent = tmp;
						return ret;
					};
				})( name, prop[name] );
			} else {
				prototype[name] = prop[name];
			}
		}
		/* Loop each value of p.prototype (parent) */
		for( var name in parent ) {
			if ( !prototype[name] && name != 'to'+type ) {
				prototype[name] = parent[name];
			} else if ( prototype[name] && ec.isNativeFunction(prototype[name]) ) {
				prototype[name] = parent[name];
			}
		}
		/* Avoid to copy adress values of internal parent object */
		
		that.prototype = ec._clone(prototype);
		that.prototype.info.parent = ec._clone(p.prototype.info);
	},
	/**
	* _clone make a deep copy of an object
	* @param {*} the object to clone
	* @return {*} the cloned object
	*/
	_clone: function(obj) {
		if(obj == null || typeof(obj) != 'object') { return obj; }
		if (obj instanceof Array) { return obj.slice(0); }
		var temp = obj.constructor(); // changed
		for(var key in obj)
			temp[key] = ec._clone(obj[key]);
		return temp;
	},
	/**
	* Execute a function when the DOM is ready
	* @param {Function}
	*/
	ready: function(fn, stages) {
		if(!fn){return;}
		var f = null;
		f = function(e) {
			if (document.removeEventListener) {
				document.removeEventListener('DOMContentLoaded', f, false);
			} else if (document.detachEvent) {
				document.detachEvent('DOMContentLoaded', f, false);
			}
			fn();
		};
		
		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', f, false);
		} else if (document.attachEvent) {
			document.attachEvent('DOMContentLoaded', f, false);
		}
	},
	/**
	* Check the requestAnimationFrame Function
	*/
	_set_requestAnimFrame: function () {
        window.requestAnimFrame = (function () {
            return (window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                }
            );
        })();
    },
	/**
	* Check if the function f is a native function or not
	* @param {function}
	* @return {boolean} true if the function is browser native
	*/
	isNativeFunction: function(f) {
	    return !!f && (typeof f).toLowerCase() == 'function' 
            && (f === Function.prototype 
            || /^\s*function\s*(\b[a-z$_][a-z0-9$_]*\b)*\s*\((|([a-z$_][a-z0-9$_]*)(\s*,[a-z$_][a-z0-9$_]*)*)\)\s*{\s*\[native code\]\s*}\s*$/i.test(String(f)));
	},
	equal: function(o1, o2) {
		/* Different types */
		if (typeof(o1) != typeof(o2)) { return false; }
		/* not object */
		if (typeof(o1) != 'object') { return o1 === o2; }
		/* check object equality */
		for (var i in this) {
			switch(typeof(this[i])) {
				case 'function': continue;
				case 'object':
					if (this[i] instanceof Date && o[i] instanceof Date) {
					/* Date equals */
						if (this[i].getTime() != o[i].getTime()) {
							return false;
						}
					} else if (
							this[i] instanceof Array 
						&& o[i] instanceof Array 
						&& this[i].length == o[i].length
						|| this[i] instanceof Object
						&& o[i] instanceof Object
					) {
					/* Array/Object equals */
						for (var n in this[i]) {
							if (typeof(this[i][n]) == 'function') { continue; }
							if (this[i][n].equals) {
								/* Array/Object of ec.Object */
								if (!this[i][n].equals(o[i][n])) {
									return false;
								}
							} else if (typeof(this[i][n]) == 'object' && typeof(o[i][n]) == 'object') {
								/* Array/Object of object */
								if (!ec.equal(this[i][n], o[i][n])) {
									return false;
								}
							} else {
								if (this[i][n] !== o[i][n]) {
									return false;
								}
							}
						}
					} else { return false; }
					break;
				default:
					if (this[i] !== o[i]) { return false; } 
					break;
			}
			
		}
	},
	/**
	* Guid Object
	* @define {Object}
	*/
	Guid: {
		/**
		* Create a uuid
		* @param {Boolean=} if false, uuid without dashes
		* @return {String}
		*/
		create: function(dashes) {
			dashes = dashes == null ? true : dashes;
			/* http://www.ietf.org/rfc/rfc4122.txt */
			var s = [];
			var hexDigits = "0123456789abcdef";
			for (var i = 0; i < 36; i++) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			}
			s[14] = "4";  /* bits 12-15 of the time_hi_and_version field to 0010 */
			s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  /* bits 6-7 of the clock_seq_hi_and_reserved to 01 */
			s[8] = s[13] = s[18] = s[23] = dashes ? '-' : '';

			var uuid = s.join("");
			return uuid;
		}
	},
	Number: {
		compare: function(n1, n2) {
			if (n1 > n2) {
				return 1; 
			} else if (n1 < n2) {
				return -1;
			}
			return 0;
		}
	}
};
window.ec._set_requestAnimFrame();

ec.Mouse = {
	/**
	 * Get the absolute mouse position as ec.Point from Event 
	 * @param {MouseEvent} e
	 * @type ec.Point
	 * @returns {ec.Point}
	 */
	getAbsolutePosition: function(e) {
		return new ec.Point({
			x: e.clientX,
			y: e.clientY
		});
	},
	/**
	 * Get the relative mousePosition as ec.Point from Event
	 * @param {MouseEvent} e
	 * @type ec.Point
	 * @returns {ec.Point}
	 */
	getPosition: function(e) {
		return new ec.Point({
			x: e.layerX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft),
			y: e.layerY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)
		});
	},
	/**
	 * Get the relative X component of mouse position from an Event
	 * @param {MouseEvent} e
	 * @type Number
	 * @returns {Number}
	 */
	getX: function(e) {
		return e.layerX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	},
	/**
	 * Get the relative Y component of mouse position from an Event
	 * @param {MouseEvent} e
	 * @type Number
	 * @returns {Number}
	 */
	getY: function(e) {
		return e.layerY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
	}
};

/**
* An event manager
* @constructor
* @type {ec.EventManager}
* @return {ec.EventManager}
*/
ec.EventManager = function() {
	this.state = {
		clicked: false,
		pressed: false,
		dragging: false
	};
};

ec.EventManager.prototype = {
	state: null,
	execute: function(e) {
		var dontStop = true;
		if (this[e.type]) {
			for (var i in this[e.type]) {
				if (typeof(this[e.type][i]) == 'function') {
					if (this[e.type][i](e) == false) {
						dontStop = false;
					}
				}
			}
		}
		return dontStop;
	},
	reset: function() {
		for(var i in this.state) {
			if (typeof(this.state[i]) == 'boolean') {
				this.state[i] = false;
			}
		}
	},
	click: null,
	mouseup: null,
	mousedown: null
	/* etc... */
};

/**
 * Basic instance
 * @constructor
 * @type {ec.Object}
 * @return {ec.Object}
 */
ec.Object = function(settings) {
	for( var i in settings ) {
		this[i] = settings[i];
	}
	this.info.ID = ec.Guid.create();
};

ec.Object.prototype = {
	info: {
		ID: null,
		type: 'Object',
		getType: function() {
			return ec.Object;
		}
	},
	/**
	 * Return a clone of this instance
	 * @type {ec.Object}
	 * @return	{ec.Object} the cloned object
	 */
	clone: function() {
		var o = this.info ? new ec[this.info.type]() : this.constructor();
		for(var i in this) {
			if (!this[i]) { continue; }
			if (typeof(this[i]) == 'object') {
				o[i] = this[i].inheritsof ? this[i].clone() : ec._clone(this[i]);
			} else if (typeof(this[i]) != 'function') {
				o[i] = this[i];
			}
		}
		return o;
	},
	/**
	 * Check if each value of this equals to others value
	 * @param o {ec.Object} other
	 * @type {boolean}
	 * @returns {boolean}
	 */
	equals: function(o) {
		if (!o.inheritsof) { return false; }
		if (o.inheritsof(ec.Object)) {
			for (var i in this) {
				switch(typeof(this[i])) {
					case 'function': continue;
					case 'object':
						if (this[i] instanceof Date && o[i] instanceof Date) {
						/* Date equals */
							if (this[i].getTime() != o[i].getTime()) {
								return false;
							}
						} else if (this[i] instanceof Array && o[i] instanceof Array && this[i].length == o[i].length) {
						/* Array equals */
							for (var n in this[i]) {
								if (this[i][n].equals) {
									/* Array of ec.Object */
									if (!this[i][n].equals(o[i][n])) {
										return false;
									}
								} else if (typeof(this[i][n]) == 'object' && typeof(o[i][n]) == 'object') {
									/* Array of object */
									if (!(new ec.Object(this[i][n]).equals(o[i][n]))) {
										return false;
									}
								} else {
									return false;
								}// TODO: finish ec.Object.prototype.equals()
							}
						}
						break;
					default: 
						if (this[i] !== o[i]) { return false; } 
						break;
				}
				
			}
			return true;
		}
		return false;
	},
	/**
	 * Compare two instances
	 * @param {ec.Object} o
	 * @type {ec.Object}
	 * @return {ec.Object}
	 */
	compare: function(o) {
		var t = new ec[this.info.type]();
		for (var i in this) {
			switch(typeof(this[i])) {
				case 'number':
					t[i] = ec.Number.compare(this[i], o[i]); break;
				case 'string':
					t[i] = this[i].localeCompare(o[i]); break;
				case 'boolean':
					t[i] = this[i] == o[i]; break;
				case 'object':
					if (this[i].compare) {
						/* Compare these two ec.Object */
						t[i] = this[i].compare(o[i]);
					} else if (o[i] instanceof Date) {
						/* compare their timestamp */
						t[i] = ec.Number.compare(this[i].getTime(), o[i].getTime());
					} else if (o[i] instanceof Array) {
						/* compare arrays length */
						t[i] = ec.Number.compare(this[i].length, o[i].length);
					} else {
						/* Create a new ec.Object with the javascript object and compare them */
						t[i] = new ec.Object(this[i]).compare(o[i]);
					}
					break;
			}
			return t;
		}
	},
	/**
	* Get the JSON representation of this instance
	* @return {String}
	*/
	stringify: function() {
		return JSON.stringify(this, function(k, v) {
			if (k === 'parent') {
				return undefined;
			}
			return v;
		});
	},
	/**
	*  Equivalent of instanceof but for ec.Objects
	*  @param {ec.Type} the type of object ( ec.Object, not 'ec.Object' )
	*  @type {boolean}
	*  @return {boolean}
	*/
	inheritsof: function(type) {
		return this._getInheritance(this.info).match(new RegExp( type.prototype.info.type )) == type.prototype.info.type;
	},
	_getInheritance: function(info) {
		return info.parent != null
			? info.type + '|' + this._getInheritance(info.parent)
			: info.type;
	},
	/**
	* Return this type as String
	* @return {String}
	*/
	toString: function(){
		return this.info.type;
	}
	
};

/**
* A font
* @param {Object} settings
* @param {ec.Color|String} settings.fill the fill color of this font
* @param {ec.Color|String} settings.stroke the stroke color of this font
* @param {Number} settings.lineWidth the stroke line width, as default: 1
* @param {String} settings.family the font family, as default: Arial
* @param {Number} settings.size the font size, as default: 12
* @param {String|Number} settings.weight normal|bold|bolder|100-900
* @param {String} settings.baseLine the horizontal alignement (top|middle|bottom|alphabetic|ideographic)
* @param {String} settings.textAlign the vertical alignement (left|right|center)
* @param {String} settings.style the font style (normal|italic|underline)
* @param {Boolean} settings.smallcaps text as smallcaps or not, as default: false
* @constructor
* @extends {ec.Object}
* @type {ec.Font}
* @return {ec.Font}
*/
ec.Font = function(settings) {
	ec.Object.call(this, settings);
};

ec.Font.prototype = {
	info: {
		type: 'ec.Font',
		getType: function() {
			return ec.Font;
		}
	},
	style: 'normal',
	smallcaps: true,
	weight: 'normal',
	family: 'Arial',
	fill: null,
	stroke: null,
	size: 12,
	lineWidth: 1,
	baseLine: 'top',
	textAlign: 'left',
	set: function(ctx) {
		this.applyFont(ctx);
		ctx.lineWidth = this.lineWidth;
		if (this.fill)
			ctx.fillStyle = this.fill instanceof ec.Color ? this.fill.toHexa() : this.fill;
		if (this.stroke)
			ctx.strokeStyle = this.stroke instanceof ec.Color ? this.stroke.toHexa() : this.stroke;
	},
	applyFont: function(ctx) {
		var caps = '';
		if (this.smallcaps) { caps = 'small-caps'; }
		ctx.font = caps+' '+this.style+' '+this.weight+' '+this.size+'px '+' '+this.family;
		ctx.textBaseline = this.baseLine;
		ctx.textAlign = this.textAlign;
	}
};

ec.extend(ec.Font, ec.Object);

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
		type: 'Color',
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
ec.Color.BLACK = function() { return new ec.Color({ name:'black', r: 0, g: 0, b: 0 }); };
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
ec.Color.CORNFLOWERBLUE = function() { return new ec.Color({ r: 100, g: 149, b: 237, name:'cornflower blue' }); }
ec.Color.Gray = function(factor) {
	return (new ec.Color({ name: 'Gray '+factor, r: factor, g: factor, b: factor }));
};

/**
 * Point object as a simple point
 * @param settings		{Object}
 * @param settings.x	{Number}	X Component
 * @param settings.y	{Number}	Y Component
 * @constructor
 * @extends {ec.Object}
 * @type {ec.Point}
 * @returns {ec.Point}
 */
ec.Point = function(settings) {
	this.x = this.y = 0;
	if(settings) {
		ec.Object.call(this, settings);
	}
};
ec.Point.prototype = {
	info:{
		type: 'Point',
		getType: function() {
			return ec.Point;
		}
	},
	/** @define {number} */
	x: 0,
	/** @define {number} */
	y: 0,
	/**
	 * Check if X-Y component are equals to this instance
	 * @override
	 * @param {ec.Point}
	 * @returns {boolean}
	 */
	equals: function(o) {
		if ( o.x && o.y ) {
			return this.x == o.x && this.y == o.y;
		}
		return false;
	},
	/**
	 * Performs a comparison between two points
	 * @override
	 * @param {ec.Point} o
	 * @type {ec.Point}
	 * @returns	{ec.Point}
	 */
	compare: function(o) {
		if ( o.x != null && o.y != null ) {
			var x = 0, y = 0;
			if (this.x > o.x) { x = 1; } else if (this.x < o.x) { x = -1; }
			if (this.y > o.y) { y = 1; } else if (this.y < o.y) { y = -1; }
			return new ec.Point({
				x: x,
				y: y
			});
		}
		return null;
	},
	/**
	 * get the string representation of this object
	 * @override
	 * @type {String}
	 * @return {String}
	 */
	toString: function() {
		return '{ x: ' + this.x + ', y: ' + this.y + ' }'; 
	},
	/**
	 * Return this instance of Point as a Vector2
	 * @type {ec.Vector2}
	 * @returns {ec.Vector2}
	 */
	toVector2: function() {
		return new ec.Vector2({
			x: this.x,
			y: this.y
		});
	}
};
ec.extend(ec.Point, ec.Object);

/**
 * Vector object with two components
 * @param settings		{Object}
 * @param settings.x	{Number}	X Component
 * @param settings.y	{Number}	Y Component
 * @constructor
 * @extends {ec.Point}
 * @type {ec.Vector2}
 * @returns {ec.Vector2}
 */
ec.Vector2 = function(settings) {
	ec.Point.call(this, settings);
};

ec.Vector2.prototype = {
	info: {
		type: 'Vector2',
		getType: function() {
			return ec.Vector2;
		}
	},
	/**
	 * Add to each value of this instance o
	 * @param o {Number|ec.Point} Numeric value|Other Point
	 * @returns {ec.Vector2} this instance
	 */
	adds: function(value){
		if ( typeof(value) == 'number' ) {
			this.x += value;
			this.y += value;
		} else if ( value.x != null && value.y != null ) {
			this.x += value.x;
			this.y += value.y;
		}
		return this;
	},
	/**
	 * Substract to each value of this instance o
	 * @param {Number|ec.Point} Numeric value|Other Point
	 * @returns {ec.Vector2} this instance
	 */
	substracts: function(value){
		if ( typeof(value) == 'number' ) {
			this.x -= value;
			this.y -= value;
		} else if ( value.x != null && value.y != null ) {
			this.x -= value.x;
			this.y -= value.y;
		}
		return this;
	},
	/**
	 * Multiply each component of this instance by value
	 * @param value {Number|ec.Point} Scalar value|Other Point
	 * @returns {ec.Vector2} this instance
	 */
	multiplies: function(value){ 
		if ( typeof(value) == 'number' ) {
			this.x *= value;
			this.y *= value;
		} else if ( value.x != null && value.y != null ) {
			this.x *= value.x;
			this.y *= value.y;
		}
		return this;
	},
	/**
	 * Divide each component of this instance by value
	 * @param value {Number|ec.Point} Scalar value|Other Point
	 * @returns {ec.Vector2} this instance
	 */
	divides: function(value){
		if ( typeof(value) == 'number' ) {
			this.x /= value;
			this.y /= value;
		} else if ( value.x != null && value.y != null ) {
			this.x /= value.x;
			this.y /= value.y;
		}
		return this;
	},
	/**
	 * Get distance between this and another Vector2 instance
	 * @param o {ec.Point}
	 * @returns	{Number|NaN}
	 */
	distance: function(o) {
		if ( o.x != null && o.y != null ) {
			return Math.sqrt(Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2));
		}
		return NaN;
	},
	/**
	 * Get distance squared between this and another Vector2 instance
	 * @param o {ec.Vector2}
	 * @returns	{Number|NaN}
	 */
	distanceSquared: function(o) {
		if ( o.x != null && o.y != null ) {
			return Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2);
		}
		return NaN;
	},
	/**
	 * Performs a comparison between two Vector2
	 * @override
	 * @param {ec.Point} o
	 * @type {ec.Point}
	 * @returns	{ec.Point}
	 */
	compare: function(o) {
		if (o.inheritsof(ec.Point)) {
			var x = 0, y = 0;
			if (this.x > o.x) { x=1; } else if (this.x < o.x) { x=-1; }
			if (this.y > o.y) { y=1; } else if(this.y < o.y) { y=-1; }
			return new ec.Vector2({
				x: x,
				y: y
			});
		}
	}
};
ec.extend(ec.Vector2, ec.Point);
/**
 * Perform an addition with two Vector2
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type ec.Vector2
 * @returns {ec.Vector2}
 */
ec.Vector2.add = function(v1 , v2){
	return new ec.Vector2({ x: v1.x + v2.x, y: v1.y + v2.y});
};
/**
 * Perform an substraction with two Vector2
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type ec.Vector2
 * @returns {ec.Vector2}
 */
ec.Vector2.substract = function(v1 , v2){
	return new ec.Vector2({ x: v1.x - v2.x, y: v1.y - v2.y});
};
/**
 * Perform an multiplication with two Vector2
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type ec.Vector2
 * @returns {ec.Vector2}
 */
ec.Vector2.multiply = function(v1 , v2){
	return new ec.Vector2({ x: v1.x * v2.x, y: v1.y * v2.y});
};
/**
 * Perform an division with two Vector2
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type ec.Vector2
 * @returns {ec.Vector2}
 */
ec.Vector2.divide = function(v1 , v2){
	return new ec.Vector2({ x: v1.x / v2.x, y: v1.y / v2.y});
};
/**
 * Get the distance between two points
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type Number
 * @returns {Number|NaN}
 */
ec.Vector2.distance = function(v1 , v2){
	if ( v1.x != null && v1.y != null && v2.x != null && v2.y != null ) {
		return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
	}
	return NaN;
};
/**
 * Get the distance squared between two points
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type Number
 * @returns {Number}
 */
ec.Vector2.distanceSquared = function(v1, v2) {
	return v1.clone().distanceSquared(v2);
};
/**
 * Get a Vector2 instance x=1 && y=1
 * @type ec.Vector2
 * @returns {ec.Vector2}
 */
ec.Vector2.One = function() {
	return new Vector2({ x: 1, y: 1});
};

/**
 * Define a dimension
 * @param settings
 * @param settings.width
 * @param settings.height
 * @constructor
 * @extends {ec.Object}
 * @type {ec.Size}
 * @returns {ec.Size}
 */
ec.Size = function(settings) {
	if (settings) {
		ec.Object.call(this, settings);
	}
};

ec.Size.prototype = {
	info: {
		type: 'Size',
		getType: function() {
			return ec.Size;
		}
	},
	/** @define {number} */
	width: 0,
	/** @define {number} */
	height: 0,
	/**
	 * Check the equality with ec.Size or a scalar variable
	 * @param {ec.Size|Number} o
	 * @override
	 * @returns {Boolean}
	 */
	equals: function(o){
		if (o.inheritsof && o.inheritsof(ec.Size)) {
			return this.width == o.width && this.height == o.height;
		} else if (typeof o == 'number') {
			return this.width == o && this.height == o;
		}
		return false;
	},
	toString: function() {
		return '{ width: ' + this.width + ', height: ' + this.height + ' }';
	},
	/**
	 * Performs a comparison between two size.
	 * @param o
	 * @override
	 * @type ec.Size
	 * @returns {ec.Size}
	 * @description if this width is more than the other, it will returns 1 && if this height is less than the other, it will return -1. 0 for equality
	 */
	compare: function(o) {
		if (o.inheritsof(ec.Size)) {
			var w = 0, h = 0;
			if (this.width > o.width) { w = 1; } else if (this.width < o.width) { w = -1; }
			if (this.height > o.height) { h = 1; } else if (this.height < o.height) { h = -1; }
			return new ec.Size({
				width: w,
				height: h
			});
		}
	},
	/**
	 * Clone this instance of ec.Size
	 * @override
	 * @type ec.Size
	 * @returns {ec.Size}
	 */
	clone: function() {
		return new ec.Size({
			width: this.width,
			height: this.height
		});
	}
};

ec.extend(ec.Size, ec.Object);

ec.Graphics = function(settings) {
	this.transform = new ec.Object({
		m11: 1,
		m12: 0,
		m21: 0,
		m22: 1,
		dx: 0,
		dy: 0
	});
	this.scale = new ec.Point({ x:1,y:1 });
	this.rotation = 0;
	this.defaults = {
		transform: this.transform.clone(),
		scale: this.scale.clone(),
		rotation: 0
	};
	ec.Object.call(this, settings);
};

ec.Graphics.prototype = {
	info: {
		type: 'Graphics',
		getType: function() {
			return ec.Graphics;
		}
	},
	transform: null,
	scale: null,
	defaults: null,
	rotation: 0,
	beforedraw: function(ctx) {
		if (this.rotation != this.defaults.rotation) {
			this._saveContext();
			ctx.rotate(this.rotation);
		}
		if (!this.scale.equals(this.defaults.scale)) {
			this._saveContext(ctx);
			ctx.scale(this.scale.x, this.scale.y);
		}
		if (!this.transform.equals(this.defaults.transform)) {
			this._saveContext(ctx);
			this.doTransform(ctx);
		}
	},
	afterdraw: function(ctx) {
		this._restoreContext(ctx);
	},
	doTransform: function(ctx) {
		ctx.transform(
			this.transform.m11,
			this.transform.m12,
			this.transform.m21,
			this.transform.m22,
			this.transform.dx,
			this.transform.dy
		);
	},
	setScale: function(value) {
		if (typeof(value) == 'number') {
			this.scale.y = this.scale.x = value;
		} else if ( value.x != null && value.y != null ) {
			this.scale = value.clone();
		}
	},
	_contextSaved: false,
	_saveContext: function(ctx) {
		if (!this._contextSaved) {
			ctx.save();
			return (this._contextSaved = true);
		}
		return false;
	},
	_restoreContext: function(ctx) {
		if (this._contextSaved) {
			ctx.restore();
			return !(this._contextSaved = false);
		}
		return false;
	}
};

ec.extend(ec.Graphics, ec.Object);

/**
* An abstract shape
* @param {Object} settings
* @param {Number} settings.x
* @param {Number} settings.y
* @param {ec.Point} settings.position
* @param {Boolean} settings.clickable
* @param {Boolean} settings.draggable
* @constructor
* @extends {ec.Object}
* @type {ec.Shape}
* @return {ec.Shape}
*/
ec.Shape = function(settings) {
	/* Redefine position && currentPosition for this construction */
	this.events = new ec.EventManager();
	this.currentPosition = new ec.Point();
	this.position = new ec.Point();
	this.graphics = new ec.Graphics();
	/** 
	 * Default random value associate to this shape, to simulate its own behavior
	 * @returns {Number} Number[0-1]
	 */
	this.random = Math.random();
	this.floating = {};
	for(var i in settings) {
		switch(i) {
			case 'x':
			case 'y':
				this.position[i] = settings[i]; break;
			case 'width':
			case 'height':
				this.size[i] = settings[i]; break;
			case 'speed':
			case 'amplitude':
				this.floating[i] = settings[i]; break;
			default:
				this[i] = settings[i]; break;
		}
	}
	this.currentPosition = this.position.clone();
	/* Support of draggable && clickable */
	if (this.clickable) {
		this.on('mousedown', this.eventsHandlers.click.down);
		this.on('mouseup', this.eventsHandlers.click.up);
	}
	if (this.draggable) {
		this.on('mousedown', this.eventsHandlers.drag.begin);
		this.on('mousemove', this.eventsHandlers.drag.move);
		this.on('mouseup', this.eventsHandlers.drag.end);
	}
	ec.Object.call(this);
};

ec.Shape.prototype = {
	info : {
		type : 'Shape',
		getType: function() {
			return ec.Shape;
		}
	},
	/** 
	* The position where to draw the shape
	* @define {ec.Point} 
	*/
	position : null,
	/** 
	* The position where to draw the shape + position modifications
	* @define {ec.Point} 
	*/
	currentPosition: null,
	/** 
	* The fill color
	* @define {ec.Color|string} 
	*/
	fill : null,
	/** 
	* The stroke color
	* @define {ec.Color|string} 
	*/
	stroke : null,
	/** 
	* The stroke lineWidth
	* @define {Number} 
	*/
	lineWidth : 1,
	/** 
	* Define if the object is clickable or not
	* @define {Number} 
	*/
	clickable : false,
	/** 
	* Define if the object is draggable or not
	* @define {Number} 
	*/
	draggable : false,
	/** 
	* Defines the referential
	* @define {ec.Graphics} 
	*/
	graphics: null,
	/**
	* Events container
	* @define {ec.EventManager}
	*/
	events: null,
	/** Elements for floating effect */
	floating: {
		speed: null,
		amplitude: null
	},
	random: 0,
	/**
	 * Default update function for shapes
	 * @param {Object} data
	 */
	update : function(data) {
		/* Floating effect support */
		if (this.floating.speed && this.floating.amplitude) {
			this.currentPosition.y = this.position.y + Math.cos(data.timer * (2 * this.floating.speed)) * this.floating.amplitude;
		} else {
			this.currentPosition.y = this.position.y;
		}
		this.currentPosition.x = this.position.x;
	},
	draw : null,
	/** Events handlers container */
	eventsHandlers: {
		click : {
			down : function(e) {
				this.events.state.clicked = false;
				if (this.contains(e.mousePosition)) {
					this.events.state.pressed = true;
					ec.Mouse.pressed = true;
					if (this.onpressed) { this.onpressed(e); }
					return false;
				}
				this.events.state.pressed = false;
				return true;
			},
			up : function(e) {
				if (this.contains(e.mousePosition) && this.events.state.pressed && !this.events.state.dragging) {
					this.events.state.pressed = false;
					ec.Mouse.pressed = false;
					this.events.state.clicked = true;
					if (e.which == 3 && ec.DEBUG) {
						console.log(this);
					}
					if (this.onclick) { this.onclick(e); }
					return false;
				}
				return true;
			}
		},
		drag : {
			begin : function(e) {
				if (e.which == 1) {
					if (this.contains(e.mousePosition)) {
						this.events.state.pressed = true;
						ec.Mouse.pressed = true;
						this.events.state.lastPosition = ec.Vector2.substract(this.position, e.mousePosition);
						return false;
					}
					this.events.state.pressed = false;
					return true;
				}
			},
			move : function(e) {
				if (this.events.state.pressed) {
					this.position.x = e.mousePosition.x + this.events.state.lastPosition.x;
					this.position.y = e.mousePosition.y + this.events.state.lastPosition.y;
					this.events.state.dragging = true;
				}
			},
			end : function(e) {
				if (this.events.state.dragging) {
					this.position.x = e.mousePosition.x + this.events.state.lastPosition.x;
					this.position.y = e.mousePosition.y + this.events.state.lastPosition.y;
					this.events.state.dragging = false;
					this.events.state.pressed = false;
					ec.Mouse.pressed = false;
				}
			}
		}
	},
	compare: function(o) {
		if (o.inheritsof && o.inheritsof(ec.Shape)) {
			return new o.info.getType()({
				position: this.position.compare(o.position),
				currentPosition: this.currentPosition.compare(o.currentPosition)
			});
		}
		return null;
	},
	/**
	*  Create a new Event Handler for this ec.Object
	*  @param {String} e
	*  @param {Function(Event)} function to perform when the event's spreading
	*  @remarks You can add as many 'mousemove' events as you want to same item, for example
	*/
	on: function(e, fn) {
		var events = e.split(' ');
		for (var i in events) {
			if (!this.events[events[i]]) { this.events[events[i]] = new Array(); }
			this.events[events[i]].push(fn.bind(this));
		}
	},
	off: function(e) {
		var events = e.split(' ');
		for (var i in events) {
			if(this.events[events[i]]) { this.events[events[i]] = null; }
		}
	}
};
ec.extend(ec.Shape, ec.Object);

/**
 * A drawable string
 * @param {Object} 		settings
 * @param {ec.Point} 	settings.position	Position where drawing this text
 * @param {String} 		settings.value		String to draw
 * @param {ec.Font} 	settings.font		ec.Font instance
 * @constructor
 * @extends {ec.Shape}
 * @type {ec.Text}
 * @returns {ec.Text}
 */
ec.Text = function(settings) {
	this.value = '';
	this.font = new ec.Font();
	ec.Shape.call(this, settings);
};

ec.Text.prototype = {
	info: {
		type: 'Text',
		getType: function() {
			return ec.Text;
		}
	},
	value: null,
	currentPosition: null,
	getOrigin: function() {
		return ec.Vector2.add(this.position, this.origin);
	},
	update: function(data) {
		if (this.value != this.lastValue) {
			this.font.applyFont(data.context);
			this.width = data.context.measureText(this.value).width;
			this.origin = new ec.Point({
				x: this.width/2,
				y: this.size/2
			});
			this.currentPosition.x = this.position.x - this.origin.x;
			this.currentPosition.y = this.position.y + this.origin.y;
			this.lastValue = this.value;
			/* multilines support */
			var str = this.value.split('\n');
			this.multiline = new Array();
			for (var i in str) {
				this.multiline[i] = { content: str[i], width: data.context.measureText(str[i]).width, y: this.position.y + this.font.size * i };
			}
		}
	},
	draw: function(data){
		/** @returns {CanvasRenderingContext2D} */
		var ctx = data.context;
		/* Modify context referential */
		this.graphics.beforedraw(ctx);
		this.font.set(ctx);
		if (this.font.fill || this.font.stroke) {
			for (var i in this.multiline) {
				if (this.font.fill)
					ctx.fillText(this.multiline[i].content, this.position.x, this.multiline[i].y);
				if (this.font.stroke)
					ctx.strokeText(this.multiline[i].content, this.position.x, this.multiline[i].y);
			}
		}
		/* Restore context referential */
		this.graphics.afterdraw(ctx);
	},
	compare: function(o) {
		/* TODO: ec.Text comparison */
		return null;
	},
	clone: function() {
		return new ec.Text({
			position: this.position.clone(),
			font: this.font.clone(),
			value: this.value
		});
	},
	contains: function(p) {
		if (p.x != null && p.y != null) {
			var posY = 0, posYMax = 0, posX = 0, posXMax = 0;
			/* multilines containing support */
			for(var i in this.multiline) {
				/* support different baselines */
				switch (this.font.baseLine) {
					case 'top':
						posY = this.multiline[i].y; 
						posYMax = this.multiline[i].y + this.font.size;
						break;
					case 'middle': 
						posY = this.multiline[i].y - this.font.size/2; 
						posYMax = this.multiline[i].y + this.font.size/2;
						break;
					case 'bottom':
						posY = this.multiline[i].y - this.font.size; 
						posYMax = this.multiline[i].y;
						break;
					case 'alphabetic':
					case 'ideographic':
						posY = this.multiline[i].y - this.font.size; 
						posYMax = this.multiline[i].y;
						break;
				}
				/* support different alignements */
				switch (this.font.textAlign) {
					case 'left':
						posX = this.position.x;
						posXMax = this.position.x + this.multiline[i].width;
						break;
					case 'center':
						posX = this.position.x - this.multiline[i].width/2;
						posXMax = this.position.x + this.multiline[i].width/2;
						break;
					case 'right':
						posX = this.position.x - this.multiline[i].width;
						posXMax = this.position.x;
						break;
				}
				if (p.x > posX && p.y > posY && p.x < posXMax && p.y < posYMax) {
					return true;
				}
			}
		}
		return false;
	}
};
ec.extend(ec.Text, ec.Shape);

/**
 * Create a rectangle
 * @param settings
 * @param {ec.Point} settings.position	Representation of the position of this instance	(Unnecessary if X && Y are given)
 * @param {Number} settings.x			X component of the position	(Unnecessary if position is given)
 * @param {Number} settings.y			Y component of the position (Unnecessary if position is given)
 * @param {ec.Size} settings.size		Representation of the dimension of the rectangle	(Unnecessary if Width && Height are given)
 * @param {Number} settings.width		Width of this rectangle		(Unnecessary if Size is given)
 * @param {Number} settings.height		Height of this rectangle	(Unnecessary if Size is given)
 * @param {Number} settings.amplitude	Necessary for floating effect
 * @param {Number} settings.speed		Necessary for floating effect
 * @type ec.Rectangle
 * @returns {ec.Rectangle}
 */
ec.Rectangle = function(settings) {
	this.size = new ec.Size();
	ec.Shape.call(this, settings);
};

ec.Rectangle.prototype = {
	info: {
		type: 'Rectangle',
		getType: function() {
			return ec.Rectangle;
		}
	},
	size: null,
	currentPosition: null,
	getOrigin: function() {
		return new ec.Vector2({
			x: this.position.x + this.size.width/2,
			y: this.position.y + this.size.height/2
		});
	},
	draw: function(data) {
		var ctx = data.context;
		this.graphics.beforedraw(ctx);
		if ( this.fill ) {
			ctx.fillStyle = this.fill instanceof ec.Color ? this.fill.toHexa() : this.fill;
			ctx.fillRect( this.currentPosition.x, this.currentPosition.y, this.size.width, this.size.height );
		}
		if ( this.stroke ) {
			ctx.strokeStyle = this.stroke instanceof ec.Color ? this.stroke.toHexa() : this.stroke;
			ctx.lineWidth = this.lineWidth;
			ctx.strokeRect( this.currentPosition.x, this.currentPosition.y, this.size.width, this.size.height );
		}
		this.graphics.afterdraw(ctx);
	},
	/**
	*  Check if another >Rectangle or >Point is containing by this instance
	* @param {ec.Point|ec.Rectangle}
	* @return {Boolean}
	**/
	contains: function(o) {
		var tp = this.currentPosition ? this.currentPosition : this.position;
		if (o.inheritsof(ec.Point)) {
			return (o.x > tp.x
				 && o.x < tp.x + this.size.width
			     && o.y > tp.y
			     && o.y < tp.y + this.size.height);
		} else if (o.inheritsof(ec.Rectangle)) {
			var p = o.currentPosition ? o.currentPosition : o.position;
			return (p.x > tp.x
					&& p.y > tp.y
					&& p.x + o.size.width <= tp.x + this.size.width
					&& p.y + o.size.height <= tp.y + this.size.height);
		}
		return false;
	},
	equals: function(o) {
		if (o.inheritsof(ec.Rectangle)) {
			return o.position.x == this.position.x && o.position.y == this.position.y
				&& o.size.width == this.size.width && o.size.height == this.size.height;
		}
	},
	/**
	 * Performs a comparison between two rectangles
	 * @param {ec.Rectangle} o
	 * @type ec.Rectangle
	 * @returns {ec.Rectangle}
	 */
	compare: function(o) {
		if (!o.inheritsof(ec.Rectangle)) { return null; }
		var x=0, y=0, w=0, h=0;
		if (this.position.x > o.position.x) { x = 1; } else if (this.position.x < o.position.x) { x = -1; }
		if (this.position.y > o.position.y) { y = 1; } else if (this.position.y < o.position.y) { y = -1; }
		if (this.size.width > o.size.width) { w = 1; } else if (this.size.width < o.size.width) { w = -1; }
		if (this.size.height > o.size.height) { h = 1; } else if (this.size.height < o.size.height) { h = -1; }
		return new ec.Rectangle({
			position: new ec.Point({
				x: x,
				y: y
			}),
			size: new ec.Size({
				width: w,
				height: h
			})
		});
	},
	/**
	 * Clone this instance
	 * @type {ec.Rectangle}
	 * @returns {ec.Rectangle}
	 */
	clone: function() {
		var fill = this.fill instanceof ec.Color ? this.fill.clone() : this.fill;
		var stroke = this.stroke instanceof ec.Color ? this.stroke.clone() : this.stroke;
		return new ec.Rectangle({
			position: this.position.clone(),
			size: this.size.clone(),
			fill: fill,
			stroke: stroke,
			amplitude: this.floating.amplitude,
			speed: this.floating.speed,
			clickable: this.clickable,
			draggable: this.draggable
		});
	}
};

ec.extend(ec.Rectangle, ec.Shape);


/**
 * Create a instance of ec.Circle
 * @param {Object} settings
 * @param {ec.Point} settings.position	Representation of the position of this instance	(Unnecessary if X && Y are given)
 * @param {Number} settings.x			X component of the position	(Unnecessary if position is given)
 * @param {Number} settings.y			Y component of the position (Unnecessary if position is given)
 * @param {Number} settings.radius		Radius of this circle
 * @param {Number} settings.amplitude	Necessary for floating effect
 * @param {Number} settings.speed		Necessary for floating effect
 * @constructor
 * @extends {ec.Shape} 
 * @type {ec.Circle}
 * @returns {ec.Circle}
 */
ec.Circle = function(settings) {
	ec.Shape.call(this, settings);
};

ec.Circle.prototype = {
	info: {
		type: 'Circle',
		getType: function() {
			return ec.Circle;
		}
	},
	currentPosition: null,
	radius: 0,
	draw: function(data) {
		/** @returns {CanvasRenderingContext2D} */
		var ctx = data.context;
		this.graphics.beforedraw(ctx);
		if (this.radius > 0 && this.fill || this.stroke && this.radius > 0) {
			ctx.beginPath();
			ctx.arc( this.currentPosition.x, this.currentPosition.y, this.radius, 0, Math.PI * 2 );
			if ( this.fill ) {
				ctx.fillStyle = this.fill instanceof ec.Color ? this.fill.toHexa() : this.fill;
				ctx.fill();
			}
			if ( this.stroke ) {
				ctx.strokeStyle = this.stroke instanceof ec.Color ? this.stroke.toHexa() : this.stroke;
				ctx.lineWidth = this.lineWidth;
				ctx.stroke();
			}
		}
		this.graphics.afterdraw(ctx);
	},
	/**
	 * Check if this instance containing another
	 * @param {ec.Point|ec.Circle} c
	 * @returns {Boolean}
	 */
	contains: function( c ) {
		/** @returns {Number} */
		var d = 0,
		tp = this.currentPosition ? this.currentPosition : this.position;
		if ( c.inheritsof(ec.Point) ) {
			d = ec.Vector2.distance(tp, c);
			if (this.isClicked) { this.isClicked = false; }
            return (d < this.radius);
		} else if (c.inheritsof(ec.Circle)) {
			d = ec.Vector2.distance(tp, c.position);
			return d < ( this.radius + c.radius );
		}
		return false;
	},
	/**
	 * Check if this instance of circle is equal to another
	 * @param {ec.Circle} o other instance of circle
	 * @returns {Boolean}
	 * @description position are equals && radius too
	 */
	equals: function(o) {
		if (o.inheritsof(ec.Circle)) {
			return o.position.x == this.position.x && o.position.y == this.position.y
				&& this.radius == o.radius;
		}
		return false;
	},
	/**
	 * Performs a comparison between two circles
	 * @param {ec.Circle} o
	 * @type ec.Circle
	 * @returns {ec.Circle|Boolean}
	 */
	compare: function(o) {
		if (o.inheritsof(ec.Shape)) {
			var r = 0;
			if (this.radius > o.radius) { r = 1; } else if (this.radius < o.radius) { r = -1; }
			return new ec.Circle({
				position: this.position.compare(o.position),
				currentPosition: this.currentPosition.compare(o.currentPosition),
				radius: r
			});
		}
		return false;
	},
	clone: function() {
		var fill = this.fill instanceof ec.Color ? this.fill.clone() : this.fill;
		var stroke = this.stroke instanceof ec.Color ? this.stroke.clone() : this.stroke;
		return new ec.Circle({
			position: this.position.clone(),
			radius: this.radius,
			fill: fill,
			stroke: stroke,
			lineWidth: this.lineWidth,
			amplitude: this.float.amplitude,
			speed: this.float.speed,
			clickable: this.clickable,
			draggable: this.draggable
		});
	}
};

ec.extend(ec.Circle, ec.Shape);

ec.Timer = function(seconds) {
	this.base = ec.Timer.time;
	this.last = ec.Timer.time;
	
	this.target = seconds || 0;
};
	
ec.Timer.prototype = {
	info: {
		type: 'Timer',
		getType: function() {
			return ec.Timer;
		}
	},
	last: 0,
	base: 0,
	target: 0,
	pausedAt: 0,
	
	set: function( seconds ) {
		this.target = seconds || 0;
		this.base = ec.Timer.time;
		this.pausedAt = 0;
	},
	
	
	reset: function() {
		this.base = ec.Timer.time;
		this.pausedAt = 0;
	},
	
	tick: function() {
		var delta = ec.Timer.time - this.last;
		this.last = ec.Timer.time;
		return (this.pausedAt ? 0 : delta);
	},
	
	
	delta: function() {
		return (this.pausedAt || ec.Timer.time) - this.base - this.target;
	},


	pause: function() {
		if( !this.pausedAt ) {
			this.pausedAt = ec.Timer.time;
		}
	},


	unpause: function() {
		if( this.pausedAt ) {
			this.base += ec.Timer.time - this.pausedAt;
			this.pausedAt = 0;
		}
	}
};

ec.Timer._last = 0;
ec.Timer.time = Number.MIN_VALUE;
ec.Timer.timeScale = 1;
ec.Timer.maxStep = 0.05;

ec.Timer.step = function() {
	var current = Date.now();
	var delta = (current - ec.Timer._last) / 1000;
	ec.Timer.time += Math.min(delta, ec.Timer.maxStep) * ec.Timer.timeScale;
	ec.Timer._last = current;
};

ec.extend(ec.Timer, ec.Object);

ec.Stage = function(settings) {
	ec.Object.call(this, settings);
	this.timer = new ec.Timer();
	this.layers = new Array();
};

ec.Stage.prototype = {
	info: {
		type: 'Stage',
		getType: function() {
			return ec.Stage;
		}
	},
	timer: null,
	layers: null,
	update: function() {
		for ( var i in this.layers ) {
			this.layers[i].update(this);
		}
	},
	draw: function() {
		for ( var i in this.layers ) {
			this.layers[i].draw(this);
		}
	},
	run: function() {
		this.isRunning = true;
		ec.Timer.step();
		this.timer.reset();
		this._loop();
	},
	_loop: function() {
		if (this.isRunning) {
			ec.Timer.step();
			this.update();
			ec.Timer.step();
			this.draw();
			window.requestAnimFrame(this._loop.bind(this));
		}
	},
	add: function(o) {
		this.layers.push(o);
	},
	equals: function(o) {
		if (!o.inheritsof) { return false; }
		return this.ID === o.ID && o.inheritsof(ec.Stage);
	}
};
ec.extend(ec.Stage, ec.Object);

/**
 * 
 * @param {Object} settings
 * @param {String} settings.canvas
 * @param {Number} settings.width
 * @param {Number} settings.height
 * @type ec.Layer
 * @returns {ec.Layer}
 */
ec.Layer = function(settings) {
	this.info.supportedEvents = new Object();
	this.lastMouse = {
		rel: new ec.Point(),
		abs: new ec.Point()
	};
	this.offset = new ec.Point();
	this.components = new Array();
	this.graphics = new ec.Graphics();
	if ( settings.canvas ) {
		/** @returns {HTMLCanvasElement} */
		this.canvas = document.getElementById(settings.canvas);
		this.canvas.width = settings.width;
		this.canvas.height = settings.height;
		/** @returns {CanvasRenderingContext2D} */
		this.context = this.canvas.getContext('2d');
		delete settings.canvas;
	}
	ec.Object.call(this, settings);
};

ec.Layer.prototype = {
	canvas: null,
	context: null,
	width: 0,
	height: 0,
	offset: null,
	graphics: null,
	info: {
		type: 'Layer',
		getType: function() {
			return ec.Layer;
		},
		supportedEvents: null
	},
	fixed: false,
	components: null,
	lastMouse: {
		rel: null,
		abs: null
	},
	add: function(component) {
		this.components.push(component);
		for (var i in component.events) 
		{
			/* If the event does not exists */
			if (!this.info.supportedEvents[i]) {
				var addEventFunc = this.canvas.addEventListener ? 'addEventListener' : 'attachEvent';
				this.canvas[addEventFunc](i, (function(e) {
					if (e.type == 'mouseup' || e.type == 'mousedown' || e.type == 'click' || e.type == 'mousemove') {
						this.lastMouse.rel = e.mousePosition = ec.Mouse.getPosition(e);
						this.lastMouse.abs = e.mouseAbsPosition = ec.Mouse.getAbsolutePosition(e);
					}
					for (var i = this.components.length-1; i > -1; i--) {
						/* for each components, spread the event */
						if (!this.components[i].events.execute(e)) {
							if (e.preventDefault) { e.preventDefault(); }
							return false;
						}
					}
				}).bind(this), false);
				this.info.supportedEvents[i] = true;
				if (!this.mouseUpCorrection) {
					document.addEventListener('mouseup', (function(e) {
						var target = null;
						if (e.originalTarget) { target = e.originalTarget; }
						else if (e.toElement) { target = e.toElement; }
						else if (e.target) { target = e.target; }
						if (target != this.canvas) {
							for(var i in this.components) {
								this.components[i].events.reset();
							}
						}
					}).bind(this), false);
					this.mouseUpCorrection = true;
				}
			}
		}
	},
	update: function(stage) {
		for ( var i in this.components ) {
			if ( this.components[i].update ) {
				this.components[i].update({ context: this.context, timer: stage.timer.delta(), mouse: this.lastMouse });
			}
		}
	},
	draw: function(stage) {
		this.context.clearRect(0, 0, this.width, this.height);
		
		this.graphics.beforedraw(this.context);
		for ( var i = 0; i < this.components.length; i++ ) {
			if ( this.components[i].draw ) {
				this.components[i].draw({ context: this.context, timer: stage.timer.delta(), mouse: this.lastMouse });
			}
		}
		this.graphics.afterdraw(this.context);
	},
	equals: function() {
		if (!o.inheritsof) { return false; }
		return this.ID === o.ID && o.inheritsof(ec.Layer);
	}
};

ec.extend(ec.Layer, ec.Object);


})();