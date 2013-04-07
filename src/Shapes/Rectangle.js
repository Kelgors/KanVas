/**
 * Create a rectangle
 * @param settings
 * @param {kan.Point} settings.position	Representation of the position of this instance	(Unnecessary if X && Y are given)
 * @param {Number} settings.x			X component of the position	(Unnecessary if position is given)
 * @param {Number} settings.y			Y component of the position (Unnecessary if position is given)
 * @param {kan.Size} settings.size		Representation of the dimension of the rectangle	(Unnecessary if Width && Height are given)
 * @param {Number} settings.width		Width of this rectangle		(Unnecessary if Size is given)
 * @param {Number} settings.height		Height of this rectangle	(Unnecessary if Size is given)
 * @param {Number} settings.amplitude	Necessary for floating effect
 * @param {Number} settings.speed		Necessary for floating effect
 * @constructor
 * @extends {kan.Shape}
 */
kan.Rectangle = function(settings) {
	this.size = new kan.Size();
	if (settings.borderRadius && typeof(settings.borderRadius) == 'number') {
		this.borderRadius = {
			topLeft: settings.borderRadius,
			topRight: settings.borderRadius,
			bottomLeft: settings.borderRadius,
			bottomRight: settings.borderRadius
		};
		delete settings.borderRadius;
	}
	kan.Shape.call(this, settings);
};

kan.Rectangle.prototype = {
	info: {
		type: 'Rectangle',
		getType: function() {
			return kan.Rectangle;
		}
	},
	size: null,
	currentPosition: null,
	getOrigin: function() {
		return new kan.Vector2({
			x: this.position.x + this.size.width/2,
			y: this.position.y + this.size.height/2
		});
	},
	borderRadius: null,
	/**
	* Draw the Rectangle with data.context
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
		if (this.fill || this.stroke) {
			/* set Attributes */
			if (this.fill) { ctx.fillStyle = this.fill instanceof kan.Color ? this.fill.toRGBA() : this.fill; }
			if (this.stroke) { ctx.strokeStyle = this.stroke instanceof kan.Color ? this.stroke.toRGBA() : this.stroke; }
			ctx.lineWidth = this.lineWidth;
			/* draw Path */
			this.isRounded ? this._setRoundedRectPath(ctx) : this._setRectPath(ctx);
			/* fill & stroke */
			if (this.fill) { ctx.fill(); }
			if (this.stroke) { ctx.stroke(); }
		
		}
		this.graphics.afterdraw(ctx);
	},
	/**
	*  Check if another >Rectangle or >Point is containing by this instance
	* @param {kan.Point|kan.Rectangle}
	* @return {Boolean}
	*/
	contains: function(o) {
		var tp = this.currentPosition ? this.currentPosition : this.position;
		if (o.inheritsof(kan.Point)) {
			return (o.x > tp.x
				 && o.x < tp.x + this.size.width
			     && o.y > tp.y
			     && o.y < tp.y + this.size.height);
		} else if (o.inheritsof(kan.Rectangle)) {
			var p = o.currentPosition ? o.currentPosition : o.position;
			return (p.x > tp.x
					&& p.y > tp.y
					&& p.x + o.size.width <= tp.x + this.size.width
					&& p.y + o.size.height <= tp.y + this.size.height);
		}
		return false;
	},
	/**
	* Check if this instance of kan.Rectangle is equals to another
	* @override
	* @param {kan.Shape|Number} o
	* @return {Boolean}
	*/
	equals: function(o) {
		if (o.inhertitsof && o.inheritsof(kan.Rectangle)) {
			return o.position.x == this.position.x && o.position.y == this.position.y
				&& o.size.width == this.size.width && o.size.height == this.size.height;
		} else if (typeof(o) == 'number') {
			return this.position.x == o && this.position.y == o
				&& this.size.width == o && this.size.height == o;
		}
		return false;
	},
	/**
	 * Performs a comparison between two rectangles
	 * @override
	 * @param {kan.Rectangle} o
	 * @return {kan.Rectangle}
	 */
	compare: function(o) {
		if (!o.inheritsof(kan.Rectangle)) { return null; }
		var x=0, y=0, w=0, h=0;
		if (this.position.x > o.position.x) { x = 1; } else if (this.position.x < o.position.x) { x = -1; }
		if (this.position.y > o.position.y) { y = 1; } else if (this.position.y < o.position.y) { y = -1; }
		if (this.size.width > o.size.width) { w = 1; } else if (this.size.width < o.size.width) { w = -1; }
		if (this.size.height > o.size.height) { h = 1; } else if (this.size.height < o.size.height) { h = -1; }
		return new kan.Rectangle({
			position: new kan.Point({
				x: x,
				y: y
			}),
			size: new kan.Size({
				width: w,
				height: h
			})
		});
	},
	/**
	 * Clone this instance
	 * @override
	 * @return {kan.Rectangle}
	 */
	clone: function() {
		var fill = this.fill instanceof kan.Color ? this.fill.clone() : this.fill;
		var stroke = this.stroke instanceof kan.Color ? this.stroke.clone() : this.stroke;
		return new kan.Rectangle({
			position: this.position.clone(),
			size: this.size.clone(),
			fill: fill,
			stroke: stroke,
			amplitude: this.floating.amplitude,
			speed: this.floating.speed,
			clickable: this.clickable,
			draggable: this.draggable
		});
	},
	getPoint: function(tob, lor) {
		if (tob == 'top') {
			return lor == 'left'
				? this.position
				: new kan.Point({ x: this.position.x + this.size.width, y: this.position.y });
		} else {
			return lor == 'left'
				? new kan.Point({ x: this.position.x, y: this.position.y + this.size.height })
				: new kan.Point({ x: this.position.x + this.size.width, y: this.position.y + this.size.height });
		}
		return null;
	},
	_setRoundedRectPath: function(context) {
		var topRightPositionX = this.getPoint('top', 'right').x, 
		bottomLeftPositionY = this.getPoint('bottom', 'left').y,
		radius = this.borderRadius;
		
		context.beginPath();
		context.moveTo(this.position.x + radius.topLeft, this.position.y);
		context.lineTo(topRightPositionX - radius.topRight, this.position.y);
		context.quadraticCurveTo(topRightPositionX, this.position.y, topRightPositionX, this.position.y + radius.topRight);
		context.lineTo(topRightPositionX, bottomLeftPositionY - radius.bottomRight);
		context.quadraticCurveTo(topRightPositionX, bottomLeftPositionY, topRightPositionX - radius.bottomRight, bottomLeftPositionY);
		context.lineTo(this.position.x + radius.bottomRight, bottomLeftPositionY);
		context.quadraticCurveTo(this.position.x, bottomLeftPositionY, this.position.x, bottomLeftPositionY - radius.bottomLeft);
		context.lineTo(this.position.x, this.position.y + radius.topLeft);
		context.quadraticCurveTo(this.position.x, this.position.y, this.position.x + radius.topLeft, this.position.y);
	},
	isRounded: function() {
		return (this.borderRadius.topLeft == 0
			 && this.borderRadius.topRight == 0
			 && this.borderRadius.bottomLeft == 0
			 && this.borderRadius.bottomRight == 0);
	},
	_setRectPath: function(context) {
		context.beginPath();
		context.moveTo(this.position.x, this.position.y);
		context.LineTo(this.position.x + this.size.width, this.position.y);
		context.LineTo(this.position.x + this.size.width, this.position.y + this.size.height);
		context.LineTo(this.position.x, this.position.y + this.size.height);
		context.LineTo(this.position.x, this.position.y);
	}
};

kan.extend(kan.Rectangle, kan.Shape);
