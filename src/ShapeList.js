kan.ShapeList = function(settings) {
	kan.List.call(this, settings);
};

kan.ShapeList.prototype = {
	info: {
		type: 'ShapeList',
		getType: function() {
			return kan.ShapeList;
		}
	},
	add: function(o) {
		if (o.draw && o.update) {
			kan.List.prototype.add.call(this, o);
		}
	},
	moveToFirst: function(o) {
		var index;
		if (typeof(o) == 'number') {
			index = o;
			o = this.items[index];
		} else {
			index = this.getIndex(o);
		}
		o.lastZIndex = o.zIndex;
		o.zIndex = this.first().zIndex - 1;
		this.items.slice(index, 1);
		this.items.unshift(o);
	},
	moveToLast: function(o) {
		var index;
		if (typeof(o) == 'number') {
			index = o;
			o = this.items[index];
		} else {
			index = this.getIndex(o);
		}
		o.lastZIndex = o.zIndex;
		o.zIndex = this.last().zIndex + 1;
		this.items.slice(index, 1);
		this.items.push(o);
	},
	moveDown: function(o) {
		var index;
		if (typeof(o) == 'number') {
			index = o;
			o = this.items[index];
		} else {
			index = this.getIndex(o);
		}
		o.lastZIndex = o.zIndex;
		o.zIndex = this.items[index-1] ? this.items[index-1].zIndex - 1 : o.zIndex - 1;
		this.exchange(index, index-1);
	},
	moveUp: function(o) {
		var index;
		if (typeof(o) == 'number') {
			index = o;
			o = this.items[index];
		} else {
			index = this.getIndex(o);
		}
		o.lastZIndex = o.zIndex;
		o.zIndex = this.items[index+1] ? this.items[index+1].zIndex + 1 : o.zIndex + 1;
		this.exchange(index, index+1);
	},
	moveBack: function(o) {
		o.zIndex = o.lastZIndex;
	},
	getIndex: function(o) {
		for(var index = 0; index < this.items; index++) {
			if (this.items[index].info.ID === o.info.ID) {
				return index;
			}
		}
		return -1;
	}

};
kan.extend(kan.ShapeList, kan.List);