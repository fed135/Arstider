/**
 * Mouse Wrapper. 
 *
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(){
	
	var 
		singleton = null,
		gestures = {
			PINCH_IN:"pinch-in",
			PINCH_OUT:"pinch-out",
			SWIPE:"swipe"
		},
		maxGesturePoints = 6
	;
	
	function Gesture(){
		this.points = [];
		this.center = null;
		this.speed = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.distance = 0;
		this.distanceX = 0;
		this.distanceY = 0;
		this.resembles = null;
		this.scale = 1;
		this.drawTime = 0;
		this.angle = 0;
		
		this.startSpread = null;
		
		this._savedDelay = 0;
		this._savedDistanceX = 0;
		this._savedDistanceY = 0;
	}
	
	Gesture.prototype.update = function(){
		
		if(this.points.length == 0) return;
		
		var 
			currX = null,
			currY = null,
		
			distX = 0,
			distY = 0,
			delay = 0,
			
			spreadSet = false,
			spread = 0
		;
		
		for(var i = 0; i< this.points.length; i++){
			spreadSet = false;
			
			if(currX == null || currY == null){
				//first input
				currX = this.points[i].inputs[0].x;
				currY = this.points[i].inputs[0].y;
			}
			
			if(this.points[i].inputs.length > 1){
				if(this.center == null){
					this.center = {x:(this.points[i].inputs[0].x + this.points[i].inputs[1].x) / 2, y:(this.points[i].inputs[0].y + this.points[i].inputs[1].y) / 2};
				}
				if(this.startSpread == null){
					spreadSet = true;
					this.startSpread = Math.sqrt(Math.pow((this.points[i].inputs[0].x - this.points[i].inputs[1].x), 2) + Math.pow((this.points[i].inputs[0].x + this.points[i].inputs[1].y), 2));
				}
			}
			
			//distance
			if(this.points[i].inputs[0].x < currX) distX += (currX - this.points[i].inputs[0].x);
			else distX += (this.points[i].inputs[0].x - currX);
			
			if(this.points[i].inputs[0].y < currY) distY += (currY - this.points[i].inputs[0].y);
			else distY += (this.points[i].inputs[0].y - currY);
			
			if(i>0){
				delay += (this.points[i].delay - this.points[i-1].delay);
				this.angle = Math.atan2(this.points[i].inputs[0].y - this.points[i-1].inputs[0].y, this.points[i].inputs[0].x - this.points[i-1].inputs[0].x) * 180 / Math.PI;
			}
				
			currX = this.points[i].inputs[0].x;
			currY = this.points[i].inputs[0].y;
			
			if(this.startSpread != null && this.points[i].inputs.length > 1 && !spreadSet){
				spread = Math.sqrt(Math.pow((currX - this.points[i].inputs[1].x), 2) + Math.pow((currY + this.points[i].inputs[1].y), 2));
			}
		}
		
		delay += this._savedDelay;
		distX += this._savedDistanceX;
		distY += this._savedDistanceY;
		
		this.drawTime = delay;
		
		this.distanceX = distX;
		this.distanceY = distY;
		this.distance = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
		
		this.speedX = distX/delay;
		this.speedY = distY/delay;
		this.speed = this.distance/delay;
		
		if(this.startSpread != null && spread != 0){
			this.scale = spread/this.startSpread;
			
			if(this.scale < 1){
				this.resembles = gestures.PINCH_IN;
			}
			else{
				this.resembles = gestures.PINCH_OUT;
			}
		}
		else{
			this.resembles = gestures.SWIPE;
		}
	};
	
	Gesture.prototype.addPoint = function(point){
		if(point.inputs[0].x === -1 || point.inputs[0].y === -1) return;
		
		if(point.inputs[1]){
			if(point.inputs[1].x === -1 || point.inputs[0].y === -1) point.inputs.splice(1,1);
		}
		
		if(this.points.length > maxGesturePoints){
			this._savedDelay = this.drawTime;
			this._savedDistanceX = this.distanceX;
			this._savedDistanceY = this.distanceY;
			
			this.points = [this.points[this.points.length-1]];
			
			//this.startSpread = null;
			//this.center = null;
		}
		
		this.points.push(point);
		this.update();
	};
	
	function GesturePoint(inputs, prevDelay){
		this.inputs = inputs;
		
		this.delay = prevDelay;
	}
	
		define( "Arstider/Mouse", ["Arstider/Browser", "Arstider/Viewport"], function (Browser, Viewport){
			
			if(singleton != null) return singleton;
			
			function Mouse(){
				this.pressed = false;
			
				this.mouse = {x:0,y:0};
				
				this.prevX = 0;
				this.prevY = 0;
				
				this.touch = [];
				this.touchLimit = 5;
				this.touchObjBank = [];
				
				this._registerGestures = false;
				this.currentGesture = null;
				
				for(var i=0; i<this.touchLimit; i++) this.touchObjBank.push({x:0,y:0});
				
				this.releaseTrigger = null;
				
				this._input = false;
				
				this._touchRelay = Arstider.emptyFunction;
				
				if(Browser.isMobile){
					window.addEventListener('touchmove', this.handleTouchMove);
					window.addEventListener('touchstart',  this.handleTouchStart, false);			
					window.addEventListener('touchend',  this.handleTouchEnd,false);
				}
				else{
					window.addEventListener('mouseup', this.handleMouseUp);
					window.addEventListener('mousedown', this.handleMouseDown);
					window.addEventListener('mousemove',  this.handleMouseMove);
					
					//Prevent arrow scrolling
					window.addEventListener('keydown',  function(e){
						if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
					        e.preventDefault();
					        return false;
					    };
					},false);
				}
			}
			
			Mouse.prototype.registerGestures = function(){
				this._registerGestures = true;
			};
			
			Mouse.prototype.stopGestures = function(){
				this._registerGestures = false;
			};
			
			Mouse.prototype.step = function(){
				singleton.prevX = singleton.x();
				singleton.prevY = singleton.y();
			};
			
			Mouse.prototype.reset = function(){
				singleton.prevX = 0;
				singleton.prevY = 0;
				singleton.touch = [];
				singleton.pressed = false;
				singleton._input = false;
				singleton.mouse.x = 0;
				singleton.mouse.y = 0;
			};
			
			Mouse.prototype.x = function(input){
				input = input || 0;
				
				if(Browser.isMobile){
					if(singleton.touch[input]){
						return singleton.touch[input].x;
					}
					else{
						return -1;
					}
				}
				else{
					return singleton.mouse.x;
				}
			};
			
			Mouse.prototype.y = function(input){
				input = input || 0;
			
				if(Browser.isMobile){
					if(singleton.touch[input]){
						return singleton.touch[input].y;
					}
					else{
						return -1;
					}
				}
				else{
					return singleton.mouse.y;
				}
			};
			
			Mouse.prototype.handleTouchMove = function(event){
				
				e = event || window.event;
				e.stopPropagation();
				e.preventDefault();
				
				singleton.touch.length = 0;
				var newTouch;
				for(var i=0; i<e.touches.length && i<singleton.touchLimit; i++){
					newTouch = singleton.touchObjBank[i];
					newTouch.x = ((e.touches[i].clientX - Viewport.xOffset) / Viewport.canvasRatio) / Viewport.globalScale;
		        	newTouch.y = ((e.touches[i].clientY - Viewport.yOffset) / Viewport.canvasRatio) / Viewport.globalScale;
					singleton.touch[i] = newTouch;
				}
				
				if(singleton._registerGestures && singleton.currentGesture != null) singleton.currentGesture.addPoint(singleton._gesturePoint());
			};
			
			Mouse.prototype.handleTouchStart = function(e){
				var isFresh = (singleton.pressed == false);
				singleton.handleTouchMove(e);
				singleton.pressed = true;
				e = e || window.event;
				
				singleton.handleTouchMove(e);
				singleton._touchRelay(e);
				
				if(singleton._registerGestures && isFresh){
					singleton.currentGesture = new Gesture();
					singleton.currentGesture.addPoint(singleton._gesturePoint(true));
				}
				
				e.stopPropagation();
				e.preventDefault();
				return false;
			};
			
			Mouse.prototype._gesturePoint = function(first){
				
				return new GesturePoint((Browser.isMobile)?singleton.touch:[{x:singleton.mouse.x, y:singleton.mouse.y}], Arstider.timestamp());
			};
			
			Mouse.prototype.handleTouchEnd = function(e){
				singleton.currentGesture = null;
				
				singleton.pressed = false;  
				if(singleton.releaseTrigger !== null){
					singleton.releaseTrigger();
					singleton.releaseTrigger = null;
				}
				singleton._input = true;
				
				setTimeout(function(){singleton.handleTouchMove(e);},10);
				singleton._touchRelay(e);
				
				e = e || window.event;
				e.stopPropagation();
				e.preventDefault();
				return false;
			};
			
			Mouse.prototype.handleMouseDown = function(e){
				singleton.pressed = true;
				singleton.handleMouseMove(e);
				singleton._touchRelay(e);
				
				if(singleton._registerGestures){
					singleton.currentGesture = new Gesture();
					singleton.currentGesture.addPoint(singleton._gesturePoint());
				}
			};
			
			Mouse.prototype.handleMouseUp = function(e){
				singleton.currentGesture = null;
				
				singleton._input = true;
				singleton.pressed = false;
				singleton.handleMouseMove(e);
				singleton._touchRelay(e);
			};
			
			Mouse.prototype.handleMouseMove = function(event) {
		        event = event || window.event; // IE-ism
		        singleton.mouse.x = ((event.clientX - Viewport.xOffset) / Viewport.canvasRatio) / Viewport.globalScale;
		        singleton.mouse.y = ((event.clientY - Viewport.yOffset) / Viewport.canvasRatio) / Viewport.globalScale;
		        
		        if(singleton._registerGestures && singleton.currentGesture != null) singleton.currentGesture.addPoint(singleton._gesturePoint());
		   };
			
			singleton = new Mouse();
			
			return singleton;
		});
})();