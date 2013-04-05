/**
* Define the referential of drawing
* @constructor
* @extends {kan.Object}
*/
kan.Graphics = function() {
	this.transform = new kan.Object({
		m11: 1,
		m12: 0,
		m21: 0,
		m22: 1,
		dx: 0,
		dy: 0
	});
	this.scale = new kan.Point({ x:1,y:1 });
	this.rotation = 0;
	this.defaults = {
		transform: this.transform.clone(),
		scale: this.scale.clone(),
		rotation: 0
	};
	kan.Object.call(this);
};

kan.Graphics.prototype = {
	info: {
		type: 'Graphics',
		getType: function() {
			return kan.Graphics;
		}
	},
	/**
	* Set the transformation
	* @type {kan.Object}
	*/
	transform: null,
	/**
	* Set the scale
	* @type {kan.Point}
	*/
	scale: null,
	/**
	* Contain the default referential
	* @type {Object}
	*/
	defaults: null,
	/**
	* Set the rotation
	* @type {Number}
	*/
	rotation: 0,
	/**
	* the before draw function (save)
	*/
	beforedraw: function(ctx) {
		if (this.rotation != this.defaults.rotation) {
			this._saveContext(ctx);
			ctx.rotate(this.rotation);
		}
		if (!this.scale.equals(this.defaults.scale)) {
			this._saveContext(ctx);
			ctx.scale(this.scale.x, this.scale.y);
		}
		if (!this.transform.equals(this.defaults.transform)) {
			this._saveContext(ctx);
			this.doTransform(ctx);
		}
	},
	/**
	* The afterdraw function (restore)
	*/
	afterdraw: function(ctx) {
		this._restoreContext(ctx);
	},
	/**
	* Performs the transformation to the context
	* @param {CanvasRenderingContext2D} ctx Context
	*/
	doTransform: function(ctx) {
		ctx.transform(
			this.transform.m11,
			this.transform.m12,
			this.transform.m21,
			this.transform.m22,
			this.transform.dx,
			this.transform.dy
		);
	},
	/**
	* Set the scale value
	* @param {Number|kan.Point}
	*/
	setScale: function(value) {
		if (typeof(value) == 'number') {
			this.scale.y = this.scale.x = value;
		} else if ( value.x != null && value.y != null ) {
			this.scale = value.clone ? value.clone() : kan._clone(value);
		}
	},
	_contextSaved: false,
	/**
	* Save the context (just once)
	* @param {CanvasRenderingContext2D} ctx Context
	* @return {Boolean} true: the context is saved; false: not saved
	*/
	_saveContext: function(ctx) {
		if (!this._contextSaved) {
			ctx.save();
			return (this._contextSaved = true);
		}
		return false;
	},
	/**
	* restore the context if the context was saved
	* @param {CanvasRenderingContext2D} ctx Context
	* @return {Boolean} true: the context is restored; false: not restored
	*/
	_restoreContext: function(ctx) {
		if (this._contextSaved) {
			ctx.restore();
			return !(this._contextSaved = false);
		}
		return false;
	}
};

kan.extend(kan.Graphics, kan.Object);