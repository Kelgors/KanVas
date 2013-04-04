ec.Line = function(settings) {
	this.graphics = new ec.Graphics();
	this.points = new ec.List(settings.points);
	delete settings.points;
	ec.Shape.call(this, settings);
};

ec.Line.prototype = {
	info: {
		type: 'Line',
		getType: function() {
			return ec.Line;
		}
	},
	/**
	* Color of the line
	* @type {ec.Color}
	*/
	stroke: null,
	/**
	* All points that defined the line
	* @type {List<ec.Point>}
	*/
	points: null,
	/** 
	* Defines the referential
	* @type {ec.Graphics} 
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
	* @param {ec.Point} data.lastMouse.rel
	* @param {ec.Point} data.lastMouse.abs
	*/
	draw: function(data) {
		if (this.stroke) {
			var ctx = data.context;
			this.graphics.beforedraw(ctx);
			ctx.strokeStyle = this.stroke.inhertitsof && this.stroke.inheritsof(ec.Color) ? this.stroke.toRGBA() : this.stroke;

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
	* @param {ec.Line} another line
	* @return {Boolean}
	*/
	equals: function(o) {
		return this.begin.equals(o.begin) && this.end.equals(o.end);
	}
};

ec.extend(ec.Line, ec.Shape);