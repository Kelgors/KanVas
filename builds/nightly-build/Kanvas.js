/**
* Kanvas
* @package ec
* @version 0.3.3 (2013-04-18)
* @author Matthieu BOHEAS <matthieuboheas[at]gmail.com>
* @copyright Copyright (c) 2013 Matthieu BOHEAS
* @link https://github.com/Kelgors/Kanvas
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
*
* Please minify before use
*/
(function() {

window.kan = {
	/** 
	* @type {String}
	* @const
	*/
	LANG: 'FR-fr',
	/** 
	* @type {Boolean}
	* @const 
	*/
	DEBUG: true,
	/**
	* Extend a type with another type
	* @param {?}
	* @param {kan.Object} an kan.Object's type
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
			} else if ( prototype[name] && kan.isNativeFunction(prototype[name]) ) {
				prototype[name] = parent[name];
			}
		}
		that.prototype = kan._clone(prototype);
		that.prototype.info.parent = kan._clone(p.prototype.info);
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
			temp[key] = kan._clone(obj[key]);
		return temp;
	},
	/**
	* Execute a function when the DOM is ready
	* @param {Function}
	* @param {String=} Event which triggers the function, by default: DOMContentLoaded
	*/
	ready: function(fn, load) {
		if(!fn){return;}
		var event, f;
		event = load || 'DOMContentLoaded';
		if (event === 'load') {
			window.onload = fn;
		} else {
			f = function(e) {
				kan.EventManager.remove(event, f, false);
				fn();
			};
			kan.EventManager.add(event, f, false);
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
	* @param {Function}
	* @return {Boolean} true if the function is browser native
	*/
	isNativeFunction: function(f) {
	    return !!f && (typeof f).toLowerCase() == 'function' 
            && (f === Function.prototype 
            || /^\s*function\s*(\b[a-z$_][a-z0-9$_]*\b)*\s*\((|([a-z$_][a-z0-9$_]*)(\s*,[a-z$_][a-z0-9$_]*)*)\)\s*{\s*\[native code\]\s*}\s*$/i.test(String(f)));
	},
	/**
	* Check the equality between two objects
	* @param {Object} o1
	* @param {OBject} o2
	* @return {Boolean}
	*/
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
								/* Array/Object of kan.Object */
								if (!this[i][n].equals(o[i][n])) {
									return false;
								}
							} else if (typeof(this[i][n]) == 'object' && typeof(o[i][n]) == 'object') {
								/* Array/Object of object */
								if (!kan.equal(this[i][n], o[i][n])) {
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
	* Get the type of something
	*   if the object has info: {}, returns o.info.type
	* @param {?} an object
	* @return {String} the type of the object
	*/
	typeof: function(o) {
		return o.info ? o.info.type : typeof(o); 
	},
	/**
	* Guid Object
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
	/**
	* Number functions
	*/
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
window.kan._set_requestAnimFrame();

kan.Mouse = {
	/**
	 * Position of the mouse contains two objects
	 *   rel: the position relative to the page
	 *   abs: the absolute position
	 *   In most of cases, if your css for the canvas is position: absolute, take the absolute position and vice-versa for the relative position
	 * @type {Object}
	*/
	position: {
		rel: null,
		abs: null
	},
	/**
	 * Get the absolute mouse position as kan.Point from Event 
	 * @param {MouseEvent} e
	 * @return {kan.Point}
	 */
	getAbsolutePosition: function(e) {
		kan.Mouse._update(e);
		return kan.Mouse.position.abs;
	},
	/**
	 * Get the relative mousePosition as kan.Point from Event
	 * @param {MouseEvent} e
	 * @return {kan.Point}
	 */
	getPosition: function(e) {
		kan.Mouse._update(e);
		return kan.Mouse.position.rel;
	},
	/**
	* Update the positions variables 
	* @param {MouseEvent}
	*/
	_update: function(e) {
		kan.Mouse.position.abs = new kan.Point({
			x: e.clientX,
			y: e.clientY
		});
		kan.Mouse.position.rel = new kan.Point({
			x: e.layerX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft),
			y: e.layerY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)
		});
	},
	/**
	 * Get the relative X component of mouse position from an Event
	 * @param {MouseEvent} e
	 * @return {Number}
	 */
	getX: function(e) {
		return e.layerX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	},
	/**
	 * Get the relative Y component of mouse position from an Event
	 * @param {MouseEvent} e
	 * @return {Number}
	 */
	getY: function(e) {
		return e.layerY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
	}
};

/**
* An event manager
* @constructor
*/
kan.EventManager = function() {
	this.state = {
		clicked: false,
		pressed: false,
		dragging: false
	};
};

kan.EventManager.prototype = {
	state: null,
	/**
	* Performs all functions link to an event
	* @param {Event}
	* @return {Boolean} true: continue to spread the event; false: stop the event
	*/
	execute: function(e) {
		var dontStop = true;
		if (this[e.type]) {
			for (var i in this[e.type]) {
				if (typeof(this[e.type][i]) == 'function') {
					if (this[e.type][i](e) == false) {
						dontStop = false;
						break;
					}
				}
			}
		}
		if (!dontStop) {
			if (e.preventDefault) { e.preventDefault(); }
			if (e.stopImmediatePropagation) { e.stopImmediatePropagation(); }
			e.cancelBubble = true;
			e.returnValue = false;
		}
		return dontStop;
	},
	/**
	* Reset states
	*/
	reset: function() {
		for(var i in this.state) {
			if (typeof(this.state[i]) == 'boolean') {
				this.state[i] = false;
			}
		}
	},
	/**
	* Container of all functions link to the 'click' event
	* @type {Array}
	*/
	click: null,
	/**
	* Container of all functions link to the 'mouseup' event
	* @type {Array}
	*/
	mouseup: null,
	/**
	* Container of all functions link to the 'mousedown' event
	* @type {Array}
	*/
	mousedown: null,
	/**
	* Container of all functions link to the 'mousemove' event
	* @type {Array}
	*/
	mousemove: null
	/* etc... */
};

kan.EventManager.add = function(e, f, b) {
	return document.addEventListener ? document.addEventListener(e, f, b) : document.attachEvent(e, f, b);
};

kan.EventManager.remove = function(e, f, b) {
	return document.removeEventListener ? document.removeEventListener(e, f, b) : document.detachEvent(e, f, b);
};

/**
 * Basic instance
 * @constructor
 */
kan.Object = function(settings) {
	this.info = kan._clone(this.info);
	for( var i in settings ) {
		this[i] = settings[i];
	}
	this.info.ID = kan.Guid.create();
};

kan.Object.prototype = {
	info: {
		ID: null,
		type: 'Object',
		getType: function() {
			return kan.Object;
		}
	},
	/**
	 * Return a clone of this instance
	 * @return	{kan.Object} the cloned object
	 */
	clone: function() {
		var o = this.info ? new kan[this.info.type]() : this.constructor();
		for(var i in this) {
			if (!this[i]) { continue; }
			if (typeof(this[i]) == 'object') {
				o[i] = this[i].inheritsof ? this[i].clone() : kan._clone(this[i]);
			} else if (typeof(this[i]) != 'function') {
				o[i] = this[i];
			}
		}
		return o;
	},
	/**
	 * Check if each value of this equals to others value
	 * @param o {kan.Object} other
	 * @return {boolean}
	 */
	equals: function(o) {
		if (!o.inheritsof) { return false; }
		if (o.inheritsof(kan.Object)) {
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
									/* Array of kan.Object */
									if (!this[i][n].equals(o[i][n])) {
										return false;
									}
								} else if (typeof(this[i][n]) == 'object' && typeof(o[i][n]) == 'object') {
									/* Array of object */
									if (!(new kan.Object(this[i][n]).equals(o[i][n]))) {
										return false;
									}
								} else {
									return false;
								}// TODO: finish kan.Object.prototype.equals()
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
	 * @param {kan.Object} o
	 * @return {kan.Object}
	 */
	compare: function(o) {
		var t = new kan[this.info.type]();
		for (var i in this) {
			switch(typeof(this[i])) {
				case 'number':
					t[i] = kan.Number.compare(this[i], o[i]); break;
				case 'string':
					t[i] = this[i].localeCompare(o[i]); break;
				case 'boolean':
					t[i] = this[i] == o[i]; break;
				case 'object':
					if (this[i].compare) {
						/* Compare these two kan.Object */
						t[i] = this[i].compare(o[i]);
					} else if (o[i] instanceof Date) {
						/* compare their timestamp */
						t[i] = kan.Number.compare(this[i].getTime(), o[i].getTime());
					} else if (o[i] instanceof Array) {
						/* compare arrays length */
						t[i] = kan.Number.compare(this[i].length, o[i].length);
					} else {
						/* Create a new kan.Object with the javascript object and compare them */
						t[i] = new kan.Object(this[i]).compare(o[i]);
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
	*  Equivalent of instanceof but for kan.Objects
	*  @param {Type} the type of object ( kan.Object, not 'kan.Object' )
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
 * This class is an Array with more function, so is it an ArrayList ? Maybe, but List is shorter
 * @param {Object|Array} settings
 * @param {Array} settings.items
 * @constructor
 * @type {kan.List}
 * @extends {kan.Object}
*/
kan.List = function(settings) {
	this.types = {};
	this.items = new Array();
	if (settings && settings instanceof Object && settings.items) {
		this.addRange(settings.items.slice(0));
		delete settings.items;
	} else if (settings instanceof Array) {
		this.addRange(settings.slice(0));
		settings = null;
	}
	kan.Object.call(this, settings);
};

kan.List.prototype = {
	info: {
		type: 'List',
		getType: function() {
			return kan.List;
		}
	},
	/**
	* Define the type of the list
	*   this.item = ['a', 'b'] => 'string'
	*   this.item = [1, 2] => 'number'
	*   this.item = ['a', 1] => 'mixed'
	* @type {String}
	*/
	of: null,
	/**
	* items is the original array
	* @type {Array}
	*/
	items: null,
	/**
	* The list's items types count
	* @type {Object}
	*/
	types: null,
	/**
	* Add an item to the list
	* @param {?}
	* @return {kan.List}
	*/
	add: function(o) {
		if (!o) return false;
		this.items.push(o);
		/* get type of o */
		var t = kan.typeof(o);
		if (!this.types[t]) { this.types[t] = 0; }
		this.types[t] += 1;
		this._checkType();
		return this;
	},
	/**
	* Check the type of the list
	* @private
	*/
	_checkType: function() {
		this.of = null;
		if (this.empty()) { return; }
		var type = null;
		for(var t in this.types) {
			if (this.types[t] > 0) {
				if (!type) {
					type = t;
				} else {
					this.of = 'mixed'; break;
				}
			}
		}
		if (!this.of) { this.of = type; }
	},
	/**
	* Add a range of values to this list
	* @param {Array}
	* @return {kan.List} This instance
	*/
	addRange: function(a) {
		if (a instanceof Array) {
			this.items = this.items.concat(a);
			/* for each value in the array, add typeof(value) to this.types */
			var type = null;
			for(var index = 0; index < a.length; index++) {
				type = kan.typeof(a[index]);
				if (!this.types[type]) { this.types[type] = 0; }
				this.types[type] += 1;
			}
			
		} else if (a.info && a.inheritsof(kan.List)) {
			this.items = this.items.concat(a.items);
			/* for each types in a, add to this.types */
			for (var t in a.types) {
				if (!this.types[t]) { this.types[t] = 0; }
				this.types[t] += a.types[t];
			}
		}
		this._checkType();
		return this;
	},
	/**
	* Remove an object from this list
	* @param {Function(this=List[index], index)=Boolean|?} Function where this=list[index] and returns boolean, if true then remove this|Number is the index of the list|Object, looking for objects which are equals to in this list eand remove them
	* @return {kan.List} this instance
	*/
	remove: function(o) {
		var type = typeof(o);
		switch(type) {
			case 'function':
				for(var index = 0; index < this.items.length; index++) {
					if (o.call(this.items[index], index) == true) {
						this.types[kan.typeof(this.items[index])] -= 1;
						this.items.splice(index, 1);
						index -= 1;
					}
				}
				break;
			case 'object':
				for(var index = 0; index < this.items.length; index++) {
					if (o.equals && o.equals(this.items[index])) {
						this.types[type] -= 1;
						this.items.splice(index, 1);
						index -= 1;
					} else if (kan.equal(o, this.items[index])){
						this.types[type] -= 1;
						this.items.splice(index, 1);
						index -= 1;
					}
				}
				break;
			default:
				for(var index = 0; index < this.items.length; index++) {
					if (this.items[index] === o) {
						this.types[type] -= 1;
						this.items.splice(index, 1);
						index -= 1;
					}
				}
		}
		this._checkType();
		return this;
	},
	/**
	* Remove an item at the position index
	* @param {Number} index of the element you want to remove
	* @return {kan.List} This list
	*/
	removeAt: function(index) {
		this.types[kan.typeof(this.items[index])] -= 1;
		this.items.splice(index, 1);
		this._checkType();
		return this;
	},
	/**
	* Exchange two values by index
	* @param {Number}
	* @param {Number}
	*/
	exchange: function(index1, index2) {
		var tmp = this.items[index1];
		this.items[index1] = this.items[index2];
		this.items[index2] = tmp;
	},
	/**
	* Move an object to the inferior index
	* @param {Function(this=List[index], index)=Boolean|?}
	* @return {kan.List}
	*/
	moveUp: function(o) {
		switch(typeof(o)) {
			case 'function':
				for(var index = 0; index < this.items.length; index++) {
					if (o.call(this.items[index], index)) {
						this.items[index] = this.items[index-1];
						this.items[index-1] = o;
					}
				}
				break;
			case 'object':
				for(var index = 0; index < this.items.length; index++) {
					if (o.equals && o.equals(this.items[index])) {
						this.items[index] = this.items[index-1];
						this.items[index-1] = o;
					} else if (kan.equal(o, this.items[index])){
						this.items[index] = this.items[index-1];
						this.items[index-1] = o;
					}
				}
				break;
			default:
				for(var index = 0; index < this.items.length; index++) {
					if (this.items[index] === o && index != 0) {
						this.items[index] = this.items[index-1];
						this.items[index-1] = o;
					}
				}
		}
		return this;
	},
	/**
	* Move an object to the superior index
	* @param {Function(this=List[index], index)=Boolean|?} if param is a function, if return true, then remove this.items[index]
	* @return {kan.List}
	*/
	moveDown: function(o) {
		switch(typeof(o)) {
			case 'function':
				for(var index = 0; index < this.items.length; index++) {
					if (o.call(this.items[index], index)) {
						this.items[index] = this.items[index+1];
						this.items[index+1] = o;
					}
				}
				break;
			case 'object':
				for(var index = 0; index < this.items.length; index++) {
					if (o.equals && o.equals(this.items[index])) {
						this.items[index] = this.items[index+1];
						this.items[index+1] = o;
					} else if (kan.equal(o, this.items[index])){
						this.items[index] = this.items[index+1];
						this.items[index+1] = o;
					}
				}
				break;
			default:
				for(var index = 0; index < this.items.length; index++) {
					if (this.items[index] === o && index != this.items.length) {
						this.items[index] = this.items[index+1];
						this.items[index+1] = o;
					}
				}
		}
		return this;
	},
	/**
	* Move an object at the beginning of the list
	* @param {Function(this=List[index], index)=Boolean|?}
	* @return {kan.List}
	*/
	moveToFirst: function(o) {
		var index = this.getIndex(o);
		this.exchange(index, 0);
		return this;
	},
	/**
	* Move an object to the end of the list
	* @param {Function(this=List[index], index)=Boolean|?}
	* @return {kan.List}
	*/
	moveToLast: function(o) {
		var index = this.getIndex(o);
		this.exchange(index, this.items.length-1);
		return this;
	},
	/**
	* Join this list with a separator
	* if this is a list of complex object, the second parameter must be a function
	* @param {String} the separator between each value
	* @param {Function(this=this.items[index], index)=String} Function that return a String in the context where this is equals to the current object and take one parameter: the index
	* @return {String}
	*/
	join: function(separator, fn) {
		if (!fn) {
			return this.items.join(separator);
		} else {
			var result = '';
			for(var index in this.items) {
				result += fn.call(this.items[index], index) + separator;
			}
			return result.substr(0, result.length -1);
		}
	},
	/**
	* Clear the list
	* @return {kan.List} this instance
	*/
	clear: function() {
		this.items = new Array();
		this.types = {};
		this.of = null;
		return this;
	},
	/**
	* Check if the list is empty
	* @return {Boolean} True: the list is empty
	*/
	empty: function() {
		return this.items.length == 0;
	},
	/**
	* Get the number of object in the list
	* @return {Number}
	*/
	count: function() {
		return this.items.length;
	},
	/**
	* Sort the list
	* The String|Number is more efficient( log(n) ) than with a comparer function ( n² )
	* @param {Function(Object, Object)=Number|null} Function that return +1, 0 or -1 to check if Object1 is more than Object2|null, then sort the list of Number|String
	*/
	sort: function(fn) {
	    this.items.sort(fn);
	},
	/**
	* Get an item by the Index
	* @param {Number}
	*/
	get: function(index) {
		return this.items[index];
	},
	/**
	* Set an item at the index specified
	* @param {Number} index
	* @param {?} Object to set at the index
	*/
	set: function(index, value) {
		if (this.items[index]) {
			this.types[kan.typeof(this.items[index])] -= 1;
			this.items[index] = value;
			this.types[kan.typeof(value)] += 1;
			this._checkType();
		}
	},
	/**
	* Get or Set the item at the index
	* @param {Number} index in the List
	* @param {?} The object you want to store
	* @return {object} return the object at the index
	*/
	item: function(index, object) {
		if (object) {
			this.types[kan.typeof(this.items[index])] -= 1;
			this.items[index] = object;
			this.types[kan.typeof(object)] += 1;
			this._checkType();
		}
		return this.items[index];
	},
	/**
	* Check if the list contains its value
	* @param {?} o
	* @return {Boolean}
	*/
	contains: function(o) {
		if (typeof(o) == 'object') {
			for(var index = 0; index < this.items.length; index++) {
				if (o.equals && o.equals(this.items[index])) {
					return true;
				}
			}
		} else {
			for(var index = 0; index < this.items.length; index++) {
				if (o === this.items[index]) {
					return true;
				}
			}
		}
		return false;
	},
	/**
	* Get the index of the object giver in param
	* @param {?}
	* @return {Number[0-Infinity]|-1} if -1, then there is not in the list
	*/
	getIndex: function(o) {
		if (typeof(o) == 'object') {
			for(var index = 0; index < this.items.length; index++) {
				if (o.equals) {
					if (o.equals(this.items[index]))
						return index;
				} else if (kan.equal(o, this.items[index])) {
					return index;
				}
			}
		} else {
			return this.items.indexOf(o);
		}
		return -1;
	},
	/**
	* Get the first element of this list
	* @return {?}
	*/
	first: function() {
		return this.items[0];
	},
	/**
	* Get the last element of this list
	* @return {?}
	*/
	last: function() {
		return this.items[this.items.length-1];
	},
	/**
	* Get the last index of the list
	* @return {Number}
	*/
	lastIndex: function() {
		return this.items.length-1;
	},
	/**
	* Execute a function(index) in the context of List[index]
	* @param {Function(this=this.items[index], Number=index)=Boolean} the param of the function is the index, if return false => break;
	* @return {Boolean} true or Function in param ask to break
	*/
	each: function(fn) {
		var returnValue;
		for (var index = 0; index < this.items.length; index++) {
			
			if (returnValue = fn.call(this.items[index], index)) {
				return returnValue;
			}
		}
		return false;
	},
	/**
	* Get the content of this list as String
	* @override
	* @return {String}
	*/
	toString: function() {
		return '{ of: ' + this.of + ', items: { ' + this.items.join(', ') + ' }';
	},
	/**
	* Check if this list deeply equals to another list
	* @override
	* @param {kan.List}
	* @return {Boolean}
	*/
	equals: function(o) {
		if (o.inheritsof && o.inheritsof(kan.List) && o.count() == this.count() && o.of === this.of) {
			for(var index = 0; index < this.items.length; index++) {
				if (this.items[i].equals) {
					if (!this.items.equals(o.items[i])) {
						return false;
					}
				} else {
					if (!kan.equal(this.items[i], o.items[i])) {
						return false;
					}
				}
			}
			return true;
		}
		return false;
	},
	/**
	* Clone the instance of kan.List
	* @return {kan.List}
	*/
	clone: function() {
		var l = new kan.List();
		l.items = this.items.slice(0);
		l.of = this.of;
		return l;
	}

};
kan.extend(kan.List, kan.Object);

kan.ShapeList = function(settings) {
	kan.List.call(this, settings);
};

kan.ShapeList.prototype = {
	info: {
		type: 'ShapeList',
		getType: function() {
			return kan.ShapeList;
		}
	},
	add: function(o) {
		if (o.draw && o.update) {
			kan.List.prototype.add.call(this, o);
		}
	},
	moveToFirst: function(o) {
		var index;
		if (typeof(o) == 'number') {
			index = o;
			o = this.items[index];
		} else {
			index = this.getIndex(o);
		}
		o.lastZIndex = o.zIndex;
		o.zIndex = this.first().zIndex - 1;
		this.items.slice(index, 1);
		this.items.unshift(o);
	},
	moveToLast: function(o) {
		var index;
		if (typeof(o) == 'number') {
			index = o;
			o = this.items[index];
		} else {
			index = this.getIndex(o);
		}
		o.lastZIndex = o.zIndex;
		o.zIndex = this.last().zIndex + 1;
		this.items.slice(index, 1);
		this.items.push(o);
	},
	moveDown: function(o) {
		var index;
		if (typeof(o) == 'number') {
			index = o;
			o = this.items[index];
		} else {
			index = this.getIndex(o);
		}
		o.lastZIndex = o.zIndex;
		o.zIndex = this.items[index-1] ? this.items[index-1].zIndex - 1 : o.zIndex - 1;
		this.exchange(index, index-1);
	},
	moveUp: function(o) {
		var index;
		if (typeof(o) == 'number') {
			index = o;
			o = this.items[index];
		} else {
			index = this.getIndex(o);
		}
		o.lastZIndex = o.zIndex;
		o.zIndex = this.items[index+1] ? this.items[index+1].zIndex + 1 : o.zIndex + 1;
		this.exchange(index, index+1);
	},
	moveBack: function(o) {
		o.zIndex = o.lastZIndex;
	},
	getIndex: function(o) {
		for(var index = 0; index < this.items; index++) {
			if (this.items[index].info.ID === o.info.ID) {
				return index;
			}
		}
		return -1;
	}

};
kan.extend(kan.ShapeList, kan.List);

/**
* A font
* @param {Object} settings
* @param {kan.Color|String} settings.fill the fill color of this font
* @param {kan.Color|String} settings.stroke the stroke color of this font
* @param {Number} settings.lineWidth the stroke line width, as default: 1
* @param {String} settings.family the font family, as default: Arial
* @param {Number} settings.size the font size, as default: 12
* @param {String|Number} settings.weight normal|bold|bolder|100-900
* @param {String} settings.baseLine the horizontal alignement (top|middle|bottom|alphabetic|ideographic)
* @param {String} settings.textAlign the vertical alignement (left|right|center)
* @param {String} settings.style the font style (normal|italic|underline)
* @param {Boolean} settings.smallcaps text as smallcaps or not, as default: false
* @constructor
* @extends {kan.Object}
*/
kan.Font = function(settings) {
	kan.Object.call(this, settings);
};

kan.Font.prototype = {
	info: {
		type: 'kan.Font',
		getType: function() {
			return kan.Font;
		}
	},
	/**
	* the font style (normal|italic|underline)
	* @type {String} 
	*/
	style: 'normal',
	/**
	* text as smallcaps or not, as default: false
	* @type {Boolean} 
	*/
	smallcaps: false,
	/**
	* Font-Weight (normal|bold|bolder|100-900)
	* @type {String} 
	*/
	weight: 'normal',
	/**
	* the font family, as default: Arial
	* @type {String} 
	*/
	family: 'Arial',
	/**
	* The fill color
	* @type {kan.Color} 
	*/
	fill: null,
	/**
	* The stroke color
	* @type {kan.Color} 
	*/
	stroke: null,
	/**
	* The font size
	* @type {Number}
	*/
	size: 12,
	/**
	* The stroke line width
	* @type {Number}
	*/
	lineWidth: 1,
	/**
	* the horizontal alignement (top|middle|bottom|alphabetic|ideographic) as default: top
	* @type {String}
	*/
	baseLine: 'top',
	/**
	* the vertical alignement (left|right|center) as default: left
	* @type {String}
	*/
	textAlign: 'left',
	/**
	* Set all parameters of this font to the context
	* @param {CanvasRenderingContext2D} ctx Context
	*/
	set: function(ctx) {
		this.applyFont(ctx);
		ctx.lineWidth = this.lineWidth;
		if (this.fill)
			ctx.fillStyle = this.fill instanceof kan.Color ? this.fill.toRGBA() : this.fill;
		if (this.stroke)
			ctx.strokeStyle = this.stroke instanceof kan.Color ? this.stroke.toRGBA() : this.stroke;
	},
	/**
	* Set just the necessaries parameters for update
	* @param {CanvasRenderingContext2D} ctx Context
	*/
	applyFont: function(ctx) {
		var caps = this.smallcaps ? 'small-caps': '';
		ctx.font = caps+' '+this.style+' '+this.weight+' '+this.size+'px '+' '+this.family;
		ctx.textBaseline = this.baseLine;
		ctx.textAlign = this.textAlign;
	},
	/**
	* Get the font information
	* @override
	* @return {String}
	*/
	toString: function() {
	    var caps = this.smallcaps ? 'small-caps': '';
		return caps+' '+this.style+' '+this.weight+' '+this.size+'px '+' '+this.family;
	}
};

kan.extend(kan.Font, kan.Object);


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


/**
 * Point object as a simple point
 * @param settings		{Object}
 * @param settings.x	{Number}	X Component
 * @param settings.y	{Number}	Y Component
 * @constructor
 * @extends {kan.Object}
 */
kan.Point = function(settings) {
	this.x = 0;
	this.y = 0;
	if(settings) {
		kan.Object.call(this, settings);
	}
};
kan.Point.prototype = {
	info:{
		type: 'Point',
		getType: function() {
			return kan.Point;
		}
	},
	/** @type {number} */
	x: 0,
	/** @type {number} */
	y: 0,
	/**
	 * Check if X-Y component are equals to this instance
	 * @override
	 * @param {kan.Point}
	 * @returns {Boolean}
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
	 * @param {kan.Point} o
	 * @return	{kan.Point}
	 */
	compare: function(o) {
		if ( o.x != null && o.y != null ) {
			var x = 0, y = 0;
			if (this.x > o.x) { x = 1; } else if (this.x < o.x) { x = -1; }
			if (this.y > o.y) { y = 1; } else if (this.y < o.y) { y = -1; }
			return new kan.Point({
				x: x,
				y: y
			});
		}
		return null;
	},
	/**
	 * get the string representation of this object
	 * @override
	 * @return {String}
	 */
	toString: function() {
		return '{ x: ' + this.x + ', y: ' + this.y + ' }'; 
	},
	/**
	 * Return this instance of Point as a Vector2
	 * @return {kan.Vector2}
	 */
	toVector2: function() {
		return new kan.Vector2({
			x: this.x,
			y: this.y
		});
	}
};
kan.extend(kan.Point, kan.Object);

/**
 * Vector object with two components
 * @param settings		{Object}
 * @param settings.x	{Number}	X Component
 * @param settings.y	{Number}	Y Component
 * @constructor
 * @extends {kan.Point}
 */
kan.Vector2 = function(settings) {
	kan.Point.call(this, settings);
};

kan.Vector2.prototype = {
	info: {
		type: 'Vector2',
		getType: function() {
			return kan.Vector2;
		}
	},
	/**
	 * Add to each value of this instance o
	 * @param o {Number|kan.Point} Numeric value|Other Point
	 * @return {kan.Vector2} this instance
	 */
	adds: function(value, value2){
    if (value2 && value) {
      this.x += value;
			this.y += value2;
    } else if ( typeof(value) == 'number' ) {
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
	 * @param {Number|kan.Point} Numeric value|Other Point
	 * @return {kan.Vector2} this instance
	 */
	substracts: function(value){
		if (value2 && value) {
      this.x -= value;
			this.y -= value2;
    } else if ( typeof(value) == 'number' ) {
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
	 * @param value {Number|kan.Point} Scalar value|Other Point
	 * @return {kan.Vector2} this instance
	 */
	multiplies: function(value){ 
		if (value2 && value) {
      this.x *= value;
			this.y *= value2;
    } else if ( typeof(value) == 'number' ) {
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
	 * @param value {Number|kan.Point} Scalar value|Other Point
	 * @return {kan.Vector2} this instance
	 */
	divides: function(value){
		if (value2 && value) {
      this.x /= value;
			this.y /= value2;
    } else if ( typeof(value) == 'number' ) {
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
	 * @param o {kan.Point}
	 * @return	{Number|NaN}
	 */
	distance: function(o) {
		if ( o.x != null && o.y != null ) {
			return Math.sqrt(Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2));
		}
		return NaN;
	},
	/**
	 * Get distance squared between this and another Vector2 instance
	 * @param o {kan.Vector2}
	 * @return {Number|NaN}
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
	 * @param {kan.Point} o
	 * @return	{kan.Point}
	 */
	compare: function(o) {
		if (o.inheritsof(kan.Point)) {
			var x = 0, y = 0;
			if (this.x > o.x) { x=1; } else if (this.x < o.x) { x=-1; }
			if (this.y > o.y) { y=1; } else if(this.y < o.y) { y=-1; }
			return new kan.Vector2({
				x: x,
				y: y
			});
		}
	}
};
kan.extend(kan.Vector2, kan.Point);
/**
 * Perform an addition with two Vector2
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {kan.Vector2}
 */
kan.Vector2.add = function(v1 , v2){
	return new kan.Vector2({ x: v1.x + v2.x, y: v1.y + v2.y});
};
/**
 * Perform an substraction with two Vector2
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {kan.Vector2}
 */
kan.Vector2.substract = function(v1 , v2){
	return new kan.Vector2({ x: v1.x - v2.x, y: v1.y - v2.y});
};
/**
 * Perform an multiplication with two Vector2
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {kan.Vector2}
 */
kan.Vector2.multiply = function(v1 , v2){
	return new kan.Vector2({ x: v1.x * v2.x, y: v1.y * v2.y});
};
/**
 * Perform an division with two Vector2
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {kan.Vector2}
 */
kan.Vector2.divide = function(v1 , v2){
	return new kan.Vector2({ x: v1.x / v2.x, y: v1.y / v2.y});
};
/**
 * Get the distance between two points
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {Number|NaN}
 */
kan.Vector2.distance = function(v1 , v2){
	if ( v1.x != null && v1.y != null && v2.x != null && v2.y != null ) {
		return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
	}
	return NaN;
};
/**
 * Get the distance squared between two points
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {Number}
 */
kan.Vector2.distanceSquared = function(v1, v2) {
	return v1.clone().distanceSquared(v2);
};
/**
 * Get a Vector2 instance x=1 && y=1
 * @return {kan.Vector2}
 */
kan.Vector2.One = function() {
	return new Vector2({ x: 1, y: 1});
};

/**
 * Define a dimension
 * @param settings
 * @param settings.width
 * @param settings.height
 * @constructor
 * @extends {kan.Object}
 */
kan.Size = function(settings) {
	if (settings) {
		kan.Object.call(this, settings);
	}
};

kan.Size.prototype = {
	info: {
		type: 'Size',
		getType: function() {
			return kan.Size;
		}
	},
	/** @type {number} */
	width: 0,
	/** @type {number} */
	height: 0,
	/**
	 * Check the equality with kan.Size or a scalar variable
	 * @param {kan.Size|Number} o
	 * @override
	 * @returns {Boolean}
	 */
	equals: function(o){
		if (o.inheritsof && o.inheritsof(kan.Size)) {
			return this.width == o.width && this.height == o.height;
		} else if (typeof(o) == 'number') {
			return this.width == o && this.height == o;
		}
		return false;
	},
	/**
	* Get the equivalent to string of this size
	* @override
	* @return {String}
	*/
	toString: function() {
		return '{ width: ' + this.width + ', height: ' + this.height + ' }';
	},
	/**
	 * Performs a comparison between two size.
	 * if this width is more than the other, it will returns 1 && if this height is less than the other, it will return -1. 0 for equality
	 * @override
	 * @param o
	 * @returns {kan.Size}
	 */
	compare: function(o) {
		if (o.inheritsof(kan.Size)) {
			var w = 0, h = 0;
			if (this.width > o.width) { w = 1; } else if (this.width < o.width) { w = -1; }
			if (this.height > o.height) { h = 1; } else if (this.height < o.height) { h = -1; }
			return new kan.Size({
				width: w,
				height: h
			});
		}
	},
	/**
	 * Clone this instance of kan.Size
	 * @override
	 * @returns {kan.Size}
	 */
	clone: function() {
		return new kan.Size({
			width: this.width,
			height: this.height
		});
	}
};

kan.extend(kan.Size, kan.Object);


/**
* Define the referential of drawing
* @constructor
* @extends {kan.Object}
*/
kan.Graphics = function() {
	this.transform = new kan.Object({
		m11: 1,
		m12: 0,
		m21: 0,
		m22: 1,
		dx: 0,
		dy: 0
	});
	this.scale = new kan.Point({ x:1,y:1 });
	this.rotation = 0;
	this.defaults = {
		transform: this.transform.clone(),
		scale: this.scale.clone(),
		rotation: 0
	};
	kan.Object.call(this);
};

kan.Graphics.prototype = {
	info: {
		type: 'Graphics',
		getType: function() {
			return kan.Graphics;
		}
	},
	/**
	* Set the transformation
	* @type {kan.Object}
	*/
	transform: null,
	/**
	* Set the scale
	* @type {kan.Point}
	*/
	scale: null,
	/**
	* Contain the default referential
	* @type {Object}
	*/
	defaults: null,
	/**
	* Set the rotation
	* @type {Number}
	*/
	rotation: 0,
	/**
	* the before draw function (save)
	*/
	beforedraw: function(ctx) {
		if (this.rotation != this.defaults.rotation) {
			this._saveContext(ctx);
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
	/**
	* The afterdraw function (restore)
	*/
	afterdraw: function(ctx) {
		this._restoreContext(ctx);
	},
	/**
	* Performs the transformation to the context
	* @param {CanvasRenderingContext2D} ctx Context
	*/
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
	/**
	* Set the scale value
	* @param {Number|kan.Point}
	*/
	setScale: function(value) {
		if (typeof(value) == 'number') {
			this.scale.y = this.scale.x = value;
		} else if ( value.x != null && value.y != null ) {
			this.scale = value.clone ? value.clone() : kan._clone(value);
		}
	},
	_contextSaved: false,
	/**
	* Save the context (just once)
	* @param {CanvasRenderingContext2D} ctx Context
	* @return {Boolean} true: the context is saved; false: not saved
	*/
	_saveContext: function(ctx) {
		if (!this._contextSaved) {
			ctx.save();
			return (this._contextSaved = true);
		}
		return false;
	},
	/**
	* restore the context if the context was saved
	* @param {CanvasRenderingContext2D} ctx Context
	* @return {Boolean} true: the context is restored; false: not restored
	*/
	_restoreContext: function(ctx) {
		if (this._contextSaved) {
			ctx.restore();
			return !(this._contextSaved = false);
		}
		return false;
	}
};

kan.extend(kan.Graphics, kan.Object);

/**
 * An abstract shape
 * @param {Object} settings
 * @param {Number} settings.x
 * @param {Number} settings.y
 * @param {kan.Point} settings.position
 * @param {Boolean} settings.clickable
 * @param {Boolean} settings.draggable 
 * @constructor
 * @extends {kan.Object}
 */
kan.Shape = function(settings) {
	/* Redefine position && currentPosition for this construction */
	this.events = new kan.EventManager();
	this.currentPosition = new kan.Point();
	this.position = new kan.Point();
	this.graphics = new kan.Graphics();
	/** 
	 * Default random value associate to this shape, to simulate its own behavior
	 * @define {Number} Number[0-1]
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
				if (this.size)
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
		if (!this.clickable)
			this.on('mousedown', this.eventsHandlers.click.down);
		this.on('mousemove', this.eventsHandlers.drag.move);
		this.on('mouseup', this.eventsHandlers.drag.end);
	}
	kan.Object.call(this);
};

kan.Shape.prototype = {
	info : {
		type : 'Shape',
		getType: function() {
			return kan.Shape;
		}
	},
	/** 
	* The position where to draw the shape
	* @type {kan.Point} 
	*/
	position : null,
	zIndex: 0,
	/** 
	* The position where to draw the shape + position modifications
	* @type {kan.Point} 
	*/
	currentPosition: null,
	/** 
	* The fill color
	* @type {kan.Color|string} 
	*/
	fill : null,
	/** 
	* The stroke color
	* @type {kan.Color|string} 
	*/
	stroke : null,
	/** 
	* The stroke lineWidth
	* @type {Number} 
	*/
	lineWidth : 1,
	/** 
	* Define if the object is clickable or not
	* @type {Number} 
	*/
	clickable : false,
	/** 
	* Define if the object is draggable or not
	* @type {Number} 
	*/
	draggable : false,
	/** 
	* Defines the referential
	* @type {kan.Graphics} 
	*/
	graphics: null,
	/**
	* Events container
	* @type {kan.EventManager}
	*/
	events: null,
	/** Elements for floating effect */
	floating: {
		speed: null,
		amplitude: null
	},
	random: 0,
	/**
	* Add this shape to a layer (or any List/shape container)
	* @param {kan.Layer|kan.List|Array} this instance is adding to that
	* @return {kan.Shape} this instance
	*/
	addTo: function(layer) {
		if (layer instanceof Array) {
			layer.push(this);
		} else if (layer.add) {
			layer.add(this);
		}
		return this;
	},
	/**
	 * Default update function for shapes
	 * @param {Object} data
	 */
	update : function(data) {
		/* Floating effect support */
		if (this.floating.speed && this.floating.amplitude) {
			this.currentPosition.y = this.position.y + Math.cos(data.timer * (this.floating.speed/10)) * this.floating.amplitude/10;
		} else {
			this.currentPosition.y = this.position.y;
		}
		this.currentPosition.x = this.position.x;
	},
	draw : function() {},
	/** Events handlers container */
	eventsHandlers: {
		click : {
			down : function(e) {
				this.events.state.clicked = false;
				if (this.contains(e.mousePosition)) {
					this.events.state.pressed = true;
					kan.Mouse.pressed = true;
					this.events.state.lastPosition = kan.Vector2.substract(this.position, e.mousePosition);
					this.info.layer.components.moveToLast(this);
					if (this.onpressed) { this.onpressed(e); }
					return false;
				}
				this.events.state.pressed = false;
				return true;
			},
			up : function(e) {
				if (this.contains(e.mousePosition) && this.events.state.pressed && !this.events.state.dragging) {
					this.events.state.pressed = false;
					kan.Mouse.pressed = false;
					this.events.state.clicked = true;
					this.info.layer.components.moveBack(this);
					if (e.which == 3 && kan.DEBUG) {
						console.log(this);
					}
					if (this.onclick) { 
						return this.onclick(e);
					}
					return false;
				}
				return true;
			}
		},
		drag : {
			move : function(e) {
				if (this.events.state.pressed) {
					this.position.x = e.mousePosition.x + this.events.state.lastPosition.x;
					this.position.y = e.mousePosition.y + this.events.state.lastPosition.y;
					this.events.state.dragging = true;
					return false;
				}
				return true;
			},
			end : function(e) {
				if (this.events.state.dragging) {
					this.position.x = e.mousePosition.x + this.events.state.lastPosition.x;
					this.position.y = e.mousePosition.y + this.events.state.lastPosition.y;
					this.events.state.dragging = false;
					this.events.state.pressed = false;
					kan.Mouse.pressed = false;
					this.info.layer.components.moveBack(this);
					return false;
				}
				return true;
			}
		}
	},
	/**
	* Compare this Shape to another
	* @override
	* @param {kan.Shape} o
	* @return {kan.Shape}
	*/
	compare: function(o) {
		if (o.inheritsof && o.inheritsof(kan.Shape)) {
			return new o.info.getType()({
				position: this.position.compare(o.position),
				currentPosition: this.currentPosition.compare(o.currentPosition)
			});
		}
		return null;
	},
	/**
	*  Create a new Event Handler for this kan.Object
	* You can add as many 'mousemove' events as you want to same item, for example
	*  @param {String} e
	*  @param {Function(Event)} function to perform when the event's spreading
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
kan.extend(kan.Shape, kan.Object);

/**
 * Line instance - can contains several points
 * @constructor
 * @extends {kan.Shape}
 * @param {Object} settings
 * @param {Array|kan.List} points that define the line
 */
kan.Line = function(settings) {
	this.graphics = new kan.Graphics();
	this.points = new kan.List(settings.points);
	delete settings.points;
	kan.Shape.call(this, settings);
};

kan.Line.prototype = {
	info: {
		type: 'Line',
		getType: function() {
			return kan.Line;
		}
	},
	/**
	* Color of the line
	* @type {kan.Color}
	*/
	stroke: null,
	/**
	* All points that defined the line
	* @type {kan.List<kan.Point>}
	*/
	points: null,
	/**
	* Define the width of the line
	* @type {Number}
	*/
	width: 1,
	/** 
	* Defines the referential
	* @type {kan.Graphics} 
	*/
	graphics: null,
	/**
	* Update some values
	* @type {Function}
	*/
	update: function() {},
	/**
	* Draw the Line with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {kan.Point} data.lastMouse.rel
	* @param {kan.Point} data.lastMouse.abs
	*/
	draw: function(data) {
		if (this.stroke && !this.points.empty()) {
			var ctx = data.context;
			this.graphics.beforedraw(ctx);
			ctx.strokeStyle = this.stroke.inheritsof && this.stroke.inheritsof(kan.Color) ? this.stroke.toRGBA() : this.stroke;
			ctx.lineWidth = this.width;
			ctx.beginPath();
			ctx.moveTo(this.points.get(0).x, this.points.get(0).y);
			this.points.each(function() {
				ctx.lineTo(this.x, this.y);
			});
			ctx.stroke();

			this.graphics.afterdraw(ctx);
		}
	},
	/**
	* Check if a line is equals to another line
	* @override
	* @param {kan.Line} another line
	* @return {Boolean}
	*/
	equals: function(o) {
		if (o.inheritsof && o.inheritsof(kan.Line)) {
			return this.points.equals(o.points);
		}
		return false;
	},
	clone: function() {
		return new kan.Line({
			points: this.points.clone()
		})
	}
};
kan.extend(kan.Line, kan.Shape);

/**
 * A drawable string
 * @param {Object} 		settings
 * @param {kan.Point} 	settings.position	Position where drawing this text
 * @param {String} 		settings.value		String to draw
 * @param {kan.Font} 	settings.font		kan.Font instance
 * @constructor
 * @extends {kan.Shape}
 */
kan.Text = function(settings) {
	this.value = '';
	this.font = new kan.Font();
	kan.Shape.call(this, settings);
};

kan.Text.prototype = {
	info: {
		type: 'Text',
		getType: function() {
			return kan.Text;
		}
	},
	value: null,
	currentPosition: null,
	getOrigin: function() {
		return kan.Vector2.add(this.position, this.origin);
	},
	/**
	* Update all values if the value != lastvalue
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {kan.Point} data.lastMouse.rel
	* @param {kan.Point} data.lastMouse.abs
	*/
	update: function(data) {
		if (this.value != this.lastValue) {
			this.font.applyFont(data.context);
			this.width = data.context.measureText(this.value).width;
			this.origin = new kan.Point({
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
	/**
	* Draw the Text with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {kan.Point} data.lastMouse.rel
	* @param {kan.Point} data.lastMouse.abs
	*/
	draw: function(data){
		/** @define {CanvasRenderingContext2D} */
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
	/**
	* Compare this instance to another
	* @override
	* @param {?} o
	* @return {kan.Text}
	*/
	compare: function(o) {
		/* TODO: kan.Text comparison */
		return null;
	},
	/**
	* Check if the text value and font is equals to another instance
	* @override
	* @param {kan.Text|String}
	* @return {Boolean}
	*/
	equals: function(o) {
		if (o.inheritsof && o.inheritsof(kan.Text) && this.value === o.value) {
			return this.font.equals(o.font);
		} else if (typeof(o) == 'string') {
			return this.value == o;
		}
		return false;
	},
	/**
	* Clone this instance of kan.Text
	* @override
	* @return {kan.Text}
	*/
	clone: function() {
		return new kan.Text({
			position: this.position.clone(),
			font: this.font.clone(),
			value: this.value
		});
	},
	/**
	* Check if this contains another shape
	* For now, only Point support
	* @param {kan.Point} p
	* @return {Boolean}
	*/
	contains: function(p) {
	    /* kan.Point support */
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
kan.extend(kan.Text, kan.Shape);


/**
 * Create a rectangle
 * @param settings
 * @param {kan.Point} settings.position	Representation of the position of this instance	(Unnecessary if X && Y are given)
 * @param {Number} settings.x			X component of the position	(Unnecessary if position is given)
 * @param {Number} settings.y			Y component of the position (Unnecessary if position is given)
 * @param {kan.Size} settings.size		Representation of the dimension of the rectangle	(Unnecessary if Width && Height are given)
 * @param {Number} settings.width		Width of this rectangle		(Unnecessary if Size is given)
 * @param {Number} settings.height		Height of this rectangle	(Unnecessary if Size is given)
 * @param {Number} settings.amplitude	Necessary for floating effect
 * @param {Number} settings.speed		Necessary for floating effect
 * @constructor
 * @extends {kan.Shape}
 */
kan.Rectangle = function(settings) {
	this.borderRadius = {
		topLeft: 0,
		topRight: 0,
		bottomLeft: 0,
		bottomRight: 0
	};
	this.size = new kan.Size();
	if (settings) {
		if (settings.borderRadius && typeof(settings.borderRadius) == 'number') {
			this.borderRadius = {
				topLeft: settings.borderRadius,
				topRight: settings.borderRadius,
				bottomLeft: settings.borderRadius,
				bottomRight: settings.borderRadius
			};
			delete settings.borderRadius;
		}
	}
	kan.Shape.call(this, settings);
};

kan.Rectangle.prototype = {
	info: {
		type: 'Rectangle',
		getType: function() {
			return kan.Rectangle;
		}
	},
	size: null,
	currentPosition: null,
	getOrigin: function() {
		return new kan.Vector2({
			x: this.position.x + this.size.width/2,
			y: this.position.y + this.size.height/2
		});
	},
	borderRadius: null,
	/**
	* Draw the Rectangle with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {kan.Point} data.lastMouse.rel
	* @param {kan.Point} data.lastMouse.abs
	*/
	draw: function(data) {
    	/** @define {CanvasRenderingContext2D} */
		var ctx = data.context;
		this.graphics.beforedraw(ctx);
		if (this.fill || this.stroke) {
			/* set Attributes */
			if (this.fill) { ctx.fillStyle = this.fill instanceof kan.Color ? this.fill.toRGBA() : this.fill; }
			if (this.stroke) { ctx.strokeStyle = this.stroke instanceof kan.Color ? this.stroke.toRGBA() : this.stroke; }
			ctx.lineWidth = this.lineWidth;
			/* draw Path */
			this.isRounded ? this._setRoundedRectPath(ctx) : this._setRectPath(ctx);
			/* fill & stroke */
			if (this.fill) { ctx.fill(); }
			if (this.stroke) { ctx.stroke(); }
		
		}
		this.graphics.afterdraw(ctx);
	},
	/**
	*  Check if another >Rectangle or >Point is containing by this instance
	* @param {kan.Point|kan.Rectangle}
	* @return {Boolean}
	*/
	contains: function(o) {
		var tp = this.currentPosition ? this.currentPosition : this.position;
		if (o.inheritsof(kan.Point)) {
			return (o.x > tp.x
				 && o.x < tp.x + this.size.width
			     && o.y > tp.y
			     && o.y < tp.y + this.size.height);
		} else if (o.inheritsof(kan.Rectangle)) {
			var p = o.currentPosition ? o.currentPosition : o.position;
			return (p.x > tp.x
					&& p.y > tp.y
					&& p.x + o.size.width <= tp.x + this.size.width
					&& p.y + o.size.height <= tp.y + this.size.height);
		}
		return false;
	},
	/**
	* Check if this instance of kan.Rectangle is equals to another
	* @override
	* @param {kan.Shape|Number} o
	* @return {Boolean}
	*/
	equals: function(o) {
		if (o.inhertitsof && o.inheritsof(kan.Rectangle)) {
			return o.position.x == this.position.x && o.position.y == this.position.y
				&& o.size.width == this.size.width && o.size.height == this.size.height;
		} else if (typeof(o) == 'number') {
			return this.position.x == o && this.position.y == o
				&& this.size.width == o && this.size.height == o;
		}
		return false;
	},
	/**
	 * Performs a comparison between two rectangles
	 * @override
	 * @param {kan.Rectangle} o
	 * @return {kan.Rectangle}
	 */
	compare: function(o) {
		if (!o.inheritsof(kan.Rectangle)) { return null; }
		var x=0, y=0, w=0, h=0;
		if (this.position.x > o.position.x) { x = 1; } else if (this.position.x < o.position.x) { x = -1; }
		if (this.position.y > o.position.y) { y = 1; } else if (this.position.y < o.position.y) { y = -1; }
		if (this.size.width > o.size.width) { w = 1; } else if (this.size.width < o.size.width) { w = -1; }
		if (this.size.height > o.size.height) { h = 1; } else if (this.size.height < o.size.height) { h = -1; }
		return new kan.Rectangle({
			position: new kan.Point({
				x: x,
				y: y
			}),
			size: new kan.Size({
				width: w,
				height: h
			})
		});
	},
	/**
	 * Clone this instance
	 * @override
	 * @return {kan.Rectangle}
	 */
	clone: function() {
		var fill = this.fill instanceof kan.Color ? this.fill.clone() : this.fill;
		var stroke = this.stroke instanceof kan.Color ? this.stroke.clone() : this.stroke;
		return new kan.Rectangle({
			position: this.position.clone(),
			size: this.size.clone(),
			fill: fill,
			stroke: stroke,
			amplitude: this.floating.amplitude,
			speed: this.floating.speed,
			clickable: this.clickable,
			draggable: this.draggable,
      borderRadius: kan._clone(this.borderRadius)
		});
	},
  /**
   * Get a point on this Rectangle
   * @param {String} top|mid|bottom
   * @param {String} left|mid|bottom
   * @return {kan.Point}
  **/
	getPoint: function(tmb, lmr) {
    var X, Y;
    if (typeof(lmr) == 'string') {
      if (lmr == 'left') {
        X = this.position.x;
      } else if (lmr == 'right') {
        X = this.position.x + this.size.width;
      } else {
        X = this.position.x + this.size.width/2;
      }
    }
    if (typeof(tmb) == 'string') {
      if (tmb == 'top') {
        Y = this.position.y;
      } else if (tmb == 'bottom') {
        Y = this.position.y + this.size.height;
      } else {
        Y = this.position.y + this.size.height/2;
      }
    }
    return new kan.Point({ x: X, y: Y });
	},
  /**
   * Set the path for a rounded Rectangle
   * @param {CanvasRenderingContext2D}
  */
	_setRoundedRectPath: function(context) {
		var topRightPositionX = this.getPoint('top', 'right').x, 
		bottomLeftPositionY = this.getPoint('bottom', 'left').y,
		radius = this.borderRadius;
		
		context.beginPath();
		context.moveTo(this.position.x + radius.topLeft, this.position.y);
		context.lineTo(topRightPositionX - radius.topRight, this.position.y);
		context.quadraticCurveTo(topRightPositionX, this.position.y, topRightPositionX, this.position.y + radius.topRight);
		context.lineTo(topRightPositionX, bottomLeftPositionY - radius.bottomRight);
		context.quadraticCurveTo(topRightPositionX, bottomLeftPositionY, topRightPositionX - radius.bottomRight, bottomLeftPositionY);
		context.lineTo(this.position.x + radius.bottomRight, bottomLeftPositionY);
		context.quadraticCurveTo(this.position.x, bottomLeftPositionY, this.position.x, bottomLeftPositionY - radius.bottomLeft);
		context.lineTo(this.position.x, this.position.y + radius.topLeft);
		context.quadraticCurveTo(this.position.x, this.position.y, this.position.x + radius.topLeft, this.position.y);
	},
  /**
   * Check if this instance of Rectangle is rounded or not
   * @return {Boolean}
  **/
	isRounded: function() {
		return (this.borderRadius.topLeft != 0
			 || this.borderRadius.topRight != 0
			 || this.borderRadius.bottomLeft != 0
			 || this.borderRadius.bottomRight != 0);
	},
  /**
   * Set the path for a simple Rectangle
   * @param {CanvasRenderingContext2D}
  */
	_setRectPath: function(context) {
		context.beginPath();
		context.moveTo(this.position.x, this.position.y);
		context.LineTo(this.position.x + this.size.width, this.position.y);
		context.LineTo(this.position.x + this.size.width, this.position.y + this.size.height);
		context.LineTo(this.position.x, this.position.y + this.size.height);
		context.LineTo(this.position.x, this.position.y);
	}
};

kan.extend(kan.Rectangle, kan.Shape);



/**
 * Create a instance of kan.Circle
 * @param {Object} settings
 * @param {kan.Point} settings.position	Representation of the position of this instance	(Unnecessary if X && Y are given)
 * @param {Number} settings.x			X component of the position	(Unnecessary if position is given)
 * @param {Number} settings.y			Y component of the position (Unnecessary if position is given)
 * @param {Number} settings.radius		Radius of this circle
 * @param {Number} settings.amplitude	Necessary for floating effect
 * @param {Number} settings.speed		Necessary for floating effect
 * @constructor
 * @extends {kan.Shape} 
 * @type {kan.Circle}
 * @returns {kan.Circle}
 */
kan.Circle = function(settings) {
	kan.Shape.call(this, settings);
};

kan.Circle.prototype = {
	info: {
		type: 'Circle',
		getType: function() {
			return kan.Circle;
		}
	},
	currentPosition: null,
	/**
	* The radius of the Circle
	* @type {Number}
	*/
	radius: 0,
	/**
	* Draw the circle with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {kan.Point} data.lastMouse.rel
	* @param {kan.Point} data.lastMouse.abs
	*/
	draw: function(data) {
		/** @define {CanvasRenderingContext2D} */
		var ctx = data.context;
		this.graphics.beforedraw(ctx);
		if (this.radius > 0 && this.fill || this.stroke && this.radius > 0) {
			ctx.beginPath();
			ctx.arc( this.currentPosition.x, this.currentPosition.y, this.radius, 0, Math.PI * 2 );
			if ( this.fill ) {
				ctx.fillStyle = this.fill instanceof kan.Color ? this.fill.toRGBA() : this.fill;
				ctx.fill();
			}
			if ( this.stroke ) {
				ctx.strokeStyle = this.stroke instanceof kan.Color ? this.stroke.toRGBA() : this.stroke;
				ctx.lineWidth = this.lineWidth;
				ctx.stroke();
			}
		}
		this.graphics.afterdraw(ctx);
	},
	/**
	 * Check if this instance containing another
	 * @param {kan.Point|kan.Circle} c
	 * @return {Boolean}
	 */
	contains: function( c ) {
		/** @returns {Number} */
		var d = 0,
		tp = this.currentPosition ? this.currentPosition : this.position;
		if ( c.inheritsof(kan.Point) ) {
			d = kan.Vector2.distance(tp, c);
			if (this.isClicked) { this.isClicked = false; }
            return (d < this.radius);
		} else if (c.inheritsof(kan.Circle)) {
			d = kan.Vector2.distance(tp, c.position);
			return d < ( this.radius + c.radius );
		}
		return false;
	},
	/**
	 * Check if this instance of circle is equal to another
	 * @override
	 * @param {kan.Circle} o other instance of circle
	 * @return {Boolean}
	 */
	equals: function(o) {
		if (o.inheritsof(kan.Circle)) {
			return o.position.x == this.position.x && o.position.y == this.position.y
				&& this.radius == o.radius;
		}
		return false;
	},
	/**
	 * Performs a comparison between two circles
	 * @param {kan.Circle} o
	 * @return {kan.Circle|Boolean}
	 */
	compare: function(o) {
		if (o.inheritsof(kan.Shape)) {
			var r = 0;
			if (this.radius > o.radius) { r = 1; } else if (this.radius < o.radius) { r = -1; }
			return new kan.Circle({
				position: this.position.compare(o.position),
				currentPosition: this.currentPosition.compare(o.currentPosition),
				radius: r
			});
		}
		return false;
	},
	/**
	* Clone this instance of circle
	* @override
	* @return {kan.Circle}
	*/
	clone: function() {
		var fill = this.fill instanceof kan.Color ? this.fill.clone() : this.fill;
		var stroke = this.stroke instanceof kan.Color ? this.stroke.clone() : this.stroke;
		return new kan.Circle({
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

kan.extend(kan.Circle, kan.Shape);


/**
* A canvas drawable image
* @constructor
* @param {Object} settings
* @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|String} string can be the ID or the source of the image
* @param {kan.Point} settings.position	Representation of the position of this image	(Unnecessary if X && Y are given)
* @param {Number} settings.x			X component of the position	(Unnecessary if position is given)
* @param {Number} settings.y			Y component of the position (Unnecessary if position is given)
* @param {kan.Size} settings.size		Representation of the dimension of the rectangle	(Unnecessary if Width && Height are given)
* @param {Number} settings.width		Width of this image		(Unnecessary if Size is given)
* @param {Number} settings.height		Height of this image	(Unnecessary if Size is given)
* @param {Number} settings.amplitude	Necessary for floating effect
* @param {Number} settings.speed		Necessary for floating effect
*/
kan.Image = function(settings) {
	this.offset = new kan.Rectangle();
	this.size = new kan.Size();
	this.contains = kan.Rectangle.prototype.contains.bind(this);
	kan.Shape.call(this, settings);
	
	/* Set the Image */
	if (typeof(this.image) == 'string') {
		if (this.image.charAt(0) == '#') {
			this.image = document.getElementById(this.image.substr(1, this.image.length));
		} else {
			var src = this.image;
			this.image = new Image();
			this.image.src = src;
		}
	}
	
	if (this.size.equals(0)) {
		var that = this;
		this.image.onload = function() {
			that.size.width = this.width;
			that.size.height = this.height;
			that.isLoaded = true;
		};
		
	}
};

kan.Image.prototype = {
	info: {
		type: 'Image',
		getType: function() { return kan.Image; }
	},
	/**
	* Define if the image is loaded or not
	* @type {Boolean}
	*/
	isLoaded: false,
	/**
	* The position of the Image on the Layer
	* @type {kan.Point}
	*/
	position: null,
	/**
	* The size of the Image on the Layer
	* @type {kan.Point}
	*/
	size: null,
	/**
	* The area of the Image you want to draw
	* @type {kan.Rectangle}
	*/
	offset: null,
	/**
	* The Image|Canvas|Video you want to draw on the Layer
	* @type {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement}
	*/
	image: null,
	/**
	* Draw the Rectangle with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {kan.Point} data.lastMouse.rel
	* @param {kan.Point} data.lastMouse.abs
	*/
	draw: function(data) {
		if (this.image && this.isLoaded) {
			this.graphics.beforedraw(data.context);
			if (!this.offset.equals(0)) {
				data.context.drawImage(
					this.image,
					this.offset.position.x,
					this.offset.position.y,
					this.offset.size.width,
					this.offset.size.height,
					this.currentPosition.x,
					this.currentPosition.y,
					this.size.width,
					this.size.height
				);
			} else {
				data.context.drawImage(
					this.image,
					this.currentPosition.x,
					this.currentPosition.y,
					this.size.width,
					this.size.height
				);
			}
			this.graphics.afterdraw(data.context);
		}
	},
	/**
	* Check if this Image contains somthing
	* @override
	* @methodOf {kan.Rectangle}
	* @param {kan.Object}
	* @return {Boolean}
	*/
	contains: null
};

kan.extend(kan.Image, kan.Shape);

kan.Timer = function(seconds) {
	this.base = kan.Timer.time;
	this.last = kan.Timer.time;
	
	this.target = seconds || 0;
};
	
kan.Timer.prototype = {
	info: {
		type: 'Timer',
		getType: function() {
			return kan.Timer;
		}
	},
	last: 0,
	base: 0,
	target: 0,
	pausedAt: 0,
	
	set: function( seconds ) {
		this.target = seconds || 0;
		this.base = kan.Timer.time;
		this.pausedAt = 0;
	},
	
	
	reset: function() {
		this.base = kan.Timer.time;
		this.pausedAt = 0;
	},
	
	tick: function() {
		var delta = kan.Timer.time - this.last;
		this.last = kan.Timer.time;
		return (this.pausedAt ? 0 : delta);
	},
	
	
	delta: function() {
		return (this.pausedAt || kan.Timer.time) - this.base - this.target;
	},


	pause: function() {
		if( !this.pausedAt ) {
			this.pausedAt = kan.Timer.time;
		}
	},


	unpause: function() {
		if( this.pausedAt ) {
			this.base += kan.Timer.time - this.pausedAt;
			this.pausedAt = 0;
		}
	}
};

kan.Timer._last = 0;
kan.Timer.time = Number.MIN_VALUE;
kan.Timer.timeScale = 1;
kan.Timer.maxStep = 0.05;

kan.Timer.step = function() {
	var current = Date.now();
	var delta = (current - kan.Timer._last) / 1000;
	kan.Timer.time += Math.min(delta, kan.Timer.maxStep) * kan.Timer.timeScale;
	kan.Timer._last = current;
};

kan.extend(kan.Timer, kan.Object);

kan.Stage = function(settings) {
	kan.Object.call(this, settings);
	this.timer = new kan.Timer();
	this.layers = new Array();
};

kan.Stage.prototype = {
	info: {
		type: 'Stage',
		getType: function() {
			return kan.Stage;
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
	stop: function() {
		this.isRunning = false;
		clearTimeout();
		clearInterval();
	},
	run: function(mode) {
		this.isRunning = true;
		kan.Timer.step();
    switch(mode) {
      case 'once':
        this.update();
        this.draw();
        this.isRunning = false;
        break;
      default:
        this._loop();
    }
		this.timer.reset();
	},
	_loop: function() {
		if (this.isRunning) {
			kan.Timer.step();
			this.update();
			kan.Timer.step();
			this.draw();
			window.requestAnimFrame(this._loop.bind(this));
		}
	},
	add: function(o) {
		this.layers.push(o);
	},
	/**
	* Check the equality of this to another kan.Stage
	* @override
	* @param {?} o
	* @return {Boolean}
	*/
	equals: function(o) {
		if (!o.inheritsof) { return false; }
		return this.ID === o.ID && o.inheritsof(kan.Stage);
	},
  clear: function() {
    for(var i = 0; i < this.layers.length; i++) {
      this.layers[i].context.clearRect(0, 0, this.layers[i].canvas.width, this.layers[i].canvas.height);
    }
  }
};
kan.extend(kan.Stage, kan.Object);


/**
 * This class represents a Layer that drawing multiple Shapes
 * @param {Object} settings
 * @param {String|HTMLCanvasElement} settings.canvas
 * @param {Number} settings.width
 * @param {Number} settings.height
 * @constructor
 * @extends {kan.Object}
 */
kan.Layer = function(settings) {
	this.info.supportedEvents = new Object();
	this.offset = new kan.Point();
	this.components = new kan.ShapeList();
	this.graphics = new kan.Graphics();
	if ( settings.canvas ) {
		if (typeof(settings.canvas) == 'string') {
			/** @define {HTMLCanvasElement} */
			this.canvas = document.getElementById(settings.canvas);
			if (settings.width) { this.canvas.width = settings.width; }
			if (settings.height) { this.canvas.height = settings.height; }
			/** @define {CanvasRenderingContext2D} */
			this.context = this.canvas.getContext('2d');
			delete settings.canvas;
		} else if (settings.canvas instanceof HTMLCanvasElement) {
			this.context = settings.canvas.getContext('2d');
			if (settings.width) { settings.canvas.width = settings.width; }
			if (settings.height) { settings.canvas.height = settings.height; }
		}
	}
	kan.Object.call(this, settings);
};

kan.Layer.prototype = {
	info: {
		type: 'Layer',
		getType: function() {
			return kan.Layer;
		},
		supportedEvents: null
	},
	/**
	* The canvas html Element
	* @type {HTMLCanvasElement}
	*/
	canvas: null,
	/**
	* The rendering context
	* @type {CanvasRenderingContext2D}
	*/
	context: null,
	/**
	* The width of the canvas
	* @type {Number}
	*/
	width: 0,
	/**
	* The height of the canvas
	* @type {Number}
	*/
	height: 0,
	/**
	* The current offset of the context
	* It is always necessary with the kan.Graphics Object ?
	*/
	offset: null,
	/**
	* Graphics referential Object
	* @type {kan.Graphics}
	*/
	graphics: null,
	/**
	* Array of all components
	* @type {Array}
	*/
	components: null,
	/**
	* Add this kan.Layer to an Array, Stage or something else with the add|push method
	* @param {kan.Stage|Array} this instance is adding to that
	* @return {kan.Layer} this instance
	*/
	addTo: function(stage) {
		if (stage instanceof Array) {
			stage.push(this);
		} else if (stage.add) {
			stage.add(this);
		}
		return this;
	},
	/**
	* Add a drawable component, configure events before add
	* @param {kan.Object} the component to add
	*/
	add: function(component) {
		component.info.layer = this;
		this.components.add(component);
		for (var i in component.events) 
		{
			/* If the event does not exists */
			if (!this.info.supportedEvents[i]) {
				var addEventFunc = this.canvas.addEventListener ? 'addEventListener' : 'attachEvent';
				this.canvas[addEventFunc](i, (function(e) {
					if (e instanceof MouseEvent) {
						kan.Mouse._update(e);
						e.mousePosition = kan.Mouse.position.rel;
						e.mouseAbsPosition = kan.Mouse.position.abs;
					}
					e.target = (function(event) {
						return event.originalTarget || event.toElement || event.target;
					})(e);
					for (var i = this.components.items.length-1; i > -1; i--) {
						/* for each components, spread the event from top to bottom */
						if (!this.components.items[i].events.execute(e)) {
							return false;
						}
					}
				}).bind(this), false);
				this.info.supportedEvents[i] = true;
				if (!this.mouseUpCorrection) {
					document.addEventListener('mouseup', (function(e) {
						e.target = (function(event) {
							return event.originalTarget || event.toElement || event.target;
						})(e);
						if (e.target != this.canvas) {
							this.components.each(function() {
								this.events.reset();
							});
						}
					}).bind(this), false);
					this.mouseUpCorrection = true;
				}
			}
		}
	},
	/**
	* update all components which are updatable
	* @param {kan.Stage}
	*/
	update: function(stage) {
		var data = {
			context: this.context,
			timer: stage.timer.delta(),
			mouse: this.lastMouse
		};
		/* Update each components (override the kan.DrawableComponentsList.each function to be a very little bit quicker) */
		for(var index = 0; index < this.components.items.length; index++) {
			this.components.items[index].update(data);
		}
		/* Resort the list */
		this.components.sort(function(c1, c2) {
			return c1.zIndex > c2.zIndex ? 1 : c1.zIndex < c2.zIndex ? -1 : 0;
		});
	},
	/**
	* Draw all components which are drawable
	* @param {kan.Stage}
	*/
	draw: function(stage) {
	    /* Clear the canvas */
		this.context.clearRect(0, 0, this.width, this.height);
		/* Change scale, translation, rotation, ... */
		this.graphics.beforedraw(this.context);
		var data = {
			context: this.context,
			timer: stage.timer.delta(),
			mouse: this.lastMouse
		};
		/* Draw each components (override the kan.DrawableComponentsList.each function to be a very little bit quicker) */
		for(var index = 0; index < this.components.items.length; index++) {
			this.components.items[index].draw(data);
		}
		this.graphics.afterdraw(this.context);
	},
	/**
	* Check if a Layer equals to another kan.Object (which is a Layer)
	* @param {kan.Object}
	* @override
	* @return {Boolean}
	*/
	equals: function(o) {
		if (!o.inheritsof) { return false; }
		return this.ID === o.ID && o.inheritsof(kan.Layer);
	}
};

kan.extend(kan.Layer, kan.Object);



})();