/**
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
	
};