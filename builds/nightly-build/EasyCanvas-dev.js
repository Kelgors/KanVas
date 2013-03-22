/**
* EasyCanvas
* @package ec
* @version 0.2.6 (2013-03-21)
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
	ready: function(fn) {
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
					}
				}
			}
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

/**
 * Basic instance
 * @constructor
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
	 * @return {boolean}
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
	*  @param {Type} the type of object ( ec.Object, not 'ec.Object' )
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
* @param {Object} settings
* @param {Array} settings.array
* @constructor
* @extends {ec.Object}
*/
ec.List = function(settings) {
	this.types = {};
	if (settings && settings.array) {
		this.items = settings.array.slice();
		delete settings.array;
		this._checkType();
	} else {
		this.items = new Array();
	}
	
	for (var i in settings) {
		this[i] = settings[i];
	}
};

ec.List.prototype = {
	info: {
		type: 'List',
		getType: function() {
			return ec.List;
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
	types: null,
	add: function(o) {
		this.items.push(o);
		var t = typeof(o);
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
		/*var type = typeof(o);
		if (!this.types[type]) { this.types[type] = 0; }
		this.types[type] += 1;*/
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
	* @return {ec.List} This instance
	*/
	addRange: function(a) {
		if (a instanceof Array) {
			this.items = this.items.concat(a);
			/* for each value in the array, add typeof(value) to this.types */
			var type = null;
			for(var index in a) {
				type = typeof(a[index]);
				if (!this.types[type]) { this.types[type] = 0; }
				this.types[type] += 1;
			}
			this._checkType();
		} else if (a.info && a.inheritsof(ec.List)) {
			this.items = this.items.concat(a.items);
			/* for each types in a, add to this.types */
			for (var t in a.types) {
				if (!this.types[t]) { this.types[t] = 0; }
				this.types[t] += a.types[t];
			}
			/* Determine the type of this list */
			this._checkType()
		}
		return this;
	},
	/**
	* Remove an object from this list
	* @param {Function(this=List[index], index)=Boolean|?} Function where this=list[index] and returns boolean, if true then remove this|Number is the index of the list|Object, looking for objects which are equals to in this list eand remove them
	* @return {ec.List} this instance
	*/
	remove: function(o) {
		switch(typeof(o)) {
			case 'function':
				for(var index in this.items) {
					if (o.call(this.items[index], index)) {
						this.types[typeof(this.items[index])] -= 1;
						this.items.splice(index, 1);
					}
				}
				break;
			case 'object':
				for(var index in this.items) {
					if (o.equals && o.equals(this.items[index])) {
						this.types[typeof(this.items[index])] -= 1;
						this.items.splice(index, 1);
					} else if (ec.equal(o, this.items[index])){
						this.types[typeof(this.items[index])] -= 1;
						this.items.splice(index, 1);
					}
				}
				break;
			default:
				for(var index in this.items) {
					if (this.items[index] === o) {
						this.types[typeof(this.items[index])] -= 1;
						this.items.splice(index, 1);
					}
				}
		}
		this._checkType();
		return this;
	},
	/**
	* Remove an item at the position index
	* @param {Number} index of the element you want to remove
	* @return {ec.List} This list
	*/
	removeAt: function(index) {
		this.types[typeof(this.items[index])] -= 1;
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
	* @return {ec.List}
	*/
	moveUp: function(o) {
		switch(typeof(o)) {
			case 'function':
				for(var index in this.items) {
					if (o.call(this.items[index], index)) {
						this.items[index] = this.items[index-1];
						this.items[index-1] = o;
					}
				}
				break;
			case 'object':
				for(var index in this.items) {
					if (o.equals && o.equals(this.items[index])) {
						this.items[index] = this.items[index-1];
						this.items[index-1] = o;
					} else if (ec.equal(o, this.items[index])){
						this.items[index] = this.items[index-1];
						this.items[index-1] = o;
					}
				}
				break;
			default:
				for(var index in this.items) {
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
	* @param {Function(this=List[index], index)=Boolean|?}
	* @return {ec.List}
	*/
	moveDown: function(o) {
		switch(typeof(o)) {
			case 'function':
				for(var index in this.items) {
					if (o.call(this.items[index], index)) {
						this.items[index] = this.items[index+1];
						this.items[index+1] = o;
					}
				}
				break;
			case 'object':
				for(var index in this.items) {
					if (o.equals && o.equals(this.items[index])) {
						this.items[index] = this.items[index+1];
						this.items[index+1] = o;
					} else if (ec.equal(o, this.items[index])){
						this.items[index] = this.items[index+1];
						this.items[index+1] = o;
					}
				}
				break;
			default:
				for(var index in this.items) {
					if (this.items[index] === o && index != this.items.length) {
						this.items[index] = this.items[index+1];
						this.items[index+1] = o;
					}
				}
		}
		return this;
	},
	/**
	* Move an object to the end of the list
	* @param {Function(this=List[index], index)=Boolean|?}
	* @return {ec.List}
	*/
	moveToFirst: function(o) {
		var index = this.getIndex(o);
		this.exchange(index, 0);
		return this;
	},
	/**
	* Move an object at the beginning of the list
	* @param {Function(this=List[index], index)=Boolean|?}
	* @return {ec.List}
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
	*/
	clear: function() {
		this.items = new Array();
		this.types = {};
		this.of = null;
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
	* The String|Number is more efficient( log(n) ) than with a comparer function ( n\B2 )
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
	set: function(index, v) {
		if (this.items[index]) {
			this.types[typeof(this.items[index])] -= 1;
			this.items[index] = v;
			this.types[typeof(v)] += 1;
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
			this.types[typeof(this.items[index])] -= 1;
			this.items[index] = object;
			this.types[typeof(object)] += 1;
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
			for(var i in this.items) {
				if (o.equals && o.equals(this.items[index])) {
					return true;
				}
			}
		} else {
			for(var i in this.items) {
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
			for (var index in this.items) {
				if (o.equals && o.equals(this.items[index])) {
					return index;
				} else if (ec.equal(o, this.items[index])) {
					return index;
				}
			}
		} else {
			return this.items.indexOf(o);
		}
		return -1;
	},
	first: function() {
		return this.items[0];
	},
	last: function() {
		return this.items[this.items.length-1];
	},
	lastIndex: function() {
		return this.items.length-1;
	},
	/**
	* Execute a function(index) in the context of List[index]
	* @param {Function(Number)}
	*/
	each: function(fn) {
		for (var index in this.items) {
			fn.call(this.items[index], index);
		}
	},
	/**
	* Get the content of this list as String
	* @override
	* @return {String}
	*/
	toString: function() {
		var str = '';
		for(var i in this.items) {
			str += (this.items[i].toString ? this.items[i].toString() : this.items[i]) + ', ';
		}
		return str.substr(0, str.length -2);
	}

};
ec.extend(ec.List, ec.Object);


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
	* @type {ec.Color} 
	*/
	fill: null,
	/**
	* The stroke color
	* @type {ec.Color} 
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
			ctx.fillStyle = this.fill instanceof ec.Color ? this.fill.toHexa() : this.fill;
		if (this.stroke)
			ctx.strokeStyle = this.stroke instanceof ec.Color ? this.stroke.toHexa() : this.stroke;
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

ec.extend(ec.Font, ec.Object);


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
	/**
	 * return the color as HexaDecimal
	 * @return {String}
	 */
	toHexa: function() {
		return '#' + ((1 << 24) + (this.r << 16) + (this.g << 8) + this.b).toString(16).slice(1);
	},
	/**
	 * return this color as rgba(r, g, b, a) string
	 * @override
	 * @return {String}
	 */
	toString: function() {
		return 'rgba( ' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.a + ')';
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
ec.Color.random = function () {
    return new ec.Color(Math.random() * 256, Math.random() * 256, Math.random() * 256, 1);
};
ec.extend(ec.Color, ec.Object);

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


/**
 * Point object as a simple point
 * @param settings		{Object}
 * @param settings.x	{Number}	X Component
 * @param settings.y	{Number}	Y Component
 * @constructor
 * @extends {ec.Object}
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
	/** @type {number} */
	x: 0,
	/** @type {number} */
	y: 0,
	/**
	 * Check if X-Y component are equals to this instance
	 * @override
	 * @param {ec.Point}
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
	 * @param {ec.Point} o
	 * @return	{ec.Point}
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
	 * @return {String}
	 */
	toString: function() {
		return '{ x: ' + this.x + ', y: ' + this.y + ' }'; 
	},
	/**
	 * Return this instance of Point as a Vector2
	 * @return {ec.Vector2}
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
	 * @return {ec.Vector2} this instance
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
	 * @return {ec.Vector2} this instance
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
	 * @return {ec.Vector2} this instance
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
	 * @return {ec.Vector2} this instance
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
	 * @param o {ec.Vector2}
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
	 * @param {ec.Point} o
	 * @return	{ec.Point}
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
 * @return {ec.Vector2}
 */
ec.Vector2.add = function(v1 , v2){
	return new ec.Vector2({ x: v1.x + v2.x, y: v1.y + v2.y});
};
/**
 * Perform an substraction with two Vector2
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @return {ec.Vector2}
 */
ec.Vector2.substract = function(v1 , v2){
	return new ec.Vector2({ x: v1.x - v2.x, y: v1.y - v2.y});
};
/**
 * Perform an multiplication with two Vector2
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @return {ec.Vector2}
 */
ec.Vector2.multiply = function(v1 , v2){
	return new ec.Vector2({ x: v1.x * v2.x, y: v1.y * v2.y});
};
/**
 * Perform an division with two Vector2
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @return {ec.Vector2}
 */
ec.Vector2.divide = function(v1 , v2){
	return new ec.Vector2({ x: v1.x / v2.x, y: v1.y / v2.y});
};
/**
 * Get the distance between two points
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @return {Number|NaN}
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
 * @return {Number}
 */
ec.Vector2.distanceSquared = function(v1, v2) {
	return v1.clone().distanceSquared(v2);
};
/**
 * Get a Vector2 instance x=1 && y=1
 * @return {ec.Vector2}
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
	/** @type {number} */
	width: 0,
	/** @type {number} */
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
	 * @returns {ec.Size}
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


/**
* Define the referential of drawing
* @constructor
* @extends {ec.Object}
*/
ec.Graphics = function() {
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
	ec.Object.call(this);
};

ec.Graphics.prototype = {
	info: {
		type: 'Graphics',
		getType: function() {
			return ec.Graphics;
		}
	},
	/**
	* Set the transformation
	* @type {ec.Object}
	*/
	transform: null,
	/**
	* Set the scale
	* @type {ec.Point}
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
	* @param {Number|ec.Point}
	*/
	setScale: function(value) {
		if (typeof(value) == 'number') {
			this.scale.y = this.scale.x = value;
		} else if ( value.x != null && value.y != null ) {
			this.scale = value.clone ? value.clone() : ec._clone(value);
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
*/
ec.Shape = function(settings) {
	/* Redefine position && currentPosition for this construction */
	this.events = new ec.EventManager();
	this.currentPosition = new ec.Point();
	this.position = new ec.Point();
	this.graphics = new ec.Graphics();
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
	* @type {ec.Point} 
	*/
	position : null,
	zIndex: 0,
	/** 
	* The position where to draw the shape + position modifications
	* @type {ec.Point} 
	*/
	currentPosition: null,
	/** 
	* The fill color
	* @type {ec.Color|string} 
	*/
	fill : null,
	/** 
	* The stroke color
	* @type {ec.Color|string} 
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
	* @type {ec.Graphics} 
	*/
	graphics: null,
	/**
	* Events container
	* @type {ec.EventManager}
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
	draw : function() {},
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
					ec.Mouse.pressed = false;
					return false;
				}
				return true;
			}
		}
	},
	/**
	* Compare this Shape to another
	* @override
	* @param {ec.Shape} o
	* @return {ec.Shape}
	*/
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
	/**
	* Update all values if the value != lastvalue
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {ec.Point} data.lastMouse.rel
	* @param {ec.Point} data.lastMouse.abs
	*/
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
	/**
	* Draw the Text with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {ec.Point} data.lastMouse.rel
	* @param {ec.Point} data.lastMouse.abs
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
	* @return {ec.Text}
	*/
	compare: function(o) {
		/* TODO: ec.Text comparison */
		return null;
	},
	/**
	* Clone this instance of ec.Text
	* @override
	* @return {ec.Text}
	*/
	clone: function() {
		return new ec.Text({
			position: this.position.clone(),
			font: this.font.clone(),
			value: this.value
		});
	},
	/**
	* Check if this contains another shape
	* For now, only Point support
	* @param {ec.Point} p
	* @return {Boolean}
	*/
	contains: function(p) {
	    /* ec.Point support */
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
	/**
	* Draw the Rectangle with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {ec.Point} data.lastMouse.rel
	* @param {ec.Point} data.lastMouse.abs
	*/
	draw: function(data) {
    	/** @define {CanvasRenderingContext2D} */
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
	*/
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
	/**
	* Check if this instance of ec.Rectangle is equals to another
	* @override
	* @param {?} o
	* @return {Boolean}
	*/
	equals: function(o) {
		if (o.inheritsof(ec.Rectangle)) {
			return o.position.x == this.position.x && o.position.y == this.position.y
				&& o.size.width == this.size.width && o.size.height == this.size.height;
		}
	},
	/**
	 * Performs a comparison between two rectangles
	 * @override
	 * @param {ec.Rectangle} o
	 * @return {ec.Rectangle}
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
	 * @override
	 * @return {ec.Rectangle}
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
	/**
	* Draw the circle with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {ec.Point} data.lastMouse.rel
	* @param {ec.Point} data.lastMouse.abs
	*/
	draw: function(data) {
		/** @define {CanvasRenderingContext2D} */
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
	 * @return {Boolean}
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
	 * @override
	 * @param {ec.Circle} o other instance of circle
	 * @return {Boolean}
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
	 * @return {ec.Circle|Boolean}
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
	/**
	* Clone this instance of circle
	* @override
	* @return {ec.Circle}
	*/
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
	stop: function() {
		this.isRunning = false;
		clearTimeout();
		clearInterval();
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
	/**
	* Check the equality of this to another ec.Stage
	* @override
	* @param {?} o
	* @return {Boolean}
	*/
	equals: function(o) {
		if (!o.inheritsof) { return false; }
		return this.ID === o.ID && o.inheritsof(ec.Stage);
	}
};
ec.extend(ec.Stage, ec.Object);


/**
 * This class represents a Layer that drawing multiple Shapes
 * @param {Object} settings
 * @param {String} settings.canvas
 * @param {Number} settings.width
 * @param {Number} settings.height
 * @constructor
 * @extends {ec.Object}
 */
ec.Layer = function(settings) {
	this.info.supportedEvents = new Object();
	this.lastMouse = {
		rel: new ec.Point(),
		abs: new ec.Point()
	};
	this.offset = new ec.Point();
	this.components = new ec.List();
	this.graphics = new ec.Graphics();
	if ( settings.canvas ) {
		/** @define {HTMLCanvasElement} */
		this.canvas = document.getElementById(settings.canvas);
		this.canvas.width = settings.width;
		this.canvas.height = settings.height;
		/** @define {CanvasRenderingContext2D} */
		this.context = this.canvas.getContext('2d');
		delete settings.canvas;
	}
	ec.Object.call(this, settings);
};

ec.Layer.prototype = {
	info: {
		type: 'Layer',
		getType: function() {
			return ec.Layer;
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
	* It is always necessary with the ec.Graphics Object ?
	*/
	offset: null,
	/**
	* Graphics referential Object
	* @type {ec.Graphics}
	*/
	graphics: null,
	/**
	* Array of all components
	* @type {Array}
	*/
	components: null,
	/**
	* Last position of the mouse since the last event
	* @type {Object}
	*/
	lastMouse: {
	    /**
	    * Last relative position of the mouse since the last MouseEvent
	    * @type {ec.Point}
	    */
		rel: null,
	    /**
	    * Last absolute position of the mouse since the last MouseEvent
	    * No scrolling page
	    * @type {ec.Point}
	    */
		abs: null
	},
	/**
	* Add a drawable component, configure events before add
	* @param {ec.Object} the component to add
	*/
	add: function(component) {
		this.components.add(component);
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
					for (var i = this.components.items.length-1; i > -1; i--) {
						/* for each components, spread the event */
						if (!this.components.items[i].events.execute(e)) {
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
	/**
	* update all components which are updatable
	* @param {ec.Stage}
	*/
	update: function(stage) {
		var data = {
			context: this.context,
			timer: stage.timer.delta(),
			mouse: this.lastMouse
		};
		/* Update each components in the list */
		this.components.each(function() {
			this.update(data);
		});
		/* Resort the list */
		this.components.sort(function(c1, c2) {
			return c1.zIndex > c2.zIndex ? 1 : c1.zIndex < c2.zIndex ? -1 : 0;
		});
	},
	/**
	* Draw all components which are drawable
	* @param {ec.Stage}
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
		/* Draw each components */
		this.components.each(function() {
			this.draw(data);
		});
		this.graphics.afterdraw(this.context);
	},
	/**
	* Check if a Layer equals to another ec.Object (which is a Layer)
	* @param {ec.Object}
	* @override
	* @return {Boolean}
	*/
	equals: function(o) {
		if (!o.inheritsof) { return false; }
		return this.ID === o.ID && o.inheritsof(ec.Layer);
	}
};

ec.extend(ec.Layer, ec.Object);



})();
