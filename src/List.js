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
	for (var i in settings) {
		this[i] = settings[i];
	}
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
	* Move an object to the end of the list
	* @param {Function(this=List[index], index)=Boolean|?}
	* @return {kan.List}
	*/
	moveToFirst: function(o) {
		var index = this.getIndex(o);
		this.exchange(index, 0);
		return this;
	},
	/**
	* Move an object at the beginning of the list
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
				if (o.equals && o.equals(this.items[index])) {
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
		for (var index = 0; index < this.items.length; index++) {
			if (fn.call(this.items[index], index) == false) {
				return false;
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