kan.Stage = function(settings) {
	kan.Object.call(this, settings);
	this.timer = new kan.Timer();
	this.layers = new Array();
};

kan.Stage.prototype = {
	info: {
		type: 'Stage',
		getType: function() {
			return kan.Stage;
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
		kan.Timer.step();
		this.timer.reset();
		this._loop();
	},
	_loop: function() {
		if (this.isRunning) {
			kan.Timer.step();
			this.update();
			kan.Timer.step();
			this.draw();
			window.requestAnimFrame(this._loop.bind(this));
		}
	},
	add: function(o) {
		this.layers.push(o);
	},
	/**
	* Check the equality of this to another kan.Stage
	* @override
	* @param {?} o
	* @return {Boolean}
	*/
	equals: function(o) {
		if (!o.inheritsof) { return false; }
		return this.ID === o.ID && o.inheritsof(kan.Stage);
	}
};
kan.extend(kan.Stage, kan.Object);
