/**
 * Vector object with two components
 * @param settings		{Object}
 * @param settings.x	{Number}	X Component
 * @param settings.y	{Number}	Y Component
 * @constructor
 * @extends {kan.Point}
 */
kan.Vector2 = function(settings) {
	kan.Point.call(this, settings);
};

kan.Vector2.prototype = {
	info: {
		type: 'Vector2',
		getType: function() {
			return kan.Vector2;
		}
	},
	/**
	 * Add to each value of this instance o
	 * @param o {Number|kan.Point} Numeric value|Other Point
	 * @return {kan.Vector2} this instance
	 */
	adds: function(value, value2){
    if (value2 && value) {
      this.x += value;
			this.y += value2;
    } else if ( typeof(value) == 'number' ) {
			this.x += value;
			this.y += value;
		} else if ( value.x != null && value.y != null ) {
			this.x += value.x;
			this.y += value.y;
		}
		return this;
	},
	/**
	 * Substract to each value of this instance o
	 * @param {Number|kan.Point} Numeric value|Other Point
	 * @return {kan.Vector2} this instance
	 */
	substracts: function(value){
		if (value2 && value) {
      this.x -= value;
			this.y -= value2;
    } else if ( typeof(value) == 'number' ) {
			this.x -= value;
			this.y -= value;
		} else if ( value.x != null && value.y != null ) {
			this.x -= value.x;
			this.y -= value.y;
		}
		return this;
	},
	/**
	 * Multiply each component of this instance by value
	 * @param value {Number|kan.Point} Scalar value|Other Point
	 * @return {kan.Vector2} this instance
	 */
	multiplies: function(value){ 
		if (value2 && value) {
      this.x *= value;
			this.y *= value2;
    } else if ( typeof(value) == 'number' ) {
			this.x *= value;
			this.y *= value;
		} else if ( value.x != null && value.y != null ) {
			this.x *= value.x;
			this.y *= value.y;
		}
		return this;
	},
	/**
	 * Divide each component of this instance by value
	 * @param value {Number|kan.Point} Scalar value|Other Point
	 * @return {kan.Vector2} this instance
	 */
	divides: function(value){
		if (value2 && value) {
      this.x /= value;
			this.y /= value2;
    } else if ( typeof(value) == 'number' ) {
			this.x /= value;
			this.y /= value;
		} else if ( value.x != null && value.y != null ) {
			this.x /= value.x;
			this.y /= value.y;
		}
		return this;
	},
	/**
	 * Get distance between this and another Vector2 instance
	 * @param o {kan.Point}
	 * @return	{Number|NaN}
	 */
	distance: function(o) {
		if ( o.x != null && o.y != null ) {
			return Math.sqrt(Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2));
		}
		return NaN;
	},
	/**
	 * Get distance squared between this and another Vector2 instance
	 * @param o {kan.Vector2}
	 * @return {Number|NaN}
	 */
	distanceSquared: function(o) {
		if ( o.x != null && o.y != null ) {
			return Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2);
		}
		return NaN;
	},
	/**
	 * Performs a comparison between two Vector2
	 * @override
	 * @param {kan.Point} o
	 * @return	{kan.Point}
	 */
	compare: function(o) {
		if (o.inheritsof(kan.Point)) {
			var x = 0, y = 0;
			if (this.x > o.x) { x=1; } else if (this.x < o.x) { x=-1; }
			if (this.y > o.y) { y=1; } else if(this.y < o.y) { y=-1; }
			return new kan.Vector2({
				x: x,
				y: y
			});
		}
	}
};
kan.extend(kan.Vector2, kan.Point);
/**
 * Perform an addition with two Vector2
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {kan.Vector2}
 */
kan.Vector2.add = function(v1 , v2){
	return new kan.Vector2({ x: v1.x + v2.x, y: v1.y + v2.y});
};
/**
 * Perform an substraction with two Vector2
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {kan.Vector2}
 */
kan.Vector2.substract = function(v1 , v2){
	return new kan.Vector2({ x: v1.x - v2.x, y: v1.y - v2.y});
};
/**
 * Perform an multiplication with two Vector2
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {kan.Vector2}
 */
kan.Vector2.multiply = function(v1 , v2){
	return new kan.Vector2({ x: v1.x * v2.x, y: v1.y * v2.y});
};
/**
 * Perform an division with two Vector2
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {kan.Vector2}
 */
kan.Vector2.divide = function(v1 , v2){
	return new kan.Vector2({ x: v1.x / v2.x, y: v1.y / v2.y});
};
/**
 * Get the distance between two points
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {Number|NaN}
 */
kan.Vector2.distance = function(v1 , v2){
	if ( v1.x != null && v1.y != null && v2.x != null && v2.y != null ) {
		return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
	}
	return NaN;
};
/**
 * Get the distance squared between two points
 * @param v1 {kan.Point|kan.Vector2} Other Point|Vector2
 * @param v2 {kan.Point|kan.Vector2} Other Point|Vector2
 * @return {Number}
 */
kan.Vector2.distanceSquared = function(v1, v2) {
	return v1.clone().distanceSquared(v2);
};
/**
 * Get a Vector2 instance x=1 && y=1
 * @return {kan.Vector2}
 */
kan.Vector2.One = function() {
	return new Vector2({ x: 1, y: 1});
};