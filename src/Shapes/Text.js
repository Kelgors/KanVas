/**
 * A drawable string
 * @param {Object} 		settings
 * @param {kan.Point} 	settings.position	Position where drawing this text
 * @param {String} 		settings.value		String to draw
 * @param {kan.Font} 	settings.font		kan.Font instance
 * @constructor
 * @extends {kan.Shape}
 */
kan.Text = function(settings) {
	this.value = '';
	this.font = new kan.Font();
	kan.Shape.call(this, settings);
};

kan.Text.prototype = {
	info: {
		type: 'Text',
		getType: function() {
			return kan.Text;
		}
	},
	value: null,
	currentPosition: null,
	getOrigin: function() {
		return kan.Vector2.add(this.position, this.origin);
	},
	/**
	* Update all values if the value != lastvalue
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {kan.Point} data.lastMouse.rel
	* @param {kan.Point} data.lastMouse.abs
	*/
	update: function(data) {
		if (this.value != this.lastValue) {
			this.font.applyFont(data.context);
			this.width = data.context.measureText(this.value).width;
			this.origin = new kan.Point({
				x: this.width/2,
				y: this.size/2
			});
			this.currentPosition.x = this.position.x - this.origin.x;
			this.currentPosition.y = this.position.y + this.origin.y;
			this.lastValue = this.value;
			/* multilines support */
			var str = this.value.split('\n');
			this.multiline = new Array();
			for (var i in str) {
				this.multiline[i] = { content: str[i], width: data.context.measureText(str[i]).width, y: this.position.y + this.font.size * i };
			}
		}
	},
	/**
	* Draw the Text with data.context
	* @override
	* @param {Object} data
	* @param {CanvasRenderingContext2D} data.context
	* @param {Number} data.timer
	* @param {Object} data.lastMouse
	* @param {kan.Point} data.lastMouse.rel
	* @param {kan.Point} data.lastMouse.abs
	*/
	draw: function(data){
		/** @define {CanvasRenderingContext2D} */
		var ctx = data.context;
		/* Modify context referential */
		this.graphics.beforedraw(ctx);
		this.font.set(ctx);
		if (this.font.fill || this.font.stroke) {
			for (var i in this.multiline) {
				if (this.font.fill)
					ctx.fillText(this.multiline[i].content, this.position.x, this.multiline[i].y);
				if (this.font.stroke)
					ctx.strokeText(this.multiline[i].content, this.position.x, this.multiline[i].y);
			}
		}
		/* Restore context referential */
		this.graphics.afterdraw(ctx);
	},
	/**
	* Compare this instance to another
	* @override
	* @param {?} o
	* @return {kan.Text}
	*/
	compare: function(o) {
		/* TODO: kan.Text comparison */
		return null;
	},
	/**
	* Check if the text value and font is equals to another instance
	* @override
	* @param {kan.Text|String}
	* @return {Boolean}
	*/
	equals: function(o) {
		if (o.inheritsof && o.inheritsof(kan.Text) && this.value === o.value) {
			return this.font.equals(o.font);
		} else if (typeof(o) == 'string') {
			return this.value == o;
		}
		return false;
	},
	/**
	* Clone this instance of kan.Text
	* @override
	* @return {kan.Text}
	*/
	clone: function() {
		return new kan.Text({
			position: this.position.clone(),
			font: this.font.clone(),
			value: this.value
		});
	},
	/**
	* Check if this contains another shape
	* For now, only Point support
	* @param {kan.Point} p
	* @return {Boolean}
	*/
	contains: function(p) {
	    /* kan.Point support */
		if (p.x != null && p.y != null) {
			var posY = 0, posYMax = 0, posX = 0, posXMax = 0;
			/* multilines containing support */
			for(var i in this.multiline) {
				/* support different baselines */
				switch (this.font.baseLine) {
					case 'top':
						posY = this.multiline[i].y; 
						posYMax = this.multiline[i].y + this.font.size;
						break;
					case 'middle': 
						posY = this.multiline[i].y - this.font.size/2; 
						posYMax = this.multiline[i].y + this.font.size/2;
						break;
					case 'bottom':
						posY = this.multiline[i].y - this.font.size; 
						posYMax = this.multiline[i].y;
						break;
					case 'alphabetic':
					case 'ideographic':
						posY = this.multiline[i].y - this.font.size; 
						posYMax = this.multiline[i].y;
						break;
				}
				/* support different alignements */
				switch (this.font.textAlign) {
					case 'left':
						posX = this.position.x;
						posXMax = this.position.x + this.multiline[i].width;
						break;
					case 'center':
						posX = this.position.x - this.multiline[i].width/2;
						posXMax = this.position.x + this.multiline[i].width/2;
						break;
					case 'right':
						posX = this.position.x - this.multiline[i].width;
						posXMax = this.position.x;
						break;
				}
				if (p.x > posX && p.y > posY && p.x < posXMax && p.y < posYMax) {
					return true;
				}
			}
		}
		return false;
	}
};
kan.extend(kan.Text, kan.Shape);
