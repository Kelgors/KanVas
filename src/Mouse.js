kan.Mouse = {
	/**
	 * Position of the mouse contains two objects
	 *   rel: the position relative to the page
	 *   abs: the absolute position
	 *   In most of cases, if your css for the canvas is position: absolute, take the absolute position and vice-versa for the relative position
	 * @type {Object}
	*/
	position: {
		rel: null,
		abs: null
	},
	/**
	 * Get the absolute mouse position as kan.Point from Event 
	 * @param {MouseEvent} e
	 * @return {kan.Point}
	 */
	getAbsolutePosition: function(e) {
		kan.Mouse._update(e);
		return kan.Mouse.position.abs;
	},
	/**
	 * Get the relative mousePosition as kan.Point from Event
	 * @param {MouseEvent} e
	 * @return {kan.Point}
	 */
	getPosition: function(e) {
		kan.Mouse._update(e);
		return kan.Mouse.position.rel;
	},
	/**
	* Update the positions variables 
	* @param {MouseEvent}
	*/
	_update: function(e) {
		kan.Mouse.position.abs = new kan.Point({
			x: e.clientX,
			y: e.clientY
		});
		kan.Mouse.position.rel = new kan.Point({
			x: e.layerX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft),
			y: e.layerY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)
		});
	},
	/**
	 * Get the relative X component of mouse position from an Event
	 * @param {MouseEvent} e
	 * @return {Number}
	 */
	getX: function(e) {
		return e.layerX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	},
	/**
	 * Get the relative Y component of mouse position from an Event
	 * @param {MouseEvent} e
	 * @return {Number}
	 */
	getY: function(e) {
		return e.layerY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
	}
};