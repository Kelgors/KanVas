
/**
 * Create a instance of kan.Circle
 * @param {Object} settings
 * @param {kan.Point} settings.position	Representation of the position of this instance	(Unnecessary if X && Y are given)
 * @param {Number} settings.x			X component of the position	(Unnecessary if position is given)
 * @param {Number} settings.y			Y component of the position (Unnecessary if position is given)
 * @param {Number} settings.radius		Radius of this circle
 * @param {Number} settings.amplitude	Necessary for floating effect
 * @param {Number} settings.speed		Necessary for floating effect
 * @constructor
 * @extends {kan.Shape} 
 * @type {kan.Circle}
 * @returns {kan.Circle}
 */
kan.Circle = function(settings) {
	kan.Shape.call(this, settings);
};

kan.Circle.prototype = {
	info: {
		type: 'Circle',
		getType: function() {
			return kan.Circle;
		}
	},
	currentPosition: null,
	/**
	* The radius of the Circle
	* @type {Number}
	*/
	radius: 0,
	/**
	* Draw the circle with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {kan.Point} data.lastMouse.rel
	* @param {kan.Point} data.lastMouse.abs
	*/
	draw: function(data) {
		/** @define {CanvasRenderingContext2D} */
		var ctx = data.context;
		this.graphics.beforedraw(ctx);
		if (this.radius > 0 && this.fill || this.stroke && this.radius > 0) {
			ctx.beginPath();
			ctx.arc( this.currentPosition.x, this.currentPosition.y, this.radius, 0, Math.PI * 2 );
			if ( this.fill ) {
				ctx.fillStyle = this.fill instanceof kan.Color ? this.fill.toRGBA() : this.fill;
				ctx.fill();
			}
			if ( this.stroke ) {
				ctx.strokeStyle = this.stroke instanceof kan.Color ? this.stroke.toRGBA() : this.stroke;
				ctx.lineWidth = this.lineWidth;
				ctx.stroke();
			}
		}
		this.graphics.afterdraw(ctx);
	},
	/**
	 * Check if this instance containing another
	 * @param {kan.Point|kan.Circle} c
	 * @return {Boolean}
	 */
	contains: function( c ) {
		/** @returns {Number} */
		var d = 0,
		tp = this.currentPosition ? this.currentPosition : this.position;
		if ( c.inheritsof(kan.Point) ) {
			d = kan.Vector2.distance(tp, c);
			if (this.isClicked) { this.isClicked = false; }
            return (d < this.radius);
		} else if (c.inheritsof(kan.Circle)) {
			d = kan.Vector2.distance(tp, c.position);
			return d < ( this.radius + c.radius );
		}
		return false;
	},
	/**
	 * Check if this instance of circle is equal to another
	 * @override
	 * @param {kan.Circle} o other instance of circle
	 * @return {Boolean}
	 */
	equals: function(o) {
		if (o.inheritsof(kan.Circle)) {
			return o.position.x == this.position.x && o.position.y == this.position.y
				&& this.radius == o.radius;
		}
		return false;
	},
	/**
	 * Performs a comparison between two circles
	 * @param {kan.Circle} o
	 * @return {kan.Circle|Boolean}
	 */
	compare: function(o) {
		if (o.inheritsof(kan.Shape)) {
			var r = 0;
			if (this.radius > o.radius) { r = 1; } else if (this.radius < o.radius) { r = -1; }
			return new kan.Circle({
				position: this.position.compare(o.position),
				currentPosition: this.currentPosition.compare(o.currentPosition),
				radius: r
			});
		}
		return false;
	},
	/**
	* Clone this instance of circle
	* @override
	* @return {kan.Circle}
	*/
	clone: function() {
		var fill = this.fill instanceof kan.Color ? this.fill.clone() : this.fill;
		var stroke = this.stroke instanceof kan.Color ? this.stroke.clone() : this.stroke;
		return new kan.Circle({
			position: this.position.clone(),
			radius: this.radius,
			fill: fill,
			stroke: stroke,
			lineWidth: this.lineWidth,
			amplitude: this.float.amplitude,
			speed: this.float.speed,
			clickable: this.clickable,
			draggable: this.draggable
		});
	}
};

kan.extend(kan.Circle, kan.Shape);
