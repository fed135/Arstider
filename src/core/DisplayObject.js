this.DisplayObject = function(bag) {
	//Private
	var 
		props = {
			blue:0,
			red:0,
			green:0,
			alpha:null,
			rotation:null,
			x:null,
			y:null,
			scaleX:null,
			scaleY:null,
			data:null,
			width:null,
			height:null
		},
		state = STATE.LOADING,
		loaded = false,
		ctxRef = null
	;
	
	if(bag && (typeof bag === "object" || bag instanceof Object)) {
		for(var p in bag) {
			if(p in bag) {
				if(p in props) {
					if(p === "data") {
						loadBitmap(bag[p]);
					}
					else {
						props[p] = bag[p];
					}
				}
			}
		}
	}
	
	function loadBitmap(data) {
		var prevState = state;
		state = STATE.LOADING;
		props.data = new Image();
		props.data.onload = function(){state = prevState;}
		props.data.onerror = loadError;
		props.data.src = data;
	}
	
	//Public
	return {
		//Public proprieties
		id:null,
		
		//Constructor
		_draw:function(ctx) {
			ctxRef = ctx || ctxRef;
			if(ctxRef) {
				ctxRef.drawImg(props.data, this._x(), this._y(), this._width(), this._height());
			}
		},
		
		//Getters and setters
		_alpha:function(val) {
			if(val !== undefined) {
				props.alpha = val;
			}
			return props.alpha || 100;
		},
		_x:function(val) {
			if(val !== undefined) {
				props.x = val;
			}
			return props.x || 0;
		},
		_y:function(val) {
			if(val !== undefined) {
				props.y = val;
			}
			return props.y || 0;
		},
		_width:function(val) {
			if(val !== undefined) {
				props.width = val;
			}
			return props.width || 0;
		},
		_height:function(val) {
			if(val !== undefined) {
				props.height = val;
			}
			return props.height || 0;
		},
		_rotation:function(val) {
			if(val !== undefined) {
				props.rotation = val;
			}
			return props.rotation || 0;
		},
		_scaleX:function(val) {
			if(val !== undefined) {
				props.scaleX = val;
			}
			return props.scaleX || 1;
		},
		_scaleY:function(val) {
			if(val !== undefined) {
				props.scaleY = val;
			}
			return props.scaleY || 1;
		},
		_data:function() {
			if(loaded === false) {
				return false;
			}
			return props.data;
		},
		_state:function() {
			return state;
		},
		
		//Methods
		
		//Move a define ammount of pixels in a direction
		move:function(coords) {
			props.x += coords[0];
			props.y += coords[1];
			this.parent.parent._update();
		},
		//Move to a defined area
		moveTo:function(coord) {
			props.x = coord[0];
			props.y = coord[1]
			this.parent.parent._update();
		},
		//Rotates object a certain angle
		rotate:function(angle) {
			this._rotation(this._rotation() += angle);
			this.clear();
			ctxRef.rotate(angle);
			ctxRef.drawImage(props.data, props.x, props.y, props.width, props.height);
			ctxRef.rotate(-angle);
			this.parent.parent._update();
		},
		//Scales on the x, y or both axis
		scale:function(val) {
			this.clear();
			ctxRef.drawImage(props.data, props.x, props.y, props.width, props.height);
		},
		//Skew on the x, y or both axis
		skew:function(angle) {
			this.clear();
			ctxRef.setTransform(1, Math.tan(angle[0]), 0, 1, 0, 0);
			ctxRef.setTransform(1, Math.tan(angle[1]), 1, 0, 0, 0);
			ctxRef.drawImage(props.data, props.x, props.y, props.width, props.height);
			ctxRef.setTransform(1, Math.tan(-angle[0]), 0, 1, 0, 0);
			ctxRef.setTransform(1, Math.tan(-angle[1]), 1, 0, 0, 0);
		},
		//Tints a certain shade (Hex color)
		tint:function(color) {
			//create overlay with global alpha composition, so that you can revert to default state
		},
		//Removes the object data, without deleting the actual Display Object
		clear:function() {
			ctxRef.clearRect(props.x, props.y, props.width, props.height);
		}
	}
}
