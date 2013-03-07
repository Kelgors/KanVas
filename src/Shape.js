ec.counter = 0;

ec.Shape = function(settings) {
	/* Redefine position && currentPosition for this construction */
	this.currentPosition = new ec.Point();
	this.position = new ec.Point();
	this.transform = new ec.Object({
		m11: 1,
		m12: 0,
		m21: 0,
		m22: 1,
		dx: 0,
		dy: 0
	});
	this.defaultTransform = this.transform.clone();
	this.scale = new ec.Point({ x:1,y:1 });
	this.defaultScale = this.scale.clone();
	/** 
	 * Default random value associate to this shape, to simulate its own behavior
	 * @returns {Number} Number[0-1]
	 */
	this.random = Math.random();
	this.float = {};
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
				this.float[i] = settings[i]; break;
			default:
				this[i] = settings[i]; break;
		}
	}
	/* Support of draggable && clickable */
	if (ec.EventManager) {
		if (this.clickable) {
			ec.EventManager.add(this, 'mousedown', this.events.click.down.bind(this));
			ec.EventManager.add(this, 'mouseup', this.events.click.up.bind(this));
		}
		if (this.draggable) {
			ec.EventManager.add(this, 'mousedown', this.events.drag.begin.bind(this));
			ec.EventManager.add(this, 'mousemove', this.events.drag.move.bind(this));
			ec.EventManager.add(this, 'mouseup', this.events.drag.end.bind(this));
			this.counter = ec.counter++;
		}
	}
	this.graphics = new ec.Graphics();
};

ec.Shape.prototype = {
	info : {
		type : 'ec.Shape',
		getType: function() {
			return ec.Shape;
		}
	},
	position : null,
	fill : null,
	stroke : null,
	lineWidth : 1,
	clickable : false,
	draggable : false,
	transform: null,
	defaultTransform: null,
	scale: null,
	defaultScale: null,
	graphics: null,
	/** Element for floating effect */
	float: {
		speed: null,
		amplitude: null
	},
	random: 0,
	/**
	 * Default update function for shapes
	 * @param {Object} data
	 */
	update : function(data) {
		/* mousedown support */
		if (this.clickable && this.onpressed && this.isPressed) {
			this.onpressed(data);
		}
		/* mouseup */
		if (this.clickable && this.onclick && this.isClicked) {
			this.onclick(data);
		}
		this.currentPosition.x = this.position.x;
		/* Floating effect support */
		if (this.float.speed && this.float.amplitude) {
			this.currentPosition.y = this.position.y + Math.cos(data.timer * (2 * this.float.speed)) * this.float.amplitude;
		} else {
			this.currentPosition.y = this.position.y;
		}
	},
	draw : null,
	/** Events handler container */
	events : {
		click : {
			down : function(e) {
				if (this.contains(e.mousePosition)) {
					this.isPressed = true;
					if (this.onPressed) { this.onPressed(e); }
					ec.EventManager.app.mouse.pressed = true;
				} else {
					this.isPressed = false;
				}
			},
			up : function(e) {
				if (this.contains(e.mousePosition) && this.isPressed && !this.isDragging) {
					this.isPressed = false;
					ec.EventManager.app.mouse.pressed = false;
					this.isClicked = true;
					if (e.which == 3 && ec.DEBUG) {
						console.log(this);
						return false;
					}
					if (this.onClicked) { this.onClicked(e); }
				} else {
					this.isClicked = false;
				}
			}
		},
		drag : {
			begin : function(e) {
				if (e.which == 1) {
					if (this.contains(e.mousePosition)) {
						this.isDragging = true;
						this.isPressed = true;
						ec.EventManager.app.mouse.pressed = true;
						this.last = ec.Vector2.substract(this.position, e.mousePosition);
					} else {
						this.isPressed = false;
						this.isDragging = false;
					}
				}
			},
			move : function(e) {
				if (this.isDragging) {
					ec.EventManager.app.mouse.pressed = false;
					this.position.x = e.mousePosition.x + this.last.x;
					this.position.y = e.mousePosition.y + this.last.y;
					this.isPressed = false;
				}
			},
			end : function(e) {
				if (this.isDragging) {
					this.position.x = e.mousePosition.x + this.last.x;
					this.position.y = e.mousePosition.y + this.last.y;
					this.isDragging = false;
				}
			}
		},
		compare: function(o) {
			if (o.inheritsof) {
				if (o.inheritsof(ec.Shape)) {
					var type = this.info.type.split('.')[1];
					return new ec[type]({
						position: this.position.compare(o.position),
						currentPosition: this.currentPosition.compare(o.currentPosition)
					});
				}
			}
		}

	}
};
ec.extend(ec.Shape, ec.Object);