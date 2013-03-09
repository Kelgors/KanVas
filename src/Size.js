/**
 * Define a dimension
 * @param settings
 * @param settings.width
 * @param settings.height
 * @constructor
 * @extends {ec.Object}
 * @type {ec.Size}
 * @returns {ec.Size}
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
	/** @define {number} */
	width: 0,
	/** @define {number} */
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
	toString: function() {
		return '{ width: ' + this.width + ', height: ' + this.height + ' }';
	},
	/**
	 * Performs a comparison between two size.
	 * @param o
	 * @override
	 * @type ec.Size
	 * @returns {ec.Size}
	 * @description if this width is more than the other, it will returns 1 && if this height is less than the other, it will return -1. 0 for equality
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
	 * @type ec.Size
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