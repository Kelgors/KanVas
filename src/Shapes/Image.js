/**
* A canvas drawable image
* @constructor
* @param {Object} settings
* @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|String} string can be the ID or the source of the image
* @param {kan.Point} settings.position	Representation of the position of this image	(Unnecessary if X && Y are given)
* @param {Number} settings.x			X component of the position	(Unnecessary if position is given)
* @param {Number} settings.y			Y component of the position (Unnecessary if position is given)
* @param {kan.Size} settings.size		Representation of the dimension of the rectangle	(Unnecessary if Width && Height are given)
* @param {Number} settings.width		Width of this image		(Unnecessary if Size is given)
* @param {Number} settings.height		Height of this image	(Unnecessary if Size is given)
* @param {Number} settings.amplitude	Necessary for floating effect
* @param {Number} settings.speed		Necessary for floating effect
*/
kan.Image = function(settings) {
	this.offset = new kan.Rectangle();
	this.size = new kan.Size();
	this.contains = kan.Rectangle.prototype.contains.bind(this);
	kan.Shape.call(this, settings);
	
	/* Set the Image */
	if (typeof(this.image) == 'string') {
		if (this.image.charAt(0) == '#') {
			this.image = document.getElementById(this.image.substr(1, this.image.length));
		} else {
			var src = this.image;
			this.image = new Image();
			this.image.src = src;
		}
	}
	
	if (this.size.equals(0)) {
		var that = this;
		this.image.onload = function() {
			that.size.width = this.width;
			that.size.height = this.height;
			that.isLoaded = true;
		};
		
	}
};

kan.Image.prototype = {
	info: {
		type: 'Image',
		getType: function() { return kan.Image; }
	},
	/**
	* Define if the image is loaded or not
	* @type {Boolean}
	*/
	isLoaded: false,
	/**
	* The position of the Image on the Layer
	* @type {kan.Point}
	*/
	position: null,
	/**
	* The size of the Image on the Layer
	* @type {kan.Point}
	*/
	size: null,
	/**
	* The area of the Image you want to draw
	* @type {kan.Rectangle}
	*/
	offset: null,
	/**
	* The Image|Canvas|Video you want to draw on the Layer
	* @type {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement}
	*/
	image: null,
	/**
	* Draw the Rectangle with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {kan.Point} data.lastMouse.rel
	* @param {kan.Point} data.lastMouse.abs
	*/
	draw: function(data) {
		if (this.image && this.isLoaded) {
			this.graphics.beforedraw(data.context);
			if (!this.offset.equals(0)) {
				data.context.drawImage(
					this.image,
					this.offset.position.x,
					this.offset.position.y,
					this.offset.size.width,
					this.offset.size.height,
					this.currentPosition.x,
					this.currentPosition.y,
					this.size.width,
					this.size.height
				);
			} else {
				data.context.drawImage(
					this.image,
					this.currentPosition.x,
					this.currentPosition.y,
					this.size.width,
					this.size.height
				);
			}
			this.graphics.afterdraw(data.context);
		}
	},
	/**
	* Check if this Image contains somthing
	* @override
	* @methodOf {kan.Rectangle}
	* @param {kan.Object}
	* @return {Boolean}
	*/
	contains: null
};

kan.extend(kan.Image, kan.Shape);