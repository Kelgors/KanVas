/**
 * Instanciate a drawable string
 * @param {Object} 		settings
 * @param {ec.Point} 	settings.position	Position where drawing this text
 * @param {String} 		settings.value		String to draw
 * @param {ec.Color} 	settings.fill		Fill color
 * @param {ec.Color} 	settings.stroke		Stroke color
 * @param {Number} 		settings.size		Font size
 * @param {String} 		settings.font		Font family
 * @param {String} 		settings.style 		[italic, bold, underline]
 * @param {Number} 		settings.lineWidth	stroke line width
 * @returns {ec.Text}
 */
ec.Text = function(settings) {
	this.value = '';
	ec.Shape.call(this, settings);
};

ec.Text.prototype = {
	info: {
		type: 'Text',
		getType: function() {
			return ec.Text;
		}
	},
	value: null,
	fill: null,
	stroke: null,
	lineWidth: 1,
	font: 'Verdana',
	size: 30,
	style: '',
	currentPosition: null,
	update: function(data) {
		this.currentPosition.y = this.position.y+this.size/2;
		data.context.font = this.size+'px '+this.font+' '+this.style;
		this.currentPosition.x = this.position.x - data.context.measureText(this.value).width/2;
	},
	draw: function(data){
		/** @returns {CanvasRenderingContext2D} */
		var ctx = data.context;
		this.graphics.beforedraw(ctx);
		ctx.font = this.size+'px '+this.font+' '+this.style;
		if (this.fill) {
			ctx.fillStyle = this.fill instanceof ec.Color ? this.fill.toHexa() : this.fill;
			ctx.fillText(this.value, this.currentPosition.x, this.currentPosition.y);
		}
		if (this.stroke) {
			ctx.strokeStyle = this.stroke instanceof ec.Color ? this.stroke.toHexa() : this.stroke;
			ctx.lineWidth = this.lineWidth;
			ctx.strokeText(this.value, this.currentPosition.x, this.currentPosition.y);
		}
		this.graphics.afterdraw(ctx);
	},
	compare: function(o) {
		// TODO: string comparison
		if (o.inheritsof && o.inheritsof(ec.Text)) {
			var text=0, font=0,size=0,style=0;
			if (this.value !== o.value) {
				if (this.value.length > o.value.length) {
					text = 1;
				} else if (this.value.length < o.value.length) {
					text = -1;
				}
			}
			if (this.size > o.size) { size = 1; } else if (this.size < o.size) { size = -1; }
			if (this.font !== o.font) {
				if (this.font.length > o.font.length) {
					font = 1;
				} else if (this.font.length < o.font.length) {
					font = -1;
				}
			}
			if (this.style !== o.style) {
				if (this.style.length > o.style.length) {
					style = 1;
				} else if (this.style.length < o.style.length) {
					style = -1;
				}
			}
			return new ec.Text({
				value: text,
				font: font,
				size: size,
				style: style
			});
		}
	},
	clone: function() {
		var fill = this.fill instanceof ec.Color ? this.fill.clone : this.fill;
		var stroke = this.stroke instanceof ec.Color ? this.stroke.clone : this.stroke;
		return new ec.Text({
			position: this.position.clone(),
			stroke: stroke,
			fill: fill,
			font: this.font,
			lineWidth: this.lineWidth,
			style: this.style, 
			size: this.size,
			value: this.value
		});
	}
};
ec.extend(ec.Text, ec.Shape);