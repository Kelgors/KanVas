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
	this.lastMouse.rel = new ec.Point();
	this.lastMouse.abs = new ec.Point();
	if ( settings.canvas ) {
		/** @returns {HTMLCanvasElement} */
		this.canvas = document.getElementById(settings.canvas);
		this.canvas.width = settings.width;
		this.canvas.height = settings.height;
		/** @returns {CanvasRenderingContext2D} */
		this.context = this.canvas.getContext('2d');
		delete settings.canvas;
	}
	this.components = new Array();
	ec.Object.call(this, settings);
};

ec.Layer.prototype = {
	canvas: null,
	context: null,
	width: 0,
	height: 0,
	offset: new ec.Point(),
	info: {
		type: 'ec.Layer',
		getType: function() {
			return ec.Layer;
		}
	},
	fixed: false,
	components: null,
	mouseupCorrection: false,
	lastMouse: {
		rel: null,
		abs: null,
		pointed: false
	},
	add: function(component) {
		this.components.push(component);
		if (!this.mouseupCorrection && component.clickable||component.draggable && !this.mouseupCorrection) {
			var that = this;
			this.canvas.oncontextmenu = function(e) { e.preventDefault(); return false; };
			ec.EventManager.add(this, 'mousemove', (function(e) {
				this.lastMouse.rel = e.mousePosition;
				this.lastMouse.abs = e.mouseAbsPosition;
			}).bind(this));
			ec.EventManager.add(document, 'mouseup', function() {
				if (!ec.EventManager.app.mouse.pressed) {
					that.canvas.style.cursor = 'default';
				}
			});
			this.mouseupCorrection = true;
		}
	},
	update: function(stage) {
		this.lastMouse.pointed = false;
		for ( var i = 0; i < this.components.length; i++ ) {
			/* mousehover support */
			if (this.components[i].contains && !this.lastMouse.pointed) {
				if (this.components[i].contains(this.lastMouse.rel)) {
					if (this.components[i].isDragging) {
						this.canvas.style.cursor = 'move';
					} else {
						this.canvas.style.cursor = 'pointer';
					}
					this.lastMouse.pointed = true;
				} else {
					this.canvas.style.cursor = 'default';
				}
			}
			if ( this.components[i].update ) {
				this.components[i].update({ context: this.context, timer: stage.timer.delta(), mouse: this.lastMouse });
			}
		}
	},
	draw: function(stage) {
		this.context.clearRect(0, 0, this.width, this.height);

		for ( var i = 0; i < this.components.length; i++ ) {
			if ( this.components[i].draw ) {
				this.components[i].draw({ context: this.context, timer: stage.timer.delta(), mouse: this.lastMouse });
			}
		}
		this._restoreContext();
	}
};

ec.extend(ec.Layer, ec.Object);