Ar.prototype.DisplayObject = function(bag) {
	//Private
	var 
		STATE = {LOADING:0, STOP:1, PLAY:2, PAUSE:3, ERROR:4},
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
		ctxRef = null,
		thisRef = this
	;
	
	//Public properties
	this.id = null;
	
	this._draw = function(ctx) {
		ctxRef = ctx || ctxRef;
		if(state != STATE.ERROR){
			state = STATE.PLAY;
			if(ctxRef) {
				if(props.data) {
					ctxRef.drawImage(props.data, this._x(), this._y(), this._width(), this._height());
				}
			}
		}
	}
	
	this._update = function() {
		if(thisRef.parent) {
			thisRef.parent._update();
		}
	}
	
	//Getters and setters
	this._alpha = function(val) {
		if(val !== undefined) {
			props.alpha = val;
		}
		return props.alpha || 100;
	}
	this._x = function(val) {
		if(val !== undefined) {
			props.x = val;
		}
		return props.x || 0;
	}
	this._y = function(val) {
		if(val !== undefined) {
			props.y = val;
		}
		return props.y || 0;
	}
	this._width = function(val) {
		if(val !== undefined) {
			props.width = val;
		}
		return props.width || 0;
	}
	this._height = function(val) {
		if(val !== undefined) {
			props.height = val;
		}
		return props.height || 0;
	}
	this._rotation = function(val) {
		if(val !== undefined) {
			props.rotation = val;
		}
		return props.rotation || 0;
	}
	this._scaleX = function(val) {
		if(val !== undefined) {
			props.scaleX = val;
		}
		return props.scaleX || 1;
	}
	this._scaleY = function(val) {
		if(val !== undefined) {
			props.scaleY = val;
		}
		return props.scaleY || 1;
	}
	this._data = function() {
		return props.data;
	}
	this._state = function() {
		return state;
	}
	
	//Methods
	
	//Move a define ammount of pixels in a direction
	this.move = function(coords) {
		thisRef._x(thisRef._x() += coords[0]);
		thisRef._y(thisRef._y() += coords[1]);
		thisRef._update();
	}
	//Move to a defined area
	this.moveTo = function(coord) {
		thisRef._x(coord[0]);
		thisRef._y(coord[1]);
		thisRef._update();
	}
	//Rotates object a certain angle
	this.rotate = function(angle) {
		thisRef._rotation(thisRef._rotation() += angle);
		thisRef.clear();
		ctxRef.rotate(angle);
		thisRef._draw();
		ctxRef.rotate(-angle);
		thisRef._update();
	}
	//Scales on the x, y or both axis
	this.scale = function(val) {
		thisRef.clear();
		thisRef._draw();
	}
	//Skew on the x, y or both axis
	this.skew = function(angle) {
		thisRef.clear();
		ctxRef.setTransform(1, Math.tan(angle[0]), 0, 1, 0, 0);
		ctxRef.setTransform(1, Math.tan(angle[1]), 1, 0, 0, 0);
		thisRef._draw();
		ctxRef.setTransform(1, Math.tan(-angle[0]), 0, 1, 0, 0);
		ctxRef.setTransform(1, Math.tan(-angle[1]), 1, 0, 0, 0);
	}
	//Tints a certain shade (Hex color)
	this.tint = function(color) {
		//create overlay with global alpha composition, so that you can revert to default state
	}
	//Removes the object data, without deleting the actual Display Object
	this.clear = function() {
		ctxRef.clearRect(thisRef._x(), thisRef._y(), thisRef._width(), thisRef._height());
	}
	
	function loadBitmap(url) {
		if(typeof url === 'string' || url instanceof String) {
			var prevState = state;
			state = STATE.LOADING;
			Ar.prototype.FileSystem.download(url, function(b) {
				if(props.width == null){
					props.width = b.width;
				}
				if(props.height == null){
					props.height = b.height;
				}
				props.data = b;
				state = prevState;
				thisRef._update();
			},
			null, //No progress event
			function(e){
				state = STATE.ERROR;
			});
		}
		else {
			props.data = url;
			
			if(props.width == null){
				props.width = url.width;
			}
			if(props.height == null){
				props.height = url.height;
			}
			thisRef._update();
		}
	}
	
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
	
	state = STATE.STOP;
};
