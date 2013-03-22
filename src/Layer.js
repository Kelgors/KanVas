/**
 * This class represents a Layer that drawing multiple Shapes
 * @param {Object} settings
 * @param {String} settings.canvas
 * @param {Number} settings.width
 * @param {Number} settings.height
 * @constructor
 * @extends {ec.Object}
 */
ec.Layer = function(settings) {
	this.info.supportedEvents = new Object();
	this.lastMouse = {
		rel: new ec.Point(),
		abs: new ec.Point()
	};
	this.offset = new ec.Point();
	this.components = new ec.List();
	this.graphics = new ec.Graphics();
	if ( settings.canvas ) {
		/** @define {HTMLCanvasElement} */
		this.canvas = document.getElementById(settings.canvas);
		this.canvas.width = settings.width;
		this.canvas.height = settings.height;
		/** @define {CanvasRenderingContext2D} */
		this.context = this.canvas.getContext('2d');
		delete settings.canvas;
	}
	ec.Object.call(this, settings);
};

ec.Layer.prototype = {
	info: {
		type: 'Layer',
		getType: function() {
			return ec.Layer;
		},
		supportedEvents: null
	},
	/**
	* The canvas html Element
	* @type {HTMLCanvasElement}
	*/
	canvas: null,
	/**
	* The rendering context
	* @type {CanvasRenderingContext2D}
	*/
	context: null,
	/**
	* The width of the canvas
	* @type {Number}
	*/
	width: 0,
	/**
	* The height of the canvas
	* @type {Number}
	*/
	height: 0,
	/**
	* The current offset of the context
	* It is always necessary with the ec.Graphics Object ?
	*/
	offset: null,
	/**
	* Graphics referential Object
	* @type {ec.Graphics}
	*/
	graphics: null,
	/**
	* Array of all components
	* @type {Array}
	*/
	components: null,
	/**
	* Last position of the mouse since the last event
	* @type {Object}
	*/
	lastMouse: {
	    /**
	    * Last relative position of the mouse since the last MouseEvent
	    * @type {ec.Point}
	    */
		rel: null,
	    /**
	    * Last absolute position of the mouse since the last MouseEvent
	    * No scrolling page
	    * @type {ec.Point}
	    */
		abs: null
	},
	/**
	* Add a drawable component, configure events before add
	* @param {ec.Object} the component to add
	*/
	add: function(component) {
		this.components.add(component);
		for (var i in component.events) 
		{
			/* If the event does not exists */
			if (!this.info.supportedEvents[i]) {
				var addEventFunc = this.canvas.addEventListener ? 'addEventListener' : 'attachEvent';
				this.canvas[addEventFunc](i, (function(e) {
					if (e.type == 'mouseup' || e.type == 'mousedown' || e.type == 'click' || e.type == 'mousemove') {
						this.lastMouse.rel = e.mousePosition = ec.Mouse.getPosition(e);
						this.lastMouse.abs = e.mouseAbsPosition = ec.Mouse.getAbsolutePosition(e);
					}
					for (var i = this.components.items.length-1; i > -1; i--) {
						/* for each components, spread the event */
						if (!this.components.items[i].events.execute(e)) {
							if (e.preventDefault) { e.preventDefault(); }
							return false;
						}
					}
				}).bind(this), false);
				this.info.supportedEvents[i] = true;
				if (!this.mouseUpCorrection) {
					document.addEventListener('mouseup', (function(e) {
						var target = null;
						if (e.originalTarget) { target = e.originalTarget; }
						else if (e.toElement) { target = e.toElement; }
						else if (e.target) { target = e.target; }
						if (target != this.canvas) {
							for(var i in this.components) {
								this.components[i].events.reset();
							}
						}
					}).bind(this), false);
					this.mouseUpCorrection = true;
				}
			}
		}
	},
	/**
	* update all components which are updatable
	* @param {ec.Stage}
	*/
	update: function(stage) {
		var data = {
			context: this.context,
			timer: stage.timer.delta(),
			mouse: this.lastMouse
		};
		/* Update each components in the list */
		this.components.each(function() {
			this.update(data);
		});
		/* Resort the list */
		this.components.sort(function(c1, c2) {
			return c1.zIndex > c2.zIndex ? 1 : c1.zIndex < c2.zIndex ? -1 : 0;
		});
	},
	/**
	* Draw all components which are drawable
	* @param {ec.Stage}
	*/
	draw: function(stage) {
	    /* Clear the canvas */
		this.context.clearRect(0, 0, this.width, this.height);
		/* Change scale, translation, rotation, ... */
		this.graphics.beforedraw(this.context);
		var data = {
			context: this.context,
			timer: stage.timer.delta(),
			mouse: this.lastMouse
		};
		/* Draw each components */
		this.components.each(function() {
			this.draw(data);
		});
		this.graphics.afterdraw(this.context);
	},
	/**
	* Check if a Layer equals to another ec.Object (which is a Layer)
	* @param {ec.Object}
	* @override
	* @return {Boolean}
	*/
	equals: function(o) {
		if (!o.inheritsof) { return false; }
		return this.ID === o.ID && o.inheritsof(ec.Layer);
	}
};

ec.extend(ec.Layer, ec.Object);
