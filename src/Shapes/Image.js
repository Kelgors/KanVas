ec.Image = function(id) {
	this.imageSrc = srcv;
	this.image = new Image(src);
};

ec.Image.prototype = {
	imageSrc: null,
	image: null,
	draw: function(data) {
		// TODO: draw image, wait for ec.Graphics support
	}
};