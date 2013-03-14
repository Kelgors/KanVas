/**
* A font
* @param {Object} settings
* @param {ec.Color|String} settings.fill the fill color of this font
* @param {ec.Color|String} settings.stroke the stroke color of this font
* @param {Number} settings.lineWidth the stroke line width, as default: 1
* @param {String} settings.family the font family, as default: Arial
* @param {Number} settings.size the font size, as default: 12
* @param {String|Number} settings.weight normal|bold|bolder|100-900
* @param {String} settings.baseLine the horizontal alignement (top|middle|bottom|alphabetic|ideographic)
* @param {String} settings.textAlign the vertical alignement (left|right|center)
* @param {String} settings.style the font style (normal|italic|underline)
* @param {Boolean} settings.smallcaps text as smallcaps or not, as default: false
* @constructor
* @extends {ec.Object}
* @type {ec.Font}
* @return {ec.Font}
*/
ec.Font = function(settings) {
	ec.Object.call(this, settings);
};

ec.Font.prototype = {
	info: {
		type: 'ec.Font',
		getType: function() {
			return ec.Font;
		}
	},
	style: 'normal',
	smallcaps: true,
	weight: 'normal',
	family: 'Arial',
	fill: null,
	stroke: null,
	size: 12,
	lineWidth: 1,
	baseLine: 'top',
	textAlign: 'left',
	set: function(ctx) {
		this.applyFont(ctx);
		ctx.lineWidth = this.lineWidth;
		if (this.fill)
			ctx.fillStyle = this.fill instanceof ec.Color ? this.fill.toHexa() : this.fill;
		if (this.stroke)
			ctx.strokeStyle = this.stroke instanceof ec.Color ? this.stroke.toHexa() : this.stroke;
	},
	applyFont: function(ctx) {
		var caps = '';
		if (this.smallcaps) { caps = 'small-caps'; }
		ctx.font = caps+' '+this.style+' '+this.weight+' '+this.size+'px '+' '+this.family;
		ctx.textBaseline = this.baseLine;
		ctx.textAlign = this.textAlign;
	}
};

ec.extend(ec.Font, ec.Object);