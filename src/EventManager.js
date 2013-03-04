ec.EventManager = {
	init: function() {
		if (document.attachEvent) {
			this.type = ec.EventManager.TYPE.ATTACH;
		} else if (document.addEventListener){
			this.type = ec.EventManager.TYPE.ADDLISTEN;
		} else {
			ec.Errors.log('EM001');
		}
	},
	/**
	 * Type of browser event function
	 */
	type: '',
	/**
	 * Events container
	 */
	events: {},
	/**
	 * Events global variable
	 */
	app: {
		mouse: {
			pressed: false,
			clicked: false
		}
	},
	/**
	 * Add a new event handler
	 * @param {Object} obj
	 * @param {String} evt
	 * @param {Function} fn
	 */
	add: function(obj, evt, fn) {
		if (!this.events[evt]) {
			this.events[evt] = new Array();
			document[this.type.add](evt, this.handler, false);
		}
		this.events[evt].push( { o: obj, func: fn } );
		
	},
	/**
	 * Delete specified event for the specified object
	 * @param {Object} obj
	 * @param {String} evt
	 */
	remove: function(obj, evt) {
		for ( var i in this.events[evt] ) {
			if ( this.events[evt][i].o.equals(obj) ) {
				if (this.type === ec.EventManager.TYPE.ADDLISTEN) {
					document[this.type.rem](evt, this.events[evt][i].func, false);
				}
			}
		}
	},
	/**
	 * Main handler for events
	 * @param e
	 */
	handler: function(e) {
		e.mousePosition = ec.Mouse.getPosition(e);
		e.mouseAbsPosition = ec.Mouse.getAbsolutePosition(e);
		for ( var i in ec.EventManager.events[e.type] ){
			ec.EventManager.events[e.type][i].func(e);
		}
	},
	/**
	 * Delete all events
	 */
	purge: function() {
		throw new Error('Not Implemented Yet');
	},
	/**
	 * Reset all ec.EventManager.app variables
	 */
	reset: function() {
		for (var i in ec.EventManager.app) {
			if(typeof ec.EventManager.app[i] == 'boolean') {
				ec.EventManager.app[i] = false;
			}
		}
	}
};
ec.EventManager.TYPE = {
	ADDLISTEN: { add: 'addEventListener', rem: 'removeEventListener' },
	OLDIE: {add: 'attachEvent', rem: 'detachEvent' }
};
ec.EventManager.init();