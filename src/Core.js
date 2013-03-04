window.ec = {
	LANG: 'fr',
	DEBUG: false,
	extend: function(that, p) {
		/* Inheritance based on John Resigs code
		* http://ejohn.org/blog/simple-javascript-inheritance */
		var fnTest = /xyz/.test(function(){xyz;}) ? /\bparent\b/ : /.*/;
		var parent = p.prototype;
		var prop = that.prototype;
		var prototype = {};

		var type = that.prototype.info.type.split('.')[1];

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
			}
			else
			{
				prototype[name] = prop[name];
			}
		}
		for( var name in parent ) {
			if ( !prototype[name] && name != 'to'+type ) {
					prototype[name] = parent[name];
			}
		}
		that.prototype.info.parent = p.prototype.info;
		that.prototype = prototype;
		return;
	},
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
    }
};
window.ec._set_requestAnimFrame();