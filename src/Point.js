/**
 * Point object as a simple point
 * @param settings		{Object}
 * @param settings.x	{Number}	X Component
 * @param settings.y	{Number}	Y Component
 * @constructor
 * @extends {kan.Object}
 */
kan.Point = function(settings) {
	this.x = 0;
	this.y = 0;
	if(settings) {
		kan.Object.call(this, settings);
	}
};
kan.Point.prototype = {
	info:{
		type: 'Point',
		getType: function() {
			return kan.Point;
		}
	},
	/** @type {number} */
	x: 0,
	/** @type {number} */
	y: 0,
	/**
	 * Check if X-Y component are equals to this instance
	 * @override
	 * @param {kan.Point}
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
	 * @param {kan.Point} o
	 * @return	{kan.Point}
	 */
	compare: function(o) {
		if ( o.x != null && o.y != null ) {
			var x = 0, y = 0;
			if (this.x > o.x) { x = 1; } else if (this.x < o.x) { x = -1; }
			if (this.y > o.y) { y = 1; } else if (this.y < o.y) { y = -1; }
			return new kan.Point({
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
	 * @return {kan.Vector2}
	 */
	toVector2: function() {
		return new kan.Vector2({
			x: this.x,
			y: this.y
		});
	}
};
kan.extend(kan.Point, kan.Object);