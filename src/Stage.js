ec.Stage = function(settings) {
	ec.Object.call(this, settings);
	this.timer = new ec.Timer();
	this.layers = new Array();
};

ec.Stage.prototype = {
	info: {
		type: 'Stage',
		getType: function() {
			return ec.Stage;
		}
	},
	timer: null,
	layers: null,
	update: function() {
		for ( var i in this.layers ) {
			this.layers[i].update(this);
		}
	},
	draw: function() {
		for ( var i in this.layers ) {
			this.layers[i].draw(this);
		}
	},
	stop: function() {
		this.isRunning = false;
		clearTimeout();
		clearInterval();
	},
	run: function() {
		this.isRunning = true;
		ec.Timer.step();
		this.timer.reset();
		this._loop();
	},
	_loop: function() {
		if (this.isRunning) {
			ec.Timer.step();
			this.update();
			ec.Timer.step();
			this.draw();
			window.requestAnimFrame(this._loop.bind(this));
		}
	},
	add: function(o) {
		this.layers.push(o);
	},
	/**
	* Check the equality of this to another ec.Stage
	* @override
	* @param {?} o
	* @return {Boolean}
	*/
	equals: function(o) {
		if (!o.inheritsof) { return false; }
		return this.ID === o.ID && o.inheritsof(ec.Stage);
	}
};
ec.extend(ec.Stage, ec.Object);
