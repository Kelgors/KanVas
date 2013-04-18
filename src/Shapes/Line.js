/**
 * Line instance - can contains several points
 * @constructor
 * @extends {kan.Shape}
 * @param {Object} settings
 * @param {Array|kan.List} points that define the line
 */
kan.Line = function(settings) {
	this.graphics = new kan.Graphics();
	this.points = new kan.List(settings.points);
	delete settings.points;
	kan.Shape.call(this, settings);
};

kan.Line.prototype = {
	info: {
		type: 'Line',
		getType: function() {
			return kan.Line;
		}
	},
	/**
	* Color of the line
	* @type {kan.Color}
	*/
	stroke: null,
	/**
	* All points that defined the line
	* @type {kan.List<kan.Point>}
	*/
	points: null,
	/**
	* Define the width of the line
	* @type {Number}
	*/
	width: 1,
	/** 
	* Defines the referential
	* @type {kan.Graphics} 
	*/
	graphics: null,
	/**
	* Update some values
	* @type {Function}
	*/
	update: function() {},
	/**
	* Draw the Line with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {kan.Point} data.lastMouse.rel
	* @param {kan.Point} data.lastMouse.abs
	*/
	draw: function(data) {
		if (this.stroke && !this.points.empty()) {
			var ctx = data.context;
			this.graphics.beforedraw(ctx);
			ctx.strokeStyle = this.stroke.inheritsof && this.stroke.inheritsof(kan.Color) ? this.stroke.toRGBA() : this.stroke;
			ctx.lineWidth = this.width;
			ctx.beginPath();
			ctx.moveTo(this.points.get(0).x, this.points.get(0).y);
			this.points.each(function() {
				ctx.lineTo(this.x, this.y);
			});
			ctx.stroke();

			this.graphics.afterdraw(ctx);
		}
	},
	/**
	* Check if a line is equals to another line
	* @override
	* @param {kan.Line} another line
	* @return {Boolean}
	*/
	equals: function(o) {
		if (o.inheritsof && o.inheritsof(kan.Line)) {
			return this.points.equals(o.points);
		}
		return false;
	},
	clone: function() {
		return new kan.Line({
			points: this.points.clone()
		})
	}
};
kan.extend(kan.Line, kan.Shape);