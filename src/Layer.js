/**
 * This class represents a Layer that drawing multiple Shapes
 * @param {Object} settings
 * @param {String} settings.canvas
 * @param {Number} settings.width
 * @param {Number} settings.height
 * @constructor
 * @extends {kan.Object}
 */
kan.Layer = function(settings) {
	this.info.supportedEvents = new Object();
	this.offset = new kan.Point();
	this.components = new kan.ShapeList();
	this.graphics = new kan.Graphics();
	if ( settings.canvas ) {
		/** @define {HTMLCanvasElement} */
		this.canvas = document.getElementById(settings.canvas);
		this.canvas.width = settings.width;
		this.canvas.height = settings.height;
		/** @define {CanvasRenderingContext2D} */
		this.context = this.canvas.getContext('2d');
		delete settings.canvas;
	}
	kan.Object.call(this, settings);
};

kan.Layer.prototype = {
	info: {
		type: 'Layer',
		getType: function() {
			return kan.Layer;
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
	* It is always necessary with the kan.Graphics Object ?
	*/
	offset: null,
	/**
	* Graphics referential Object
	* @type {kan.Graphics}
	*/
	graphics: null,
	/**
	* Array of all components
	* @type {Array}
	*/
	components: null,
	/**
	* Add this kan.Layer to an Array, Stage or something else with the add|push method
	* @param {kan.Stage|Array} this instance is adding to that
	* @return {kan.Layer} this instance
	*/
	addTo: function(stage) {
		if (stage instanceof Array) {
			stage.push(this);
		} else if (stage.add) {
			stage.add(this);
		}
		return this;
	},
	/**
	* Add a drawable component, configure events before add
	* @param {kan.Object} the component to add
	*/
	add: function(component) {
		component.info.layer = this;
		this.components.add(component);
		for (var i in component.events) 
		{
			/* If the event does not exists */
			if (!this.info.supportedEvents[i]) {
				var addEventFunc = this.canvas.addEventListener ? 'addEventListener' : 'attachEvent';
				this.canvas[addEventFunc](i, (function(e) {
					if (e instanceof MouseEvent) {
						kan.Mouse._update(e);
						e.mousePosition = kan.Mouse.position.rel;
						e.mouseAbsPosition = kan.Mouse.position.abs;
					}
					e.target = (function(event) {
						return event.originalTarget || event.toElement || event.target;
					})(e);
					for (var i = this.components.items.length-1; i > -1; i--) {
						/* for each components, spread the event from top to bottom */
						if (!this.components.items[i].events.execute(e)) {
							return false;
						}
					}
				}).bind(this), false);
				this.info.supportedEvents[i] = true;
				if (!this.mouseUpCorrection) {
					document.addEventListener('mouseup', (function(e) {
						e.target = (function(event) {
							return event.originalTarget || event.toElement || event.target;
						})(e);
						if (e.target != this.canvas) {
							this.components.each(function() {
								this.events.reset();
							});
						}
					}).bind(this), false);
					this.mouseUpCorrection = true;
				}
			}
		}
	},
	/**
	* update all components which are updatable
	* @param {kan.Stage}
	*/
	update: function(stage) {
		var data = {
			context: this.context,
			timer: stage.timer.delta(),
			mouse: this.lastMouse
		};
		/* Update each components (override the kan.DrawableComponentsList.each function to be a very little bit quicker) */
		for(var index = 0; index < this.components.items.length; index++) {
			this.components.items[index].update(data);
		}
		/* Resort the list */
		this.components.sort(function(c1, c2) {
			return c1.zIndex > c2.zIndex ? 1 : c1.zIndex < c2.zIndex ? -1 : 0;
		});
	},
	/**
	* Draw all components which are drawable
	* @param {kan.Stage}
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
		/* Draw each components (override the kan.DrawableComponentsList.each function to be a very little bit quicker) */
		for(var index = 0; index < this.components.items.length; index++) {
			this.components.items[index].draw(data);
		}
		this.graphics.afterdraw(this.context);
	},
	/**
	* Check if a Layer equals to another kan.Object (which is a Layer)
	* @param {kan.Object}
	* @override
	* @return {Boolean}
	*/
	equals: function(o) {
		if (!o.inheritsof) { return false; }
		return this.ID === o.ID && o.inheritsof(kan.Layer);
	}
};

kan.extend(kan.Layer, kan.Object);
