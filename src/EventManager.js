/**
* An event manager
* @constructor
*/
kan.EventManager = function() {
	this.state = {
		clicked: false,
		pressed: false,
		dragging: false
	};
};

kan.EventManager.prototype = {
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
						break;
					}
				}
			}
		}
		if (!dontStop) {
			if (e.preventDefault) { e.preventDefault(); }
			if (e.stopImmediatePropagation) { e.stopImmediatePropagation(); }
			e.cancelBubble = true;
			e.returnValue = false;
			
			return false;
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

kan.EventManager.add = function(e, f, b) {
	return document.addEventListener ? document.addEventListener(e, f, b) : document.attachEvent(e, f, b);
};

kan.EventManager.remove = function(e, f, b) {
	return document.removeEventListener ? document.removeEventListener(e, f, b) : document.detachEvent(e, f, b);
};