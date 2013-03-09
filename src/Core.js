
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
	},
	/**
	* Guid Object
	* @define {Object}
	*/
	Guid: {
		/**
		* Create a uuid
		* @param {Boolean=} if false, no uuid without dashes
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
	}
};
window.ec._set_requestAnimFrame();