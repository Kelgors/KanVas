(function() {

window.ec = {
	/** 
	* @type {string}
	* @const 
	*/
	LANG: 'fr',
	/** 
	* @type {boolean}
	* @const 
	*/
	DEBUG: false,
	/**
	* Extend a type with another type
	* @param {?}
	* @param {ec.Object} an ec.Object's type
	*/
	extend: function(that, p) {
		console.log('---- BEGIN ' + that.prototype.info.type + ' ----');
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
		if(obj == null || typeof(obj) != 'object') {
			return obj;
		}
		var temp = obj.constructor(); // changed
		for(var key in obj)
			temp[key] = ec._clone(obj[key]);
		return temp;
	},
	/**
	* Execute a function when the DOM is ready
	* @param {function()}
	*/
	ready: function(fn, stages) {
		if(!fn){return;}
		var f = null;
		f = function(e) {
			if (document.removeEventListener) {
				document.removeEventListener('DOMContentLoaded', f, false);
			}
			else if (document.detachEvent) {
				document.detachEvent('DOMContentLoaded', f, false);
			}
			fn();
		};
		
		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', f, false);
		}
		else if (document.attachEvent) {
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
	}
};
window.ec._set_requestAnimFrame();ec.Mouse = {
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
};ec.EventManager = {
	init: function() {
		if (document.attachEvent) {
			this.type = ec.EventManager.TYPE.ATTACH;
		} else if (document.addEventListener){
			this.type = ec.EventManager.TYPE.ADDLISTEN;
		} else {
			ec.Errors.log('EM001');
		}
	},
	/**
	 * Type of browser event function
	 */
	type: '',
	/**
	 * Events container
	 */
	events: {},
	/**
	 * Events global variable
	 */
	app: {
		mouse: {
			pressed: false,
			clicked: false
		}
	},
	/**
	 * Add a new event handler
	 * @param {Object} obj
	 * @param {String} evt
	 * @param {Function} fn
	 */
	add: function(obj, evt, fn) {
		if (!this.events[evt]) {
			this.events[evt] = new Array();
			document[this.type.add](evt, this.handler, false);
		}
		this.events[evt].push( { o: obj, func: fn } );
	},
	/**
	 * Delete specified event for the specified object
	 * @param {Object} obj
	 * @param {String} evt
	 */
	remove: function(obj, evt) {
		for ( var i in this.events[evt] ) {
			if ( this.events[evt][i].o.equals(obj) ) {
				if (this.type === ec.EventManager.TYPE.ADDLISTEN) {
					document[this.type.rem](evt, this.events[evt][i].func, false);
				}
			}
		}
	},
	/**
	 * Main handler for all events
	 * @param {Event} e
	 */
	handler: function(e) {
		e.mousePosition = ec.Mouse.getPosition(e);
		e.mouseAbsPosition = ec.Mouse.getAbsolutePosition(e);
		for ( var i in ec.EventManager.events[e.type] ){
			ec.EventManager.events[e.type][i].func(e);
		}
	},
	/**
	 * Delete all events
	 */
	purge: function() {
		for (var i in this.events) { 
			document[this.type.rem](i, this.handler, false); 
		}
		this.events = {};
	},
	/**
	 * Reset all ec.EventManager.app variables
	 */
	reset: function() {
		for (var i in ec.EventManager.app) {
			if(typeof ec.EventManager.app[i] == 'boolean') {
				ec.EventManager.app[i] = false;
			}
		}
	}
};
ec.EventManager.TYPE = {
	ADDLISTEN: { add: 'addEventListener', rem: 'removeEventListener' },
	OLDIE: {add: 'attachEvent', rem: 'detachEvent' }
};
ec.EventManager.init();/**
 * Basic instance
 * @constructor
 * @type {ec.Object}
 * @returns {ec.Object}
 */
ec.Object = function(settings) {
	for( var i in settings ) {
		this[i] = settings[i];
	}
};

ec.Object.prototype = {
	info: {
		type: 'ec.Object',
		getType: function() {
			return ec.Object;
		}
	},
	/**
	 * Return a clone of this instance
	 * @type {ec.Object}
	 * @returns	{ec.Object} the cloned object
	 */
	clone: function() {
		var o = this.constructor();
		for(var i in this)
			if (typeof(this[i]) == 'object') {
				o[i] = this[i].inheritsof ? this[i].clone() : ec._clone(this[i]);
			} else {
				o[i] = this[i];
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
		if (o.inheritsof(ec.Object)) {
			for (var i in this) {
				if (this[i] !== o[i]) {
					return false;
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
	 * @returns {ec.Object}
	 */
	compare: function(o) {
		/* TODO: object support */
		if (o.inheritsof(this.info.getType())) {
			/* Create an instance of this */
			var t = new ec[this.info.type.split('.')[1]]();
			for (var i in this) {
				/* if this[i] is a number */
				if (typeof(this[i]) == 'number') {
					if (this[i] > o[i]) {
						t[i] = 1;
					} else if (this[i] < o[i]) {
						t[i] = -1;
					} else {
						t[i] = 0;
					}
				/* if this[i] is an object|ec.Object */
				} else if (typeof(o[i]) == 'object') {
					if (o[i].inheritsof) {
						t[i] = this[i].compare(o[i]);
					}
				}
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
	*  @param {Object.<String, Function>} the type of object ( ec.Object, not 'ec.Object' )
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
	},
	/**
	*  Create a new Event Handler for this ec.Object
	*  @param {String} event
	*  @param {Function(Event)} function to perform when the event's spreading
	*  @remarks You can add as many 'mousemove' events as you want to same item, for example
	*/
	on: function(event, fn) {
		ec.EventManager.add(this, event, fn);
	}
	
};/**
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
};/**
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
	if(settings) {
		ec.Object.call(this, settings);
	}
};
ec.Point.prototype = {
	info:{
		type: 'ec.Point',
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
		if (o.inheritsof(ec.Point)) {
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
		if (o.inheritsof(ec.Point)) {
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
	},
	/**
	 * Clone this instance of ec.Point
	 * @override
	 * @returns {ec.Point}
	 */
	clone: function() {
		return new ec.Point({
			x: this.x,
			y: this.y
		});
	}
};
ec.extend(ec.Point, ec.Object);/**
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
		type: 'ec.Vector2',
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
		} else if (value.info && value.inheritsof(ec.Point)){
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
		} else if (value.info && value.inheritsof(ec.Point)){
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
		} else if ( value.info && value.inheritsof(ec.Point) ) {
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
		}
		else if ( value.info && value.inheritsof(ec.Point) ) {
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
		if ( o.inheritsof(ec.Point) ) {
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
		if ( o.inheritsof(ec.Point) ) {
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
	},
	/**
	 * Clone this instance of Vector2
	 * @override
	 * @type {ec.Vector2}
	 * @returns {ec.Vector2}
	 */
	clone: function() {
		return new ec.Vector2({
			x: this.x,
			y: this.y
		});
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
	if ( v1.inheritsof(ec.Point) && v2.inheritsof(ec.Point) ) {
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
	var v = v1.clone();
	return v.distanceSquared(v2);
};
/**
 * Get a Vector2 instance x=1 && y=1
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type ec.Vector2
 * @returns {ec.Vector2}
 */
ec.Vector2.One = function() {
	return new Vector2({ x: 1, y: 1});
};/**
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
		type: 'ec.Size',
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
		if (o.inheritsof(ec.Size)) {
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

ec.extend(ec.Size, ec.Object);ec.counter = 0;

ec.Shape = function(settings) {
	/* Redefine position && currentPosition for this construction */
	this.currentPosition = new ec.Point();
	this.position = new ec.Point();
	this.transform = new ec.Object({
		m11: 1,
		m12: 0,
		m21: 0,
		m22: 1,
		dx: 0,
		dy: 0
	});
	this.defaultTransform = this.transform.clone();
	this.scale = new ec.Point({ x:1,y:1 });
	this.defaultScale = this.scale.clone();
	/** 
	 * Default random value associate to this shape, to simulate its own behavior
	 * @returns {Number} Number[0-1]
	 */
	this.random = Math.random();
	this.float = {};
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
				this.float[i] = settings[i]; break;
			default:
				this[i] = settings[i]; break;
		}
	}
	/* Support of draggable && clickable */
	if (ec.EventManager) {
		if (this.clickable) {
			ec.EventManager.add(this, 'mousedown', this.events.click.down.bind(this));
			ec.EventManager.add(this, 'mouseup', this.events.click.up.bind(this));
		}
		if (this.draggable) {
			ec.EventManager.add(this, 'mousedown', this.events.drag.begin.bind(this));
			ec.EventManager.add(this, 'mousemove', this.events.drag.move.bind(this));
			ec.EventManager.add(this, 'mouseup', this.events.drag.end.bind(this));
			this.counter = ec.counter++;
		}
	}
	this.graphics = new ec.Graphics();
};

ec.Shape.prototype = {
	info : {
		type : 'ec.Shape',
		getType: function() {
			return ec.Shape;
		}
	},
	position : null,
	fill : null,
	stroke : null,
	lineWidth : 1,
	clickable : false,
	draggable : false,
	transform: null,
	defaultTransform: null,
	scale: null,
	defaultScale: null,
	graphics: null,
	/** Element for floating effect */
	float: {
		speed: null,
		amplitude: null
	},
	random: 0,
	/**
	 * Default update function for shapes
	 * @param {Object} data
	 */
	update : function(data) {
		/* mousedown support */
		if (this.clickable && this.onpressed && this.isPressed) {
			this.onpressed(data);
		}
		/* mouseup */
		if (this.clickable && this.onclick && this.isClicked) {
			this.onclick(data);
		}
		this.currentPosition.x = this.position.x;
		/* Floating effect support */
		if (this.float.speed && this.float.amplitude) {
			this.currentPosition.y = this.position.y + Math.cos(data.timer * (2 * this.float.speed)) * this.float.amplitude;
		} else {
			this.currentPosition.y = this.position.y;
		}
	},
	draw : null,
	/** Events handler container */
	events : {
		click : {
			down : function(e) {
				if (this.contains(e.mousePosition)) {
					this.isPressed = true;
					if (this.onPressed) { this.onPressed(e); }
					ec.EventManager.app.mouse.pressed = true;
				} else {
					this.isPressed = false;
				}
			},
			up : function(e) {
				if (this.contains(e.mousePosition) && this.isPressed && !this.isDragging) {
					this.isPressed = false;
					ec.EventManager.app.mouse.pressed = false;
					this.isClicked = true;
					if (e.which == 3 && ec.DEBUG) {
						console.log(this);
						return false;
					}
					if (this.onClicked) { this.onClicked(e); }
				} else {
					this.isClicked = false;
				}
			}
		},
		drag : {
			begin : function(e) {
				if (e.which == 1) {
					if (this.contains(e.mousePosition)) {
						this.isDragging = true;
						this.isPressed = true;
						ec.EventManager.app.mouse.pressed = true;
						this.last = ec.Vector2.substract(this.position, e.mousePosition);
					} else {
						this.isPressed = false;
						this.isDragging = false;
					}
				}
			},
			move : function(e) {
				if (this.isDragging) {
					ec.EventManager.app.mouse.pressed = false;
					this.position.x = e.mousePosition.x + this.last.x;
					this.position.y = e.mousePosition.y + this.last.y;
					this.isPressed = false;
				}
			},
			end : function(e) {
				if (this.isDragging) {
					this.position.x = e.mousePosition.x + this.last.x;
					this.position.y = e.mousePosition.y + this.last.y;
					this.isDragging = false;
				}
			}
		},
		compare: function(o) {
			if (o.inheritsof) {
				if (o.inheritsof(ec.Shape)) {
					var type = this.info.type.split('.')[1];
					return new ec[type]({
						position: this.position.compare(o.position),
						currentPosition: this.currentPosition.compare(o.currentPosition)
					});
				}
			}
		}

	}
};
ec.extend(ec.Shape, ec.Object);/**
 * Instanciate a drawable string
 * @param {Object} 		settings
 * @param {ec.Point} 	settings.position	Position where drawing this text
 * @param {String} 		settings.value		String to draw
 * @param {ec.Color} 	settings.fill		Fill color
 * @param {ec.Color} 	settings.stroke		Stroke color
 * @param {Number} 		settings.size		Font size
 * @param {String} 		settings.font		Font family
 * @param {String} 		settings.style 		[italic, bold, underline]
 * @param {Number} 		settings.lineWidth	stroke line width
 * @returns {ec.Text}
 */
ec.Text = function(settings) {
	this.value = '';
	this.currentPosition = new ec.Point();
	ec.Object.call(this, settings);
};

ec.Text.prototype = {
	info: {
		type: 'ec.Text',
		getType: function() {
			return ec.Text;
		}
	},
	value: null,
	fill: null,
	stroke: null,
	lineWidth: 1,
	font: 'Verdana',
	size: 30,
	style: '',
	currentPosition: null,
	update: function(data) {
		this.currentPosition.y = this.position.y;
		data.context.font = this.size+'px '+this.font+' '+this.style;
		this.currentPosition.x = this.position.x - data.context.measureText(this.value).width/2;
	},
	draw: function(data){
		/** @returns {CanvasRenderingContext2D} */
		var ctx = data.context;
		ctx.font = this.size+'px '+this.font+' '+this.style;
		if (this.fill) {
			ctx.fillStyle = this.fill instanceof ec.Color ? this.fill.toHexa() : this.fill;
			ctx.fillText(this.value, this.currentPosition.x, this.currentPosition.y);
		}
		if (this.stroke) {
			ctx.strokeStyle = this.stroke instanceof ec.Color ? this.stroke.toHexa() : this.stroke;
			ctx.lineWidth = this.lineWidth;
			ctx.strokeText(this.value, this.currentPosition.x, this.currentPosition.y);
		}
	},
	compare: function(o) {
		// TODO: font/style comparison ???
		if (o.inheritsof && o.inheritsof(ec.Text)) {
			var text=0, font=0,size=0,style=0;
			if (this.value !== o.value) {
				if (this.value.length > o.value.length) {
					text = 1;
				} else if (this.value.length < o.value.length) {
					text = -1;
				}
			}
			if (this.size > o.size) { size = 1; } else if (this.size < o.size) { size = -1; }
			if (this.font !== o.font) {
				if (this.font.length > o.font.length) {
					font = 1;
				} else if (this.font.length < o.font.length) {
					font = -1;
				}
			}
			if (this.style !== o.style) {
				if (this.style.length > o.style.length) {
					style = 1;
				} else if (this.style.length < o.style.length) {
					style = -1;
				}
			}
			return new ec.Text({
				value: text,
				font: font,
				size: size,
				style: style
			});
		}
	},
	clone: function() {
		var fill = this.fill instanceof ec.Color ? this.fill.clone : this.fill;
		var stroke = this.stroke instanceof ec.Color ? this.stroke.clone : this.stroke;
		return new ec.Text({
			position: this.position.clone(),
			stroke: stroke,
			fill: fill,
			font: this.font,
			lineWidth: this.lineWidth,
			style: this.style, 
			size: this.size,
			value: this.value
		});
	}
};
ec.extend(ec.Text, ec.Object);/**
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
		type: 'ec.Rectangle',
		getType: function() {
			return ec.Rectangle;
		}
	},
	size: null,
	currentPosition: null,
	draw: function(data) {
		var ctx = data.context;
		if ( this.fill ) {
			ctx.fillStyle = this.fill instanceof ec.Color ? this.fill.toHexa() : this.fill;
			ctx.fillRect( this.currentPosition.x, this.currentPosition.y, this.size.width, this.size.height );
		}
		if ( this.stroke ) {
			ctx.strokeStyle = this.stroke instanceof ec.Color ? this.stroke.toHexa() : this.stroke;
			ctx.lineWidth = this.lineWidth;
			ctx.strokeRect( this.currentPosition.x, this.currentPosition.y, this.size.width, this.size.height );
		}
	},
	/**
	*  Check if another >Rectangle or >Point is containing by this instance
	* @param {ec.Point|ec.Rectangle}
	* @return {Boolean}
	* @remark	Check the ec.Rectangle check function
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
	 * Return a string representation of this instance
	 * @returns {String}
	 */
	toString: function() {
		return this.info.type + ' ' + this.position.toString() + ' ' + this.size.toString();
	},
	/**
	 * Clone this instance
	 * @type ec.Rectangle
	 * @returns {ec.Rectangle}
	 */
	clone: function() {
		var fill = this.fill instanceof ec.Color ? this.fill.clone : this.fill;
		var stroke = this.stroke instanceof ec.Color ? this.stroke.clone : this.stroke;
		return new ec.Rectangle({
			position: this.position.clone(),
			size: this.size.clone(),
			fill: fill,
			stroke: stroke,
			amplitude: this.float.amplitude,
			speed: this.float.speed,
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
 * @type ec.Circle
 * @returns {ec.Circle}
 */
ec.Circle = function(settings) {
	ec.Shape.call(this, settings);
};

ec.Circle.prototype = {
	info: {
		type: 'ec.Circle',
		getType: function() {
			return ec.Circle;
		}
	},
	currentPosition: null,
	radius: 0,
	draw: function(data) {
		/** @returns {CanvasRenderingContext2D} */
		var ctx = data.context;
		if (this.graphics) {
			this.graphics.beforedraw();
		}
		if (this.radius > 0 && this.fill || this.stroke && this.radius > 0) {
			ctx.beginPath();
			ctx.arc( this.currentPosition.x, this.currentPosition.y, this.radius, 0, Math.PI * 2 );
			ctx.closePath();
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
		if (this.graphics) {
			this.graphics.afterdraw();
		}
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
			if (this.isClicked) { console.log(d, this.radius); this.isClicked = false; }
            return (d < this.radius);
		} else if (c.inheritsof(ec.Circle)) {
			d = ec.Vector2.distance(tp, c.position);
			return d < ( this.radius + c.radius );
		}
		return false;
	},
	/**
	 * Return the string representation of this instance
	 * @returns {String}
	 */
	toString: function() {
		return '{ '+this.info.type + ': ' + this.positon.toString() + ', radius: ' + this.radius + ' }';
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
		var fill = this.fill instanceof ec.Color ? this.fill.clone : this.fill;
		var stroke = this.stroke instanceof ec.Color ? this.stroke.clone : this.stroke;
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

ec.extend(ec.Circle, ec.Shape);ec.Timer = function(seconds) {
	this.base = ec.Timer.time;
	this.last = ec.Timer.time;
	
	this.target = seconds || 0;
};
	
ec.Timer.prototype = {
	info: {
		type: 'ec.Timer',
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

ec.extend(ec.Timer, ec.Object);ec.Stage = function(settings) {
	ec.Object.call(this, settings);
	this.timer = new ec.Timer();
	this.layers = new Array();
};

ec.Stage.prototype = {
	info: {
		type: 'ec.Stage',
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
			ec.EventManager.reset();
			ec.Timer.step();
			this.update();
			ec.Timer.step();
			this.draw();
			window.requestAnimFrame(this._loop.bind(this));
		}
	},
	add: function(o) {
		this.layers.push(o);
	}
};
ec.extend(ec.Stage, ec.Object);/**
 * 
 * @param {Object} settings
 * @param {String} settings.canvas
 * @param {Number} settings.width
 * @param {Number} settings.height
 * @type ec.Layer
 * @returns {ec.Layer}
 */
ec.Layer = function(settings) {
	this.lastMouse.rel = new ec.Point();
	this.lastMouse.abs = new ec.Point();
	if ( settings.canvas ) {
		/** @returns {HTMLCanvasElement} */
		this.canvas = document.getElementById(settings.canvas);
		this.canvas.width = settings.width;
		this.canvas.height = settings.height;
		/** @returns {CanvasRenderingContext2D} */
		this.context = this.canvas.getContext('2d');
		delete settings.canvas;
	}
	this.components = new Array();
	ec.Object.call(this, settings);
};

ec.Layer.prototype = {
	canvas: null,
	context: null,
	width: 0,
	height: 0,
	offset: new ec.Point(),
	info: {
		type: 'ec.Layer',
		getType: function() {
			return ec.Layer;
		}
	},
	fixed: false,
	components: null,
	mouseupCorrection: false,
	lastMouse: {
		rel: null,
		abs: null,
		pointed: false
	},
	add: function(component) {
		this.components.push(component);
		if (!this.mouseupCorrection && component.clickable||component.draggable && !this.mouseupCorrection) {
			var that = this;
			this.canvas.oncontextmenu = function(e) { e.preventDefault(); return false; };
			ec.EventManager.add(this, 'mousemove', (function(e) {
				this.lastMouse.rel = e.mousePosition;
				this.lastMouse.abs = e.mouseAbsPosition;
			}).bind(this));
			ec.EventManager.add(document, 'mouseup', function() {
				if (!ec.EventManager.app.mouse.pressed) {
					that.canvas.style.cursor = 'default';
				}
			});
			this.mouseupCorrection = true;
		}
	},
	update: function(stage) {
		this.lastMouse.pointed = false;
		for ( var i = 0; i < this.components.length; i++ ) {
			/* mousehover support */
			if (this.components[i].contains && !this.lastMouse.pointed) {
				if (this.components[i].contains(this.lastMouse.rel)) {
					if (this.components[i].isDragging) {
						this.canvas.style.cursor = 'move';
					} else {
						this.canvas.style.cursor = 'pointer';
					}
					this.lastMouse.pointed = true;
				} else {
					this.canvas.style.cursor = 'default';
				}
			}
			if ( this.components[i].update ) {
				this.components[i].update({ context: this.context, timer: stage.timer.delta(), mouse: this.lastMouse });
			}
		}
	},
	draw: function(stage) {
		this.context.clearRect(0, 0, this.width, this.height);

		for ( var i = 0; i < this.components.length; i++ ) {
			if ( this.components[i].draw ) {
				this.components[i].draw({ context: this.context, timer: stage.timer.delta(), mouse: this.lastMouse });
			}
		}
		this._restoreContext();
	}
};

ec.extend(ec.Layer, ec.Object);
})();