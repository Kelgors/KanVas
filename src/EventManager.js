/**
* An event manager
* @constructor
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
	/**
	* Performs all functions link to an event
	* @param {Event}
	* @return {Boolean} true: continue to spread the event; false: stop the event
	*/
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
	/**
	* Reset states
	*/
	reset: function() {
		for(var i in this.state) {
			if (typeof(this.state[i]) == 'boolean') {
				this.state[i] = false;
			}
		}
	},
	/**
	* Container of all functions link to the 'click' event
	* @type {Array}
	*/
	click: null,
	/**
	* Container of all functions link to the 'mouseup' event
	* @type {Array}
	*/
	mouseup: null,
	/**
	* Container of all functions link to the 'mousedown' event
	* @type {Array}
	*/
	mousedown: null,
	/**
	* Container of all functions link to the 'mousemove' event
	* @type {Array}
	*/
	mousemove: null
	/* etc... */
};