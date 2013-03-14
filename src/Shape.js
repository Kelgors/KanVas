/**
* An abstract shape
* @param {Object} settings
* @param {Number} settings.x
* @param {Number} settings.y
* @param {ec.Point} settings.position
* @param {Boolean} settings.clickable
* @param {Boolean} settings.draggable
* @constructor
* @extends {ec.Object}
* @type {ec.Shape}
* @return {ec.Shape}
*/
ec.Shape = function(settings) {
	/* Redefine position && currentPosition for this construction */
	this.events = new ec.EventManager();
	this.currentPosition = new ec.Point();
	this.position = new ec.Point();
	this.graphics = new ec.Graphics();
	/** 
	 * Default random value associate to this shape, to simulate its own behavior
	 * @returns {Number} Number[0-1]
	 */
	this.random = Math.random();
	this.floating = {};
	for(var i in settings) {
		switch(i) {
			case 'x':
			case 'y':
				this.position[i] = settings[i]; break;
			case 'width':
			case 'height':
				this.size[i] = settings[i]; break;
			case 'speed':
			case 'amplitude':
				this.floating[i] = settings[i]; break;
			default:
				this[i] = settings[i]; break;
		}
	}
	this.currentPosition = this.position.clone();
	/* Support of draggable && clickable */
	if (this.clickable) {
		this.on('mousedown', this.eventsHandlers.click.down);
		this.on('mouseup', this.eventsHandlers.click.up);
	}
	if (this.draggable) {
		this.on('mousedown', this.eventsHandlers.drag.begin);
		this.on('mousemove', this.eventsHandlers.drag.move);
		this.on('mouseup', this.eventsHandlers.drag.end);
	}
	ec.Object.call(this);
};

ec.Shape.prototype = {
	info : {
		type : 'Shape',
		getType: function() {
			return ec.Shape;
		}
	},
	/** 
	* The position where to draw the shape
	* @define {ec.Point} 
	*/
	position : null,
	/** 
	* The position where to draw the shape + position modifications
	* @define {ec.Point} 
	*/
	currentPosition: null,
	/** 
	* The fill color
	* @define {ec.Color|string} 
	*/
	fill : null,
	/** 
	* The stroke color
	* @define {ec.Color|string} 
	*/
	stroke : null,
	/** 
	* The stroke lineWidth
	* @define {Number} 
	*/
	lineWidth : 1,
	/** 
	* Define if the object is clickable or not
	* @define {Number} 
	*/
	clickable : false,
	/** 
	* Define if the object is draggable or not
	* @define {Number} 
	*/
	draggable : false,
	/** 
	* Defines the referential
	* @define {ec.Graphics} 
	*/
	graphics: null,
	/**
	* Events container
	* @define {ec.EventManager}
	*/
	events: null,
	/** Elements for floating effect */
	floating: {
		speed: null,
		amplitude: null
	},
	random: 0,
	/**
	 * Default update function for shapes
	 * @param {Object} data
	 */
	update : function(data) {
		/* Floating effect support */
		if (this.floating.speed && this.floating.amplitude) {
			this.currentPosition.y = this.position.y + Math.cos(data.timer * (2 * this.floating.speed)) * this.floating.amplitude;
		} else {
			this.currentPosition.y = this.position.y;
		}
		this.currentPosition.x = this.position.x;
	},
	draw : null,
	/** Events handlers container */
	eventsHandlers: {
		click : {
			down : function(e) {
				this.events.state.clicked = false;
				if (this.contains(e.mousePosition)) {
					this.events.state.pressed = true;
					ec.Mouse.pressed = true;
					if (this.onpressed) { this.onpressed(e); }
					return false;
				}
				this.events.state.pressed = false;
				return true;
			},
			up : function(e) {
				if (this.contains(e.mousePosition) && this.events.state.pressed && !this.events.state.dragging) {
					this.events.state.pressed = false;
					ec.Mouse.pressed = false;
					this.events.state.clicked = true;
					if (e.which == 3 && ec.DEBUG) {
						console.log(this);
					}
					if (this.onclick) { this.onclick(e); }
					return false;
				}
				return true;
			}
		},
		drag : {
			begin : function(e) {
				if (e.which == 1) {
					if (this.contains(e.mousePosition)) {
						this.events.state.pressed = true;
						ec.Mouse.pressed = true;
						this.events.state.lastPosition = ec.Vector2.substract(this.position, e.mousePosition);
						return false;
					}
					this.events.state.pressed = false;
					return true;
				}
			},
			move : function(e) {
				if (this.events.state.pressed) {
					this.position.x = e.mousePosition.x + this.events.state.lastPosition.x;
					this.position.y = e.mousePosition.y + this.events.state.lastPosition.y;
					this.events.state.dragging = true;
				}
			},
			end : function(e) {
				if (this.events.state.dragging) {
					this.position.x = e.mousePosition.x + this.events.state.lastPosition.x;
					this.position.y = e.mousePosition.y + this.events.state.lastPosition.y;
					this.events.state.dragging = false;
					this.events.state.pressed = false;
					ec.Mouse.pressed = false;
				}
			}
		}
	},
	compare: function(o) {
		if (o.inheritsof && o.inheritsof(ec.Shape)) {
			return new o.info.getType()({
				position: this.position.compare(o.position),
				currentPosition: this.currentPosition.compare(o.currentPosition)
			});
		}
		return null;
	},
	/**
	*  Create a new Event Handler for this ec.Object
	*  @param {String} e
	*  @param {Function(Event)} function to perform when the event's spreading
	*  @remarks You can add as many 'mousemove' events as you want to same item, for example
	*/
	on: function(e, fn) {
		var events = e.split(' ');
		for (var i in events) {
			if (!this.events[events[i]]) { this.events[events[i]] = new Array(); }
			this.events[events[i]].push(fn.bind(this));
		}
	},
	off: function(e) {
		var events = e.split(' ');
		for (var i in events) {
			if(this.events[events[i]]) { this.events[events[i]] = null; }
		}
	}
};
ec.extend(ec.Shape, ec.Object);