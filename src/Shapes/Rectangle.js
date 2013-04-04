/**
 * Create a rectangle
 * @param settings
 * @param {ec.Point} settings.position	Representation of the position of this instance	(Unnecessary if X && Y are given)
 * @param {Number} settings.x			X component of the position	(Unnecessary if position is given)
 * @param {Number} settings.y			Y component of the position (Unnecessary if position is given)
 * @param {ec.Size} settings.size		Representation of the dimension of the rectangle	(Unnecessary if Width && Height are given)
 * @param {Number} settings.width		Width of this rectangle		(Unnecessary if Size is given)
 * @param {Number} settings.height		Height of this rectangle	(Unnecessary if Size is given)
 * @param {Number} settings.amplitude	Necessary for floating effect
 * @param {Number} settings.speed		Necessary for floating effect
 * @type ec.Rectangle
 * @returns {ec.Rectangle}
 */
ec.Rectangle = function(settings) {
	this.size = new ec.Size();
	ec.Shape.call(this, settings);
};

ec.Rectangle.prototype = {
	info: {
		type: 'Rectangle',
		getType: function() {
			return ec.Rectangle;
		}
	},
	size: null,
	currentPosition: null,
	getOrigin: function() {
		return new ec.Vector2({
			x: this.position.x + this.size.width/2,
			y: this.position.y + this.size.height/2
		});
	},
	/**
	* Draw the Rectangle with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {ec.Point} data.lastMouse.rel
	* @param {ec.Point} data.lastMouse.abs
	*/
	draw: function(data) {
    	/** @define {CanvasRenderingContext2D} */
		var ctx = data.context;
		this.graphics.beforedraw(ctx);
		if ( this.fill ) {
			ctx.fillStyle = this.fill instanceof ec.Color ? this.fill.toRGBA() : this.fill;
			ctx.fillRect( this.currentPosition.x, this.currentPosition.y, this.size.width, this.size.height );
		}
		if ( this.stroke ) {
			ctx.strokeStyle = this.stroke instanceof ec.Color ? this.stroke.toRGBA() : this.stroke;
			ctx.lineWidth = this.lineWidth;
			ctx.strokeRect( this.currentPosition.x, this.currentPosition.y, this.size.width, this.size.height );
		}
		this.graphics.afterdraw(ctx);
	},
	/**
	*  Check if another >Rectangle or >Point is containing by this instance
	* @param {ec.Point|ec.Rectangle}
	* @return {Boolean}
	*/
	contains: function(o) {
		var tp = this.currentPosition ? this.currentPosition : this.position;
		if (o.inheritsof(ec.Point)) {
			return (o.x > tp.x
				 && o.x < tp.x + this.size.width
			     && o.y > tp.y
			     && o.y < tp.y + this.size.height);
		} else if (o.inheritsof(ec.Rectangle)) {
			var p = o.currentPosition ? o.currentPosition : o.position;
			return (p.x > tp.x
					&& p.y > tp.y
					&& p.x + o.size.width <= tp.x + this.size.width
					&& p.y + o.size.height <= tp.y + this.size.height);
		}
		return false;
	},
	/**
	* Check if this instance of ec.Rectangle is equals to another
	* @override
	* @param {ec.Shape|Number} o
	* @return {Boolean}
	*/
	equals: function(o) {
		if (o.inhertitsof && o.inheritsof(ec.Rectangle)) {
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
	 * @param {ec.Rectangle} o
	 * @return {ec.Rectangle}
	 */
	compare: function(o) {
		if (!o.inheritsof(ec.Rectangle)) { return null; }
		var x=0, y=0, w=0, h=0;
		if (this.position.x > o.position.x) { x = 1; } else if (this.position.x < o.position.x) { x = -1; }
		if (this.position.y > o.position.y) { y = 1; } else if (this.position.y < o.position.y) { y = -1; }
		if (this.size.width > o.size.width) { w = 1; } else if (this.size.width < o.size.width) { w = -1; }
		if (this.size.height > o.size.height) { h = 1; } else if (this.size.height < o.size.height) { h = -1; }
		return new ec.Rectangle({
			position: new ec.Point({
				x: x,
				y: y
			}),
			size: new ec.Size({
				width: w,
				height: h
			})
		});
	},
	/**
	 * Clone this instance
	 * @override
	 * @return {ec.Rectangle}
	 */
	clone: function() {
		var fill = this.fill instanceof ec.Color ? this.fill.clone() : this.fill;
		var stroke = this.stroke instanceof ec.Color ? this.stroke.clone() : this.stroke;
		return new ec.Rectangle({
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
	get: function(tob, lor) {
		if (tob == 'top') {
			return lor == 'left'
				? this.position
				: new ec.Point({ x: this.position.x + this.size.width, y: this.position.y });
		} else {
			return lor == 'left'
				? new ec.Point({ x: this.position.x, y: this.position.y + this.size.height })
				: new ec.Point({ x: this.position.x + this.size.width, y: this.position.y + this.size.height });
		}
		return null;
	}
};

ec.extend(ec.Rectangle, ec.Shape);
