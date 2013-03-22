/**
 * Point object as a simple point
 * @param settings		{Object}
 * @param settings.x	{Number}	X Component
 * @param settings.y	{Number}	Y Component
 * @constructor
 * @extends {ec.Object}
 */
ec.Point = function(settings) {
	this.x = this.y = 0;
	if(settings) {
		ec.Object.call(this, settings);
	}
};
ec.Point.prototype = {
	info:{
		type: 'Point',
		getType: function() {
			return ec.Point;
		}
	},
	/** @type {number} */
	x: 0,
	/** @type {number} */
	y: 0,
	/**
	 * Check if X-Y component are equals to this instance
	 * @override
	 * @param {ec.Point}
	 * @returns {Boolean}
	 */
	equals: function(o) {
		if ( o.x && o.y ) {
			return this.x == o.x && this.y == o.y;
		}
		return false;
	},
	/**
	 * Performs a comparison between two points
	 * @override
	 * @param {ec.Point} o
	 * @return	{ec.Point}
	 */
	compare: function(o) {
		if ( o.x != null && o.y != null ) {
			var x = 0, y = 0;
			if (this.x > o.x) { x = 1; } else if (this.x < o.x) { x = -1; }
			if (this.y > o.y) { y = 1; } else if (this.y < o.y) { y = -1; }
			return new ec.Point({
				x: x,
				y: y
			});
		}
		return null;
	},
	/**
	 * get the string representation of this object
	 * @override
	 * @return {String}
	 */
	toString: function() {
		return '{ x: ' + this.x + ', y: ' + this.y + ' }'; 
	},
	/**
	 * Return this instance of Point as a Vector2
	 * @return {ec.Vector2}
	 */
	toVector2: function() {
		return new ec.Vector2({
			x: this.x,
			y: this.y
		});
	}
};
ec.extend(ec.Point, ec.Object);