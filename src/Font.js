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
	/**
	* the font style (normal|italic|underline)
	* @type {String} 
	*/
	style: 'normal',
	/**
	* text as smallcaps or not, as default: false
	* @type {Boolean} 
	*/
	smallcaps: false,
	/**
	* Font-Weight (normal|bold|bolder|100-900)
	* @type {String} 
	*/
	weight: 'normal',
	/**
	* the font family, as default: Arial
	* @type {String} 
	*/
	family: 'Arial',
	/**
	* The fill color
	* @type {ec.Color} 
	*/
	fill: null,
	/**
	* The stroke color
	* @type {ec.Color} 
	*/
	stroke: null,
	/**
	* The font size
	* @type {Number}
	*/
	size: 12,
	/**
	* The stroke line width
	* @type {Number}
	*/
	lineWidth: 1,
	/**
	* the horizontal alignement (top|middle|bottom|alphabetic|ideographic) as default: top
	* @type {String}
	*/
	baseLine: 'top',
	/**
	* the vertical alignement (left|right|center) as default: left
	* @type {String}
	*/
	textAlign: 'left',
	/**
	* Set all parameters of this font to the context
	* @param {CanvasRenderingContext2D} ctx Context
	*/
	set: function(ctx) {
		this.applyFont(ctx);
		ctx.lineWidth = this.lineWidth;
		if (this.fill)
			ctx.fillStyle = this.fill instanceof ec.Color ? this.fill.toRGBA() : this.fill;
		if (this.stroke)
			ctx.strokeStyle = this.stroke instanceof ec.Color ? this.stroke.toRGBA() : this.stroke;
	},
	/**
	* Set just the necessaries parameters for update
	* @param {CanvasRenderingContext2D} ctx Context
	*/
	applyFont: function(ctx) {
		var caps = this.smallcaps ? 'small-caps': '';
		ctx.font = caps+' '+this.style+' '+this.weight+' '+this.size+'px '+' '+this.family;
		ctx.textBaseline = this.baseLine;
		ctx.textAlign = this.textAlign;
	},
	/**
	* Get the font information
	* @override
	* @return {String}
	*/
	toString: function() {
	    var caps = this.smallcaps ? 'small-caps': '';
		return caps+' '+this.style+' '+this.weight+' '+this.size+'px '+' '+this.family;
	}
};

ec.extend(ec.Font, ec.Object);
