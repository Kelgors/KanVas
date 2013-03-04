/**
 * Define a dimension
 * @param settings
 * @param settings.width
 * @param settings.height
 * @type ec.Size
 * @returns {ec.Size}
 */
ec.Size = function(settings) {
	if (settings) {
		ec.Object.call(this, settings);
	}
};

ec.Size.prototype = {
	info: {
		type: 'ec.Size',
		getType: function() {
			return ec.Size;
		}
	},
	width: 0,
	height: 0,
	/**
	 * Check the equality with ec.Size or a scalar variable
	 * @param {ec.Size|Number} o
	 * @returns {Boolean}
	 */
	equals: function(o){
		if (o instanceof ec.Size) {
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