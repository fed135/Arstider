this.DisplayObject = function() {
	//Private
	var 
		id = Date.now(),
		props = {
			blue:0,
			red:0,
			green:0,
			alpha:100,
			rotation:0,
			x:0,
			y:0,
			scaleX:1,
			scaleY:1,
			data:null,
			width:0,
			height:0,
			framerate:30
		},
		state = STATE.STOP,
		loaded = false,
		ctxRef = null
	;
	
	//Public
	return {
		//Public proprieties
		name:name,
		id:id,
		
		//Constructor
		constructor:function(ctx) {
			ctxRef = ctx;
			ctxRef.drawImg(props.data, props.x, props.y, props.width, props.height);
		},
		
		//Getters and setters
		_x:function(val) {
			if(val !== undefined) {
				props.x = val;
			}
			return props.x;
		},
		_y:function(val) {
			if(val !== undefined) {
				props.y = val;
			}
			return props.y;
		},
		_width:function(val) {
			if(val !== undefined) {
				props.width = val;
			}
			return props.width;
		},
		_height:function(val) {
			if(val !== undefined) {
				props.height = val;
			}
			return props.height;
		},
		_data:function() {
			if(loaded === false) {
				return false;
			}
			return props.data;
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
