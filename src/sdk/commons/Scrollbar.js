define("Arstider/commons/Scrollbar",[
	"Arstider/DisplayObject",
	"Arstider/Mouse",
	"Arstider/Events"
	], /** @lends commons/Scrollbar */ 
	function(DisplayObject, Mouse, Events){

	function Scrollbar(props){	

		Arstider.Super(this, DisplayObject, props);

		var thisRef = this;
		this.orientation = Arstider.checkIn(props.orientation, Arstider.checkIn(props.scrollbarOrientation,"default"));
		this.focus = false;
		this.testMouse = true;

		///Add scrollbar container
		var scrollbar = new DisplayObject({
			name: this.name + "_scrollbar",
			alpha:0,
			onload: function(){
			  	// Check orientation
			 	if (thisRef.orientation == "default"){

					if(scrollbar.width > scrollbar.height)
						thisRef.orientation =  "horizontale";			
					else
						thisRef.orientation = "verticale";
					
					thisRef.scrollHeight = scrollbar.height;
					thisRef.scrollWidth = scrollbar.width;
				}
			 }
		});

		// Add properties
		scrollbar.imageBar = Arstider.checkIn(props.scrollbar, Arstider.checkIn(props.image, Arstider.checkIn(props.data,Arstider.checkIn(props.imageBar,null))));
		scrollbar.imageHandle = Arstider.checkIn(props.handle, Arstider.checkIn(props.imageHandle, Arstider.checkIn(props.dataHandle,null)));
		scrollbar.imageBarDisabled = Arstider.checkIn(props.scrollbarDisabled, Arstider.checkIn(props.imageDisabled, Arstider.checkIn(props.dataDisabled,Arstider.checkIn(props.imageBarDisabled,scrollbar.imageBar))));
		scrollbar.imageHandleDisabled = Arstider.checkIn(props.handleDisabled, Arstider.checkIn(props.imageHandleDisabled, Arstider.checkIn(props.dataHandleDisabled,scrollbar.imageHandle)));
		scrollbar.sizeParent = Arstider.checkIn(props.maxSize, Arstider.checkIn(props.maxValue, Arstider.checkIn(props.sizeParent, 100)));
			// Determines the default value of the handle 
		scrollbar.defaultValue = Arstider.checkIn(props.value, Arstider.checkIn(props.defaultValue,0));
		scrollbar.disabled = Arstider.checkIn(props.disabled, false),
		scrollbar.min = 0;
		
		// Add Handle
		if (scrollbar.imageBar && scrollbar.imageHandle) {
						
			var handle = new DisplayObject({ 	
				name: this.name + "_handle",
				onload:function(){

					setTimeout(function fixPosition(){
						if (thisRef.orientation == "horizontale"){

							if(!thisRef.handleSize) thisRef.handleSize = handle.width;
					 		scrollbar.max = 100 * scrollbar.sizeParent / scrollbar.width; 
							thisRef.resizeHandle(scrollbar);

							handle.y = handle.height;
					 		containerDrag.y =  -(handle.height/2 - scrollbar.height/2) - handle.height;
					 		containerDrag.width = scrollbar.width - handle.width;
					 		containerDrag.height = containerClick.height = handle.height;
					 		containerClick.y =  - (handle.height/2 - scrollbar.height/2);
					 		containerClick.width = scrollbar.width;

					 		if(scrollbar.defaultValue > scrollbar.width - handle.width)
								scrollbar.defaultValue = scrollbar.width - handle.width;
						}
						else if(thisRef.orientation == "verticale"){

							if(!thisRef.handleSize) thisRef.handleSize = handle.height;
							scrollbar.max = 100 * scrollbar.sizeParent / scrollbar.height; 
							thisRef.resizeHandle(scrollbar);

							handle.x = handle.width;
					 		containerDrag.x =  -(handle.width/2 - scrollbar.width/2) - handle.width;
					 		containerDrag.height = scrollbar.height - handle.height;
					 		containerDrag.width = containerClick.width = handle.width;
					 		containerClick.x =  - (handle.width/2 - scrollbar.width/2);
					 		containerClick.height = scrollbar.height;
					 		
							if(scrollbar.defaultValue > scrollbar.height - handle.height)
								scrollbar.defaultValue = scrollbar.height - handle.height;
						}

					thisRef.setValue(scrollbar.defaultValue);
					},1); 	
    			}
			});

			if(!scrollbar.disabled){
				scrollbar.loadBitmap(scrollbar.imageBar);
				handle.loadBitmap(scrollbar.imageHandle);	
			}
			else{
				scrollbar.loadBitmap(scrollbar.imageBarDisabled);
				handle.loadBitmap(scrollbar.imageHandleDisabled);
			}

			var containerDrag = new DisplayObject({
				name: this.name + "_containerDrag",
			});
			this.addChild(containerDrag);

			var containerClick = new DisplayObject({
				name : this.name + "_containerClick",
				onpress: function(){
					if(scrollbar.disabled) return;
					thisRef.startDrag(handle);
					thisRef.focus = true;
					},
				onrelease: function(){
					thisRef.stopDrag(handle);
					}
			});
			this.addChild(containerClick);
			containerDrag.addChild(handle);
		}	

		scrollbar.handle = handle;
		this.scrollbar = scrollbar;

		this.startMouseWheel(this.scrollbar);
	}
	Arstider.Inherit(Scrollbar, DisplayObject);


	Scrollbar.prototype.getDisabled = function(){
		return this.scrollbar.disabled ;		
	};

	Scrollbar.prototype.setDisabled = function(value){
		this.scrollbar.disabled = value ;	
		this.updateState(this.scrollbar);
	};

	Scrollbar.prototype.getValue = function(type){
		
		if(this.orientation == "horizontale"){

			if(type == "px" || type == undefined )
				return this.scrollbar.handle.x;
			else if (type == "%")
				return Math.round((this.scrollbar.handle.x)* 100 / (this.scrollbar.width - this.scrollbar.handle.width));	
		}
		else if(this.orientation == "verticale"){

			if(type == "px" || type == undefined )
				return this.scrollbar.handle.y;
			else if (type == "%")
				return Math.round((this.scrollbar.handle.y) * 100 / (this.scrollbar.height - this.scrollbar.handle.height));
		}
	};

	Scrollbar.prototype.setValue = function(value,type){
		
		if(this.orientation == "horizontale"){

			if(type == "px" || type == undefined )
				this.scrollbar.handle.x = value 
			else if (type == "%")
				this.scrollbar.handle.x = (value * (this.scrollbar.width - this.scrollbar.handle.width)/100 ) ;
		}	
		else if(this.orientation == "verticale"){
			if(type == "px" || type == undefined )
				this.scrollbar.handle.y = value;
			else if (type == "%")
				this.scrollbar.handle.y = (value * (this.scrollbar.height - this.scrollbar.handle.height)/100 );
		}
	};

	Scrollbar.prototype.getIsDragged = function(){
		return this.scrollbar.handle._dragged;
	};

	Scrollbar.prototype.setFocus = function(value){
		this.focus = value;
	};

	Scrollbar.prototype.getSizeParent = function(){
		return this.scrollbar.sizeParent;
	};

	Scrollbar.prototype.setSizeParent = function(value){
		
		this.scrollbar.sizeParent = value ;
		this.scrollbar.defaultValue = this.orientation? this.scrollbar.handle.x : this.scrollbar.handle.y;
		this.scrollbar.handle.onload();
	};

	Scrollbar.prototype.startDrag = function(handle){

		handle._dragOffsetX = 0;
		handle._dragOffsetY = 0; 
		handle._dragged = true;
		
		if(this.orientation == "horizontale"){
			handle._dragOffsetX = handle.parent.global.x + handle.width/2;
		}	
		else if(this.orientation == "verticale")
			handle._dragOffsetY =  handle.parent.global.y  + handle.height/2;
		handle._boundDrag = true;	
	};

	Scrollbar.prototype.stopDrag = function(handle){
		if( handle == undefined || !handle._dragged) return;

		setTimeout(function stopDragRelay(){
				handle._dragged = false;
				handle._dragOffsetX = 0;
				handle._dragOffsetY = 0;
				handle._boundDrag = false;
			},0); 
	};

	Scrollbar.prototype.updateState= function(scrollbar){

		this.scrollbar.defaultValue = this.orientation? this.scrollbar.handle.x : this.scrollbar.handle.y;
		scrollbar.loadBitmap(scrollbar.disabled? scrollbar.imageBarDisabled : scrollbar.imageBar);
		scrollbar.handle.loadBitmap(scrollbar.disabled? scrollbar.imageHandle : scrollbar.imageHandleDisabled);
	};

	Scrollbar.prototype.resizeHandle = function(scrollbar){

	    var horizon = this.orientation == "horizontale"? true: false,
			handleSize = this.handleSize,
			dropSize = handleSize - (handleSize * handleSize / scrollbar.sizeParent) ; 

		if(dropSize <= 0) return;

		scrollbar.handle.removeChildren();
	 		
		var handle_p1 = new DisplayObject({ 	
				name: this.name + "_subHandle1",
				alpha:1
			});
		handle_p1.loadSection(scrollbar.disabled? scrollbar.imageHandleDisabled : scrollbar.imageHandle, 0, 0, horizon? handleSize/2 - dropSize/2 : scrollbar.handle.width, horizon? scrollbar.handle.height : handleSize/2 - dropSize/2);
		scrollbar.handle.addChild(handle_p1);

		var handle_p2 = new DisplayObject({ 	
				name: this.name + "_subHandle2",
				x: horizon? handle_p1.width : 0,
				y: horizon? 0: handle_p1.height,
				alpha:1
			});

		handle_p2.loadSection(scrollbar.disabled? scrollbar.imageHandleDisabled : scrollbar.imageHandle, horizon? handle_p1.width + dropSize : 0, horizon? 0 : handle_p1.height + dropSize, horizon? handleSize - dropSize - handle_p1.width : handle_p1.width, horizon? handle_p1.height : handleSize - dropSize - handle_p1.height );
		scrollbar.handle.addChild(handle_p2); 

		scrollbar.handle.loadSection(0,0,0,0,0);
		scrollbar.handle.width = horizon? handle_p1.width + handle_p2.width : handle_p1.width;
		scrollbar.handle.height =horizon? handle_p1.height : handle_p1.height + handle_p2.height;
	};

	Scrollbar.prototype.startMouseWheel = function(scrollbar){
	   	var thisRef = this;
 	
	    Events.bind("Mouse.wheel",function MouseWheel(delta){
	    	if (!thisRef.focus || thisRef.scrollbar.disabled) return;

			if(thisRef.orientation == "horizontale"){
				var stopRight = (scrollbar.handle.x + 1 >= (scrollbar.width - scrollbar.handle.width)) && delta>0,
					stopLeft = scrollbar.handle.x - 1 <= 0 && delta<0;
				
				if(!stopRight && !stopLeft)
					scrollbar.handle.x += delta*2;
			}
			else if(thisRef.orientation == "verticale"){
				var stopDown = (scrollbar.handle.y + 1 >= (scrollbar.height - scrollbar.handle.height)) && delta<0,
					stopUp = scrollbar.handle.y - 1 <= 0 && delta>0;
				if(!stopDown && !stopUp)
					scrollbar.handle.y -= delta*2;
			}
		});
	};

	Scrollbar.prototype.update = function(){
	 
	    // Stop drag if mouse is released out 
		if(!Mouse.isPressed() && this.scrollbar.handle._dragged) 
			this.stopDrag(this.scrollbar.handle);

		// if mousse is pressed in parent start focus else stop focus
		if(Mouse.isPressed() && this.testMouse){
			this.testMouse = false;
			var collidesX =  (Mouse.x() > (this.parent.global.x + this.parent.width)) || (Mouse.x() < this.parent.global.x);
			var collidesY =  (Mouse.y() > (this.parent.global.y + this.parent.height)) ||  (Mouse.y() < this.parent.global.y);
			if((collidesX || collidesY) && this.focus)
				this.focus = false;		
			else if( (!collidesX && !collidesY) && !this.focus)
				this.focus = true;
		}
		if(!Mouse.isPressed() && !this.testMouse)
			this.testMouse = true;
	};

	return Scrollbar;
});


			
