define("Arstider/Layer", [
	"Arstider/Buffer", 
	"Arstider/Viewport", 
	"Arstider/Tag", 
	"Arstider/core/Performance", 
	"Arstider/Renderer", 
	"Arstider/DisplayObject", 
	"Arstider/Mouse", 
	"Arstider/Engine", 
	"Arstider/Browser"
	], function(Buffer, Viewport, Tag, Performance, Renderer, DisplayObject, Mouse, Engine, Browser){

	Layer.id = 0;

	Arstider.Inherit(Layer, DisplayObject);
	function Layer(props){
		var thisRef = this;

		Arstider.Super(this, DisplayObject, props);


		this._stepTimer = null;
		this.FPS = 0;
		this.setFPS(Arstider.firstOf([props.FPS, Arstider.FPS], 60));
		this.mouseEnabled = Arstider.checkIn(props.mouseEnabled, true);
		this.canvas = new Buffer({
			height:Arstider.checkIn(props.height, Viewport.maxHeight),
			width:Arstider.checkIn(props.width, Viewport.maxWidth),
			name:Arstider.checkIn(props.name, ("layer" + (++Layer.id))),
			webgl:Arstider.checkIn(props.webgl, false),		//change in the near future ;)
            vertexShader:Arstider.checkIn(props.vertexShader, ""),
			fragmentShader:Arstider.checkIn(props.fragmentShader, "")
		});
		this.width = this.canvas.width;
		this.height = this.canvas.height;

		this.wrapper = new Tag({
			id:this.canvas.name + "_wrapper",
			tag:"div"
		});

		this._tagOverlay = new Tag({
			id:this.canvas.name + "_tagOverlay",
			tag:"div"
		});
		//should make into an object eventually
		this._tagOverlay.style("position", "absolute").style("zIndex", 2).style("width", "100%").style("height", "100%");

		this._updateHandler = null;

		if(this.mouseEnabled){
			/*Mouse.addListener(function(e){
				thisRef.applyTouch.call(thisRef, e);
			});*/
		}

		this.wrapper.appendChild(this.canvas.data);
		this.wrapper.appendChild(this._tagOverlay);

		Viewport.addLayer(this);
	}



	/**
	 * Recursively wipes pending deletion item (remove child is an async operation)
	 * @type {function(this:Engine)}
	 * @param {Object|null} target The target to check for pending deletion items in (defaults to current screen) 
	 */
	Layer.prototype.removePending = function(target){
		target = target || this;

		if(target.children.length > 0){
			for(i = target.children.length-1; i>=0; i--){
				if(target.children[i] && target.children[i].__skip) target.children.splice(i, 1);
				else{
					if(target.children[i] && target.children[i].children && target.children[i].children.length > 0) this.removePending(target.children[i]);
				}
			}
		}
	};

	Layer.prototype._update = function(dt){
		if(Engine.handbreak || Viewport.unsupportedOrientation) return;

		var thisRef = this;

		if(this.update) this.update(dt);

		if(this.children && this.children.length > 0){
			for(var i = 0; i<this.children.length; i++){
				if(this.children[i] && this.children[i]._update){
					this.children[i]._update(dt);
				}
			}
		}

		var showFrames = false;
		var mouseAction = (this.mouseEnabled)?function(e){
			thisRef.applyRelease(e, ((Browser.isMobile)?Mouse._ongoingTouches:[{x:Mouse.x(), y:Mouse.y(), pressed:Mouse.pressed}]));
		}:null;
		if(Engine.profiler) showFrames = Engine.profiler.showFrames;

		console.log("DRAWING "+ this.name+ " !!! :)")
		Renderer.draw(this.canvas.context, this, mouseAction, null, showFrames);

		this.removePending();
	};

			/**
		 * Applies touch events to the canvas element recursively
		 * @type {function(this:Engine)}
		 * @param {Object} e The touch/mouse event
		 * @param {Object|null} target The target to apply the event to (defaults to current screen) 
		 */
		Layer.prototype.applyTouch = function(e, target){
			
			if(!target){
				Arstider.__cancelBubble = {};
				target = this;
			}
			
			var 
				i,
				u,
				numInputs = 1
			;

			if(Browser.isMobile){
				numInputs = Math.min(Mouse.count(true), 5);
				Sound._queueFile();
			}

			if(target.mouseEnabled === false) return;
			
			if(target && target.children && target.children.length > 0){
				for(i = target.children.length-1; i>=0; i--){
					if(target && target.children && target.children[i] && !target.children[i].__skip){
						for(u=0; u<numInputs;u++){
							if(Arstider.__cancelBubble[u] !== true && target.children[i].isTouched){
								if(target.children[i].isTouched(Mouse.x(u), Mouse.y(u))){
									if(Mouse.isPressed(u)){
										if(!target.children[i]._pressed) target.children[i]._onpress(e);
										if(Browser.isMobile) target.children[i]._preclick = true;
									}
									else{
										if(target.children[i]._pressed) target.children[i]._onrelease(e);
									}
									
									if(target && target.children && target.children[i] && !target.children[i].__skip){
										if(Mouse.rightPressed) target.children[i]._rightPressed = true;
										else{
											if(target.children[i]._rightPressed) target.children[i]._onrightclick(e);
										}
									}
									break;
								}
							}
						}
					
						//recursion
						if(target && target.children && target.children[i] && !target.children[i].__skip && target.children[i].children && target.children[i].children.length > 0) singleton.applyTouch(e, target.children[i]);
					}
				}
			}

			Arstider.__cancelBubble = {};
			i = u = numInputs = null;
		};

		/**
		 * Finishes touch behaviours to the canvas element before draw
		 * @type {function(this:Engine)}
		 * @param {Object|null} target The target to apply the event to (defaults to current screen) 
		 */
		Layer.prototype.applyRelease = function(target, inputs){

			var 
				mouseX = (inputs.length == 0)?-1:inputs[0].x,
				mouseY = (inputs.length == 0)?-1:inputs[0].y,
				i,
				inputId = null
			;

			if(target.mouseEnabled === false) return;

			if(Browser.isMobile){
				for(i=0; i< inputs.length; i++){
					if(Arstider.__cancelBubble[i] !== true && target.isTouched){
						if(target.isTouched(inputs[i].x, inputs[i].y) && inputs[i].pressed){
							inputId = i;
							mouseX = inputs[i].x;
							mouseY = inputs[i].y;
							break;
						}
					}
				}

				if(inputId == null && (target._pressed || target._preclick)){
					target._onleave();
					target._pressed = false;
					target._preclick = false;
				}
			}
			else{
				if(Arstider.__cancelBubble[0] !== true  && target.isTouched){
					if(target.isTouched(mouseX, mouseY)){
						
						if(!target._hovered) target._onhover();
						if(!Mouse.isPressed()) target._preclick = true;
					}
					else{
						if(target._hovered) target._onleave();
						target._pressed = false;
					}
				}
			}

			if(mouseX != -1 && mouseY != -1){
				if(target._dragged){
					target.x = mouseX - target._dragOffsetX;
					target.y = mouseY - target._dragOffsetY;
						
					if(target._boundDrag){
						if(target.x < 0) target.x = 0;
						if(target.y < 0) target.y = 0;
						if(target.x > target.parent.width) target.x = target.parent.width;
						if(target.y > target.parent.height) target.y = target.parent.height;
					}
				}
			}

			mouseX = mouseY = i = inputId = null;
		};

	Layer.prototype.setFPS = function(val){
		//need to cancel
		if(this._stepTimer && this._updateHandler) this._stepTimer.unbind(this._updateHandler);

		var thisRef = this;
		this._updateHandler = function(dt){
			thisRef._update.call(thisRef, dt);
		};

		this.FPS = val;
		this._stepTimer = Performance.getFrameSignal(val);
		this._stepTimer.add(this._updateHandler);
	};

	Layer.prototype.setIndex = function(val){

	};

	Layer.prototype.killBuffer = function(){
		if(this.wrapper._tag.parentNode != null) this.wrapper._tag.parentNode.removeChild(this.wrapper._tag);
		this.wrapper._tag = null;

		Viewport.removeLayer(this);
	};

	return Layer;
});