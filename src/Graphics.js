ec.Graphics = function(settings) {
	this.transform = new ec.Object({
		m11: 1,
		m12: 0,
		m21: 0,
		m22: 1,
		dx: 0,
		dy: 0
	});
	this.scale = new ec.Point({ x:1,y:1 });
	this.rotation = 0;
	this.defaults = {
		transform: this.transform.clone(),
		scale: this.scale.clone(),
		rotation: 0
	};
	ec.Object.call(this, settings);
};

ec.Graphics.prototype = {
	info: {
		type: 'Graphics',
		getType: function() {
			return ec.Graphics;
		}
	},
	transform: null,
	scale: null,
	defaults: null,
	rotation: 0,
	beforedraw: function(ctx) {
		if (this.rotation != this.defaults.rotation) {
			this._saveContext();
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
	afterdraw: function(ctx) {
		this._restoreContext(ctx);
	},
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
	setScale: function(value) {
		if (typeof(value) == 'number') {
			this.scale.y = this.scale.x = value;
		} else if ( value.x != null && value.y != null ) {
			this.scale = value.clone();
		}
	},
	_contextSaved: false,
	_saveContext: function(ctx) {
		if (!this._contextSaved) {
			ctx.save();
			return (this._contextSaved = true);
		}
		return false;
	},
	_restoreContext: function(ctx) {
		if (this._contextSaved) {
			ctx.restore();
			return !(this._contextSaved = false);
		}
		return false;
	}
};

ec.extend(ec.Graphics, ec.Object);