/**
 * Point object as a simple point
 * @param settings		{Object}
 * @param settings.x	{Number}	X Component
 * @param settings.y	{Number}	Y Component
 * @type ec.Point
 * @returns {ec.Point}
 */
ec.Point = function(settings) {
	if(settings) {
		ec.Object.call(this, settings);
	}
};
ec.Point.prototype = {
	info:{
		type: 'ec.Point',
		getType: function() {
			return ec.Point;
		}
	},
	x: 0,
	y: 0,
	/**
	 * Check if X-Y component are equals to this instance
	 * @param o	{ec.Point}
	 * @returns {Boolean}
	 */
	equals: function(o) {
		if (o.inheritsof(ec.Point)) {
			return this.x == o.x && this.y == o.y;
		}
		return false;
	},
	/**
	 * Performs a comparison between two points
	 * @param {ec.Point} o
	 * @type ec.Point
	 * @returns	ec.Point
	 */
	compare: function(o) {
		if (o.inheritsof(ec.Point)) {
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
	 * @type String
	 * @return {String}
	 */
	toString: function()
	{
		return '{ x: ' + this.x + ', y: ' + this.y + ' }'; 
	},
	/**
	 * Return this instance of Point as a Vector2
	 * @type ec.Vector2
	 * @returns {ec.Vector2}
	 */
	toVector2: function() {
		return new ec.Vector2({
			x: this.x,
			y: this.y
		});
	},
	/**
	 * Clone this instance of ec.Point
	 * @type ec.Point
	 * @returns {ec.Point}
	 */
	clone: function() {
		return new ec.Point({
			x: this.x,
			y: this.y
		});
	}
};
ec.extend(ec.Point, ec.Object);