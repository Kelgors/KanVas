/**
 * An abstract shape
 * @param {Object} settings
 * @param {Number} settings.x
 * @param {Number} settings.y
 * @param {kan.Point} settings.position
 * @param {Boolean} settings.clickable
 * @param {Boolean} settings.draggable 
 * @constructor
 * @extends {kan.Object}
 */
kan.Shape = function(settings) {
	/* Redefine position && currentPosition for this construction */
	this.events = new kan.EventManager();
	this.currentPosition = new kan.Point();
	this.position = new kan.Point();
	this.graphics = new kan.Graphics();
	/** 
	 * Default random value associate to this shape, to simulate its own behavior
	 * @define {Number} Number[0-1]
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
				if (this.size)
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
		if (!this.clickable)
			this.on('mousedown', this.eventsHandlers.click.down);
		this.on('mousemove', this.eventsHandlers.drag.move);
		this.on('mouseup', this.eventsHandlers.drag.end);
	}
	kan.Object.call(this);
};

kan.Shape.prototype = {
	info : {
		type : 'Shape',
		getType: function() {
			return kan.Shape;
		}
	},
	/** 
	* The position where to draw the shape
	* @type {kan.Point} 
	*/
	position : null,
	zIndex: 0,
	/** 
	* The position where to draw the shape + position modifications
	* @type {kan.Point} 
	*/
	currentPosition: null,
	/** 
	* The fill color
	* @type {kan.Color|string} 
	*/
	fill : null,
	/** 
	* The stroke color
	* @type {kan.Color|string} 
	*/
	stroke : null,
	/** 
	* The stroke lineWidth
	* @type {Number} 
	*/
	lineWidth : 1,
	/** 
	* Define if the object is clickable or not
	* @type {Number} 
	*/
	clickable : false,
	/** 
	* Define if the object is draggable or not
	* @type {Number} 
	*/
	draggable : false,
	/** 
	* Defines the referential
	* @type {kan.Graphics} 
	*/
	graphics: null,
	/**
	* Events container
	* @type {kan.EventManager}
	*/
	events: null,
	/** Elements for floating effect */
	floating: {
		speed: null,
		amplitude: null
	},
	random: 0,
	/**
	* Add this shape to a layer (or any List/shape container)
	* @param {kan.Layer|kan.List|Array} this instance is adding to that
	* @return {kan.Shape} this instance
	*/
	addTo: function(layer) {
		if (layer instanceof Array) {
			layer.push(this);
		} else if (layer.add) {
			layer.add(this);
		}
		return this;
	},
	/**
	 * Default update function for shapes
	 * @param {Object} data
	 */
	update : function(data) {
		/* Floating effect support */
		if (this.floating.speed && this.floating.amplitude) {
			this.currentPosition.y = this.position.y + Math.cos(data.timer * (this.floating.speed/10)) * this.floating.amplitude/10;
		} else {
			this.currentPosition.y = this.position.y;
		}
		this.currentPosition.x = this.position.x;
	},
	draw : function() {},
	/** Events handlers container */
	eventsHandlers: {
		click : {
			down : function(e) {
				this.events.state.clicked = false;
				if (this.contains(e.mousePosition)) {
					this.events.state.pressed = true;
					kan.Mouse.pressed = true;
					this.events.state.lastPosition = kan.Vector2.substract(this.position, e.mousePosition);
					this.info.layer.components.moveToLast(this);
					if (this.onpressed) { this.onpressed(e); }
					return false;
				}
				this.events.state.pressed = false;
				return true;
			},
			up : function(e) {
				if (this.contains(e.mousePosition) && this.events.state.pressed && !this.events.state.dragging) {
					this.events.state.pressed = false;
					kan.Mouse.pressed = false;
					this.events.state.clicked = true;
					this.info.layer.components.moveBack(this);
					if (e.which == 3 && kan.DEBUG) {
						console.log(this);
					}
					if (this.onclick) { 
						return this.onclick(e);
					}
					return false;
				}
				return true;
			}
		},
		drag : {
			move : function(e) {
				if (this.events.state.pressed) {
					this.position.x = e.mousePosition.x + this.events.state.lastPosition.x;
					this.position.y = e.mousePosition.y + this.events.state.lastPosition.y;
					this.events.state.dragging = true;
					return false;
				}
				return true;
			},
			end : function(e) {
				if (this.events.state.dragging) {
					this.position.x = e.mousePosition.x + this.events.state.lastPosition.x;
					this.position.y = e.mousePosition.y + this.events.state.lastPosition.y;
					this.events.state.dragging = false;
					this.events.state.pressed = false;
					kan.Mouse.pressed = false;
					this.info.layer.components.moveBack(this);
					return false;
				}
				return true;
			}
		}
	},
	/**
	* Compare this Shape to another
	* @override
	* @param {kan.Shape} o
	* @return {kan.Shape}
	*/
	compare: function(o) {
		if (o.inheritsof && o.inheritsof(kan.Shape)) {
			return new o.info.getType()({
				position: this.position.compare(o.position),
				currentPosition: this.currentPosition.compare(o.currentPosition)
			});
		}
		return null;
	},
	/**
	*  Create a new Event Handler for this kan.Object
	* You can add as many 'mousemove' events as you want to same item, for example
	*  @param {String} e
	*  @param {Function(Event)} function to perform when the event's spreading
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
kan.extend(kan.Shape, kan.Object);