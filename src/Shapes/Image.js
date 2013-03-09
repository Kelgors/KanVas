ec.Image = function(id) {
	this.imageSrc = srcv;
	this.image = new Image(src);
};

ec.Image.prototype = {
	info: {
		type: 'Image',
		getType: function() { return ec.Image; }
	},
	imageSrc: null,
	image: null,
	draw: function(data) {
		// TODO: draw image, wait for ec.Graphics support
	}
};