/**
 * Mouse Wrapper. 
 *
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(){
	
	var singleton = null;
	
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
				for(var i=0; i<this.touchLimit; i++) this.touchObjBank.push({x:0,y:0});
				
				this.releaseTrigger = null;
				
				this._input = false;
				
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
			
			Mouse.prototype.step = function(){
				this.prevX = this.x();
				this.prevY = this.y();
			};
			
			Mouse.prototype.reset = function(){
				this.prevX = 0;
				this.prevY = 0;
				this.touch = [];
				this.pressed = false;
				this._input = false;
				this.mouse.x = 0;
				this.mouse.y = 0;
			};
			
			Mouse.prototype.x = function(input){
				input = input || 0;
			
				if(this.pressed){
					if(Browser.isMobile){
						return this.touch[input].x;
					}
					else{
						return this.mouse.x;
					}
				}
			};
			
			Mouse.prototype.y = function(input){
				input = input || 0;
			
				if(this.pressed){
					if(Browser.isMobile){
						return this.touch[input].y;
					}
					else{
						return this.mouse.y;
					}
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
					singleton.setMousePos(newTouch, e.touches[i].clientX, e.touches[i].clientY);
					singleton.touch[i] = newTouch;
				}
			};
			
			Mouse.prototype.checkTouch = function(drag){
				if(this._input === true || (drag && this.pressed === true)){
					this._input = false;
					return true;
				}
				return false;
			};
			
			Mouse.prototype.checkHover = function(drag){
				if(!drag && this.pressed){
					return true;
				}
				return false;
			};
			
			Mouse.prototype.handleTouchStart = function(e){
				singleton.handleTouchMove(e);
				singleton.pressed = true;
				e = e || window.event;
				e.stopPropagation();
				e.preventDefault();
				return false;
			};
			
			Mouse.prototype.handleTouchEnd = function(e){
				singleton.pressed = false;  
				if(singleton.releaseTrigger !== null){
					singleton.releaseTrigger();
					singleton.releaseTrigger = null;
				}
				singleton._input = true;
				
				setTimeout(function(){singleton.handleTouchMove(e);},10);
				
				e = e || window.event;
				e.stopPropagation();
				e.preventDefault();
				return false;
			};
			
			Mouse.prototype.setMousePos = function(ret, x, y){
				ret.x = (x - Viewport.xOffset) / Viewport.canvasRatio;
		        ret.y = (y - Viewport.yOffset) / Viewport.canvasRatio;
			};
			
			Mouse.prototype.handleMouseDown = function(e){
				singleton.pressed = true;
			};
			
			Mouse.prototype.handleMouseUp = function(e){
				singleton._input = true;
				singleton.pressed = false;
			};
			
			Mouse.prototype.handleMouseMove = function(event) {
		        event = event || window.event; // IE-ism
		        singleton.setMousePos(singleton.mouse, event.clientX, event.clientY);
		    };
			
			singleton = new Mouse();
			
			return singleton;
		});
})();