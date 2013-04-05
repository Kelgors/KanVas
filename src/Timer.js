kan.Timer = function(seconds) {
	this.base = kan.Timer.time;
	this.last = kan.Timer.time;
	
	this.target = seconds || 0;
};
	
kan.Timer.prototype = {
	info: {
		type: 'Timer',
		getType: function() {
			return kan.Timer;
		}
	},
	last: 0,
	base: 0,
	target: 0,
	pausedAt: 0,
	
	set: function( seconds ) {
		this.target = seconds || 0;
		this.base = kan.Timer.time;
		this.pausedAt = 0;
	},
	
	
	reset: function() {
		this.base = kan.Timer.time;
		this.pausedAt = 0;
	},
	
	tick: function() {
		var delta = kan.Timer.time - this.last;
		this.last = kan.Timer.time;
		return (this.pausedAt ? 0 : delta);
	},
	
	
	delta: function() {
		return (this.pausedAt || kan.Timer.time) - this.base - this.target;
	},


	pause: function() {
		if( !this.pausedAt ) {
			this.pausedAt = kan.Timer.time;
		}
	},


	unpause: function() {
		if( this.pausedAt ) {
			this.base += kan.Timer.time - this.pausedAt;
			this.pausedAt = 0;
		}
	}
};

kan.Timer._last = 0;
kan.Timer.time = Number.MIN_VALUE;
kan.Timer.timeScale = 1;
kan.Timer.maxStep = 0.05;

kan.Timer.step = function() {
	var current = Date.now();
	var delta = (current - kan.Timer._last) / 1000;
	kan.Timer.time += Math.min(delta, kan.Timer.maxStep) * kan.Timer.timeScale;
	kan.Timer._last = current;
};

kan.extend(kan.Timer, kan.Object);