
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