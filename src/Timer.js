ec.Timer = function(seconds) {
	this.base = ec.Timer.time;
	this.last = ec.Timer.time;
	
	this.target = seconds || 0;
};
	
ec.Timer.prototype = {
	info: {
		type: 'Timer',
		getType: function() {
			return ec.Timer;
		}
	},
	last: 0,
	base: 0,
	target: 0,
	pausedAt: 0,
	
	set: function( seconds ) {
		this.target = seconds || 0;
		this.base = ec.Timer.time;
		this.pausedAt = 0;
	},
	
	
	reset: function() {
		this.base = ec.Timer.time;
		this.pausedAt = 0;
	},
	
	tick: function() {
		var delta = ec.Timer.time - this.last;
		this.last = ec.Timer.time;
		return (this.pausedAt ? 0 : delta);
	},
	
	
	delta: function() {
		return (this.pausedAt || ec.Timer.time) - this.base - this.target;
	},


	pause: function() {
		if( !this.pausedAt ) {
			this.pausedAt = ec.Timer.time;
		}
	},


	unpause: function() {
		if( this.pausedAt ) {
			this.base += ec.Timer.time - this.pausedAt;
			this.pausedAt = 0;
		}
	}
};

ec.Timer._last = 0;
ec.Timer.time = Number.MIN_VALUE;
ec.Timer.timeScale = 1;
ec.Timer.maxStep = 0.05;

ec.Timer.step = function() {
	var current = Date.now();
	var delta = (current - ec.Timer._last) / 1000;
	ec.Timer.time += Math.min(delta, ec.Timer.maxStep) * ec.Timer.timeScale;
	ec.Timer._last = current;
};

ec.extend(ec.Timer, ec.Object);