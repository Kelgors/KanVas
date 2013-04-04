/**
* This class is an Array with more function, so is it an ArrayList ? Maybe, but List is shorter
* @param {Object|Array} settings
* @param {Array} settings.array
* @constructor
* @extends {ec.Object}
*/
ec.List = function(settings) {
	this.types = {};
	if (settings && settings instanceof Object && settings.items) {
		this.items = settings.items.slice();
		delete settings.items;
		this._checkType();
	} else if (settings instanceof Array) {
		this.items = settings.slice();
		settings = null;
		this._checkType()
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
