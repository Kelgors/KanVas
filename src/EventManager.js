/**
* An event manager
* @constructor
* @type {ec.EventManager}
* @return {ec.EventManager}
*/
ec.EventManager = function() {
	this.state = {
		clicked: false,
		pressed: false,
		dragging: false
	};
};

ec.EventManager.prototype = {
	state: null,
	execute: function(e) {
		var dontStop = true;
		if (this[e.type]) {
			for (var i in this[e.type]) {
				if (typeof(this[e.type][i]) == 'function') {
					if (this[e.type][i](e) == false) {
						dontStop = false;
					}
				}
			}
		}
		return dontStop;
	},
	reset: function() {
		for(var i in this.state) {
			if (typeof(this.state[i]) == 'boolean') {
				this.state[i] = false;
			}
		}
	},
	click: null,
	mouseup: null,
	mousedown: null
	/* etc... */
};