/**
 * Basic instance
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
	 * @type ec.Object
	 * @returns	{ec.Object}
	 */
	clone: function() {
		var o = new ec[this.info.type.split('.')[1]]();
		for ( var i in this ) {
			if ( typeof(i) != 'function' ){
				o[i] = this[i];
			}
		}
		return o;
	},
	/**
	 * Check if each value of this equals to others value
	 * @param o {Object} other
	 * @type Boolean
	 * @returns {Boolean}
	 */
	equals: function(o) {
		if (o instanceof ec.Object) {
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
	stringify: function() {
		return JSON.stringify(this);
	},
	/**
	*  Equivalent of instanceof but for ec.Objects
	*  @param {function} the type of object ( ec.Object, not 'ec.Object' )
	*  @type Boolean
	*  @return {Boolean}
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
	*  @param {string} event
	*  @param {function} function to perform when the event's spreading
	*/
	on: function(event, fn) {
		ec.EventManager.add(this, event, fn);
	}
	
};