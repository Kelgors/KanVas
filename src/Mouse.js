ec.Mouse = {
	/**
	 * Get the absolute mouse position as ec.Point from Event 
	 * @param {MouseEvent} e
	 * @type ec.Point
	 * @returns {ec.Point}
	 */
	getAbsolutePosition: function(e) {
		return new ec.Point({
			x: e.clientX,
			y: e.clientY
		});
	},
	/**
	 * Get the relative mousePosition as ec.Point from Event
	 * @param {MouseEvent} e
	 * @type ec.Point
	 * @returns {ec.Point}
	 */
	getPosition: function(e) {
		return new ec.Point({
			x: e.layerX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft),
			y: e.layerY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)
		});
	},
	/**
	 * Get the relative X component of mouse position from an Event
	 * @param {MouseEvent} e
	 * @type Number
	 * @returns {Number}
	 */
	getX: function(e) {
		return e.layerX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	},
	/**
	 * Get the relative Y component of mouse position from an Event
	 * @param {MouseEvent} e
	 * @type Number
	 * @returns {Number}
	 */
	getY: function(e) {
		return e.layerY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
	}
};