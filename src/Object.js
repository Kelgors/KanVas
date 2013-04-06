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