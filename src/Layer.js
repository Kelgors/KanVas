/**
 * 
 * @param {Object} settings
 * @param {String} settings.canvas
 * @param {Number} settings.width
 * @param {Number} settings.height
 * @type ec.Layer
 * @returns {ec.Layer}
 */
ec.Layer = function(settings) {
	this.info.supportedEvents = new Object();
	this.lastMouse = {
		rel: new ec.Point(),
		abs: new ec.Point()
	};
	this.offset = new ec.Point();
	this.components = new Array();
	this.graphics = new ec.Graphics();
	if ( settings.canvas ) {
		/** @returns {HTMLCanvasElement} */
		this.canvas = document.getElementById(settings.canvas);
		this.canvas.width = settings.width;
		this.canvas.height = settings.height;
		/** @returns {CanvasRenderingContext2D} */
		this.context = this.canvas.getContext('2d');
		delete settings.canvas;
	}
	ec.Object.call(this, settings);
};

ec.Layer.prototype = {
	canvas: null,
	context: null,
	width: 0,
	height: 0,
	offset: null,
	graphics: null,
	info: {
		type: 'Layer',
		getType: function() {
			return ec.Layer;
		},
		supportedEvents: null
	},
	fixed: false,
	components: null,
	lastMouse: {
		rel: null,
		abs: null
	},
	add: function(component) {
		this.components.push(component);
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
					for (var i = this.components.length-1; i > -1; i--) {
						/* for each components, spread the event */
						if (!this.components[i].events.execute(e)) {
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
	update: function(stage) {
		for ( var i in this.components ) {
			if ( this.components[i].update ) {
				this.components[i].update({ context: this.context, timer: stage.timer.delta(), mouse: this.lastMouse });
			}
		}
	},
	draw: function(stage) {
		this.context.clearRect(0, 0, this.width, this.height);
		
		this.graphics.beforedraw(this.context);
		for ( var i = 0; i < this.components.length; i++ ) {
			if ( this.components[i].draw ) {
				this.components[i].draw({ context: this.context, timer: stage.timer.delta(), mouse: this.lastMouse });
			}
		}
		this.graphics.afterdraw(this.context);
	},
	equals: function() {
		if (!o.inheritsof) { return false; }
		return this.ID === o.ID && o.inheritsof(ec.Layer);
	}
};

ec.extend(ec.Layer, ec.Object);