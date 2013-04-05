/**
 * Define a dimension
 * @param settings
 * @param settings.width
 * @param settings.height
 * @constructor
 * @extends {kan.Object}
 */
kan.Size = function(settings) {
	if (settings) {
		kan.Object.call(this, settings);
	}
};

kan.Size.prototype = {
	info: {
		type: 'Size',
		getType: function() {
			return kan.Size;
		}
	},
	/** @type {number} */
	width: 0,
	/** @type {number} */
	height: 0,
	/**
	 * Check the equality with kan.Size or a scalar variable
	 * @param {kan.Size|Number} o
	 * @override
	 * @returns {Boolean}
	 */
	equals: function(o){
		if (o.inheritsof && o.inheritsof(kan.Size)) {
			return this.width == o.width && this.height == o.height;
		} else if (typeof(o) == 'number') {
			return this.width == o && this.height == o;
		}
		return false;
	},
	/**
	* Get the equivalent to string of this size
	* @override
	* @return {String}
	*/
	toString: function() {
		return '{ width: ' + this.width + ', height: ' + this.height + ' }';
	},
	/**
	 * Performs a comparison between two size.
	 * if this width is more than the other, it will returns 1 && if this height is less than the other, it will return -1. 0 for equality
	 * @override
	 * @param o
	 * @returns {kan.Size}
	 */
	compare: function(o) {
		if (o.inheritsof(kan.Size)) {
			var w = 0, h = 0;
			if (this.width > o.width) { w = 1; } else if (this.width < o.width) { w = -1; }
			if (this.height > o.height) { h = 1; } else if (this.height < o.height) { h = -1; }
			return new kan.Size({
				width: w,
				height: h
			});
		}
	},
	/**
	 * Clone this instance of kan.Size
	 * @override
	 * @returns {kan.Size}
	 */
	clone: function() {
		return new kan.Size({
			width: this.width,
			height: this.height
		});
	}
};

kan.extend(kan.Size, kan.Object);
