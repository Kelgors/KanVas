/**
 * Vector object with two components
 * @param settings		{Object}
 * @param settings.x	{Number}	X Component
 * @param settings.y	{Number}	Y Component
 * @constructor
 * @extends {ec.Point}
 * @type {ec.Vector2}
 * @returns {ec.Vector2}
 */
ec.Vector2 = function(settings) {
	ec.Point.call(this, settings);
};

ec.Vector2.prototype = {
	info: {
		type: 'ec.Vector2',
		getType: function() {
			return ec.Vector2;
		}
	},
	/**
	 * Add to each value of this instance o
	 * @param o {Number|ec.Point} Numeric value|Other Point
	 * @returns {ec.Vector2} this instance
	 */
	adds: function(value){
		if ( typeof(value) == 'number' ) {
			this.x += value;
			this.y += value;
		} else if (value.info && value.inheritsof(ec.Point)){
			this.x += value.x;
			this.y += value.y;
		}
		return this;
	},
	/**
	 * Substract to each value of this instance o
	 * @param {Number|ec.Point} Numeric value|Other Point
	 * @returns {ec.Vector2} this instance
	 */
	substracts: function(value){
		if ( typeof(value) == 'number' ) {
			this.x -= value;
			this.y -= value;
		} else if (value.info && value.inheritsof(ec.Point)){
			this.x -= value.x;
			this.y -= value.y;
		}
		return this;
	},
	/**
	 * Multiply each component of this instance by value
	 * @param value {Number|ec.Point} Scalar value|Other Point
	 * @returns {ec.Vector2} this instance
	 */
	multiplies: function(value){ 
		if ( typeof(value) == 'number' ) {
			this.x *= value;
			this.y *= value;
		} else if ( value.info && value.inheritsof(ec.Point) ) {
			this.x *= value.x;
			this.y *= value.y;
		}
		return this;
	},
	/**
	 * Divide each component of this instance by value
	 * @param value {Number|ec.Point} Scalar value|Other Point
	 * @returns {ec.Vector2} this instance
	 */
	divides: function(value){
		if ( typeof(value) == 'number' ) {
			this.x /= value;
			this.y /= value;
		}
		else if ( value.info && value.inheritsof(ec.Point) ) {
			this.x /= value.x;
			this.y /= value.y;
		}
		return this;
	},
	/**
	 * Get distance between this and another Vector2 instance
	 * @param o {ec.Point}
	 * @returns	{Number|NaN}
	 */
	distance: function(o) {
		if ( o.inheritsof(ec.Point) ) {
			return Math.sqrt(Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2));
		}
		return NaN;
	},
	/**
	 * Get distance squared between this and another Vector2 instance
	 * @param o {ec.Vector2}
	 * @returns	{Number|NaN}
	 */
	distanceSquared: function(o) {
		if ( o.inheritsof(ec.Point) ) {
			return Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2);
		}
		
		return NaN;
	},
	/**
	 * Performs a comparison between two Vector2
	 * @override
	 * @param {ec.Point} o
	 * @type {ec.Point}
	 * @returns	{ec.Point}
	 */
	compare: function(o) {
		if (o.inheritsof(ec.Point)) {
			var x = 0, y = 0;
			if (this.x > o.x) { x=1; } else if (this.x < o.x) { x=-1; }
			if (this.y > o.y) { y=1; } else if(this.y < o.y) { y=-1; }
			return new ec.Vector2({
				x: x,
				y: y
			});
		}
	},
	/**
	 * Clone this instance of Vector2
	 * @override
	 * @type {ec.Vector2}
	 * @returns {ec.Vector2}
	 */
	clone: function() {
		return new ec.Vector2({
			x: this.x,
			y: this.y
		});
	}
};
ec.extend(ec.Vector2, ec.Point);
/**
 * Perform an addition with two Vector2
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type ec.Vector2
 * @returns {ec.Vector2}
 */
ec.Vector2.add = function(v1 , v2){
	return new ec.Vector2({ x: v1.x + v2.x, y: v1.y + v2.y});
};
/**
 * Perform an substraction with two Vector2
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type ec.Vector2
 * @returns {ec.Vector2}
 */
ec.Vector2.substract = function(v1 , v2){
	return new ec.Vector2({ x: v1.x - v2.x, y: v1.y - v2.y});
};
/**
 * Perform an multiplication with two Vector2
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type ec.Vector2
 * @returns {ec.Vector2}
 */
ec.Vector2.multiply = function(v1 , v2){
	return new ec.Vector2({ x: v1.x * v2.x, y: v1.y * v2.y});
};
/**
 * Perform an division with two Vector2
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type ec.Vector2
 * @returns {ec.Vector2}
 */
ec.Vector2.divide = function(v1 , v2){
	return new ec.Vector2({ x: v1.x / v2.x, y: v1.y / v2.y});
};
/**
 * Get the distance between two points
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type Number
 * @returns {Number|NaN}
 */
ec.Vector2.distance = function(v1 , v2){
	if ( v1.inheritsof(ec.Point) && v2.inheritsof(ec.Point) ) {
		return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
	}
	return NaN;
};
/**
 * Get the distance squared between two points
 * @param v1 {ec.Point|ec.Vector2} Other Point|Vector2
 * @param v2 {ec.Point|ec.Vector2} Other Point|Vector2
 * @type Number
 * @returns {Number}
 */
ec.Vector2.distanceSquared = function(v1, v2) {
	var v = v1.clone();
	return v.distanceSquared(v2);
};
/**
 * Get a Vector2 instance x=1 && y=1
 * @type ec.Vector2
 * @returns {ec.Vector2}
 */
ec.Vector2.One = function() {
	return new Vector2({ x: 1, y: 1});
};