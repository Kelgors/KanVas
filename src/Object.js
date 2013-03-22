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