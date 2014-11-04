define("Arstider/commons/Slider",[
	"Arstider/DisplayObject",
	"Arstider/Mouse"
	], /** @lends commons/Slider */ 
	function(DisplayObject, Mouse){
	
	var id = 0;

	function Slider(props){	

		Arstider.Super(this, DisplayObject, props);

		var thisRef = this;
			
		var mouseX = Mouse.x();
		var mouseY = Mouse.y();

		///Add slider container
		var slider = new DisplayObject({
			name: "slider"+id,
			  onload: function(){
			 	if (slider.orientation =="default"){

					if(slider.width > slider.height)
						slider.orientation = handle.orientation = "horizontale";
					else
						slider.orientation = handle.orientation = "verticale";
					if(this.slider)
						this.slider.orientation = slider.orientation;
				}

			 }
		});
		slider.disabled = Arstider.checkIn(props.disabled, false),


		// Add properties
		slider.imageBar = Arstider.checkIn(props.slider, Arstider.checkIn(props.image, Arstider.checkIn(props.data,Arstider.checkIn(props.imageBar,null))));
		slider.imageHandle = Arstider.checkIn(props.handle, Arstider.checkIn(props.imageHandle, Arstider.checkIn(props.dataHandle,null)));
		slider.imageHandle2 = Arstider.checkIn(props.handle2, Arstider.checkIn(props.imageHandle2, Arstider.checkIn(props.dataHandle2,null)));
		slider.imageBarDisabled = Arstider.checkIn(props.sliderDisabled, Arstider.checkIn(props.imageDisabled, Arstider.checkIn(props.dataDisabled,Arstider.checkIn(props.imageBarDisabled,slider.imageBar))));
		slider.imageHandleDisabled = Arstider.checkIn(props.handleDisabled, Arstider.checkIn(props.imageHandleDisabled, Arstider.checkIn(props.dataHandleDisabled,slider.imageHandle)));
		slider.imageHandle2Disabled = Arstider.checkIn(props.handle2Disabled, Arstider.checkIn(props.imageHandle2Disabled, Arstider.checkIn(props.dataHandle2Disabled,slider.imageHandle2)));
		slider.max = Arstider.checkIn(props.max, Arstider.checkIn(props.maxValue, 100));
		slider.min = Arstider.checkIn(props.min, Arstider.checkIn(props.minValue, 0));
	  //slider.step = Arstider.checkIn(props.step, Arstider.checkIn(props.stepValue,10));
		slider.orientation = Arstider.checkIn(props.orientation, Arstider.checkIn(props.sliderOrientation,"default"));
			// Determines the default value of the handle 
		slider.defaultValue = Arstider.checkIn(props.value, Arstider.checkIn(props.defaultValue,0));
		slider.defaultValues = Arstider.checkIn(props.values, Arstider.checkIn(props.defaultValues,[0,100]));

		// Add Handle
		if (slider.imageBar && slider.imageHandle) {
						
			var handle = new DisplayObject({ 	
				name:"handle"+id,
				onpress: function(){
						if(slider.imageHandle2)
							thisRef.startDrag(handle);
					},
				onload:function(){
					if (slider.orientation == "horizontale"){

						handle.y = handle.height;
				 		containerDrag.y =  -(handle.height/2 - slider.height/2) - handle.height;
				 		containerDrag.width = slider.width - handle.width;
				 		containerDrag.height = containerClick.height = handle.height;
				 		containerClick.y =  - (handle.height/2 - slider.height/2);
				 		containerClick.width = slider.width;
					}
					else if(slider.orientation == "verticale"){
						handle.x = handle.width;
				 		containerDrag.x =  -(handle.width/2 - slider.width/2) - handle.width;
				 		containerDrag.height = slider.height - handle.height;
				 		containerDrag.width = containerClick.width = handle.width;
				 		containerClick.x =  - (handle.width/2 - slider.width/2);
				 		containerClick.height = slider.height;

					}
					if(!slider.imageHandle2)
						thisRef.setValue(slider.defaultValue);
					else
						thisRef.setValue(slider.defaultValues[0]);

    			}
			});
			if (slider.imageHandle2){

				var handle2 = new DisplayObject({ 	
					name:"handle2"+id,
					onpress: function(){
						if(slider.disabled || handle2.collides(handle.x,handle.y,handle.width,handle.height)) return;
						thisRef.startDrag(handle2);
					},
					onload:function(){
						if (slider.orientation == "horizontale"){

							handle2.y = handle2.height;
					 		containerDrag.y =  -(handle2.height/2 - slider.height/2) - handle2.height;
					 		containerDrag.width = slider.width - handle2.width;
					 		containerDrag.height = containerClick.height = handle2.height;
					 		containerClick.y =  - (handle2.height/2 - slider.height/2);
					 		containerClick.width = slider.width;
						}
						else if(slider.orientation == "verticale"){
							handle2.x = handle2.width;
					 		containerDrag.x =  -(handle2.width/2 - slider.width/2) - handle2.width;
					 		containerDrag.height = slider.height - handle2.height;
					 		containerDrag.width = containerClick.width = handle2.width;
					 		containerClick.x =  - (handle2.width/2 - slider.width/2);
					 		containerClick.height = slider.height;

						}
						thisRef.setValue(slider.defaultValues[1],2);
	    			}
				});
			}
			if(!slider.disabled){
				slider.loadBitmap(slider.imageBar);
				handle.loadBitmap(slider.imageHandle);
				if(slider.imageHandle2)
					handle2.loadBitmap(slider.imageHandle2);
			}
			else{
				slider.loadBitmap(slider.imageBarDisabled);
				handle.loadBitmap(slider.imageHandleDisabled);
				if(slider.imageHandle2)
					handle2.loadBitmap(slider.imageHandle2Disabled);
			}

			var containerDrag = new DisplayObject({
				name: "containerDrag"+id
			});
			this.addChild(containerDrag);

			handle.orientation = slider.orientation;
			handle.globalX = Arstider.checkIn(props.x, 0);		
			handle.globalY =  Arstider.checkIn(props.y, 0);

			var containerClick = new DisplayObject({
				name : "containerClick"+id,
				onpress: function(){
					if(slider.disabled) return;
					if(!slider.imageHandle2)
						thisRef.startDrag(handle);
					},
				onrelease: function(){
					thisRef.stopDrag(handle);
					thisRef.stopDrag(handle2);
					},
				onleave: function(){
					thisRef.stopDrag(handle);
					thisRef.stopDrag(handle2);
					}
			});
			this.addChild(containerClick);
			if(slider.imageHandle2)
				containerDrag.addChild(handle2);
			containerDrag.addChild(handle);


		}
		slider.handle = handle;
		if(slider.imageHandle2){
			handle2.globalX = handle.globalX;
			handle2.globalY =  handle.globalY;
			handle2.orientation = handle.orientation;
			slider.handle2 = handle2;
		}	
		this.slider = slider;

		id++;
	}
	
	Arstider.Inherit(Slider, DisplayObject);


	Slider.prototype.getDisabled = function(){
		return this.slider.disabled ;		
	};

	Slider.prototype.setDisabled = function(value){
		this.slider.disabled = value ;	
		this.updateState(this.slider);
	};

	Slider.prototype.getValue = function(){
		return Math.round(this.slider.handle.x * (this.slider.max - this.slider.min) / (this.slider.width - this.slider.handle.width));
	};

	Slider.prototype.setValue = function(value,numHandle){
		if(numHandle == undefined) numHandle = 1;
		
		if(numHandle == 1){
			if(this.slider.orientation == "horizontale")
				this.slider.handle.x = value * (this.slider.width - this.slider.handle.width)/(this.slider.max - this.slider.min);
				
			else if(this.slider.orientation == "verticale")
				this.slider.handle.y = value * (this.slider.height - this.slider.handle.height)/(this.slider.max - this.slider.min);
		}
		else if(numHandle == 2){
			if(this.slider.orientation == "horizontale")
				this.slider.handle2.x = value * (this.slider.width - this.slider.handle.width)/(this.slider.max - this.slider.min);
				
			else if(this.slider.orientation == "verticale")
				this.slider.handle2.y = value * (this.slider.height - this.slider.handle.height)/(this.slider.max - this.slider.min);

		}
	};

	Slider.prototype.startDrag = function(handle){

		handle._dragOffsetX = 0;
		handle._dragOffsetY = 0; 
		handle._dragged = true;

		
		if(handle.orientation == "horizontale"){
			handle._dragOffsetX =  handle.globalX;
		}	
		else if(handle.orientation == "verticale")
			handle._dragOffsetY =  handle.globalY;
		handle._boundDrag = true;
		
	};

	Slider.prototype.stopDrag = function(handle){
		if( handle == undefined || !handle._dragged) return;

		setTimeout(function stopDragRelay(){
				handle._dragged = false;
				handle._dragOffsetX = 0;
				handle._dragOffsetY = 0;
				handle._boundDrag = false;
			},0); 
	};

	Slider.prototype.updateState= function(slider){
		
		if(!slider.disabled){ 
			slider.loadBitmap(slider.imageBar);
			slider.handle.loadBitmap(slider.imageHandle);
			if(slider.imageHandle2)
				slider.handle2.loadBitmap(slider.imageHandle2);
		}
		else{
			slider.loadBitmap(slider.imageBarDisabled);
			slider.handle.loadBitmap(slider.imageHandleDisabled);	
			if(slider.imageHandle2)
				slider.handle2.loadBitmap(slider.imageHandle2Disabled);
		}
	};

	return Slider;
});


			
