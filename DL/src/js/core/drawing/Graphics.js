/**
* //Drawing Package//
*
* @Author Frederic Charette <fredericcharette@gmail.com>
*
* @Version
*	- 0.0.1 (Nov 11 2012) : Initial stub, sketches and classes with basic parenting functionalities.
*
*	//LICENCE
*	This program is free software; you can redistribute it and/or modify
*	it under the terms of the GNU General Public License as published by
*	the Free Software Foundation; either version 3 of the License, or
*	(at your option) any later version.
*	
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
*	GNU General Public License for more details.
*	
*	You should have received a copy of the GNU General Public License
*	along with this program. If not, see <http://www.gnu.org/licenses/>. 	
*/

;(function(window){
	
	//Declarations
	var 
		engines=["webgl","2d"/*,"dom"*/],
		buffer = document.createElement('canvas'),
		bufferCtx = buffer.getContext(engines[1]),
		Graphics = {version:"0.0.1"},	//Define Current Package.
		maxLayerSize = 4096
	;
	
	
	//Pick up Animation Frame handler, depending on browser engine.
	window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

	/**
	* @Name MovieClip
	* 
	* @Description Your basic display object. Pretty similar to the Flash element as it can contain graphic data and also MovieClips.
	*/
	Graphics.MovieClip = function(/*(String) Name*/name,/*(Object) Proprieties*/attributes) {
		
		if(!(name instanceof String) && !(typeof name === "string")) {
			//unregistered
			attributes = name;
			name = id;
		}
		
		var 
			//Private
			id = Date.now(),
			props= {
				blue:0,
				red:0,
				green:0,
				alpha:100,
				rotation:0,
				x:0,
				y:0,
				size:1,
				data:null,
				sprite:false,
				spriteFormat:[0,0],
				width:0,
				height:0
			},
			state="stop",
			loaded = false,
			initAttributes = attributes || {}
		;
		
		//Public
		return {
			name:name,
			id:id,
			framerate:0,
			type:"MovieClip",
			addClip:function(/*(Clip) clip*/clip) {
				var id= clip.name || Date.now();
				clip.parent = this;
				clip.engine = drawEng;
				clip.id = id;
				clips[id]=clip;
				return id;
			},
			removeClip:function(/*(String) clip*/clip) {
				if(!(clip instanceof String) && !(typeof clip === "string")) {
					if(clip.id !=undefined){
						delete clips[clip.id];
						return true;
					}
				}
				else {
					delete clips[clip];
					return true;
				}
				return false;
			},
			play:function() {
				
			},
			stop:function() {
				
			},
			goTo:function() {
				
			},
			setProps:function() {
				
			},
			_animate:function () {
				
			},
			_x:function() {
				return props.x;
			},
			_y:function() {
				return props.y;
			},
			_width:function() {
				return props.width;
			},
			_height:function() {
				return props.height;
			},
			_data:function() {
				if(loaded === false) {
					return false;
				}
				return props.data;
			},
			init:function(attr){
				var p, img, propList, parent = this.parent;
				
				propList = attr || initAttributes;
				
				for(p in propList) {
					if (propList.hasOwnProperty(p)) {
						if(props[p] !== undefined) {
							if((propList[p] instanceof String || (typeof propList[p] === "string")) && (propList[p].indexOf(".jpg") || propList[p].indexOf(".png") || propList[p].indexOf(".gif"))) {
								img = new Image();
								console.warn(this);
								img.onload = function() {
									loaded = true;
									parent._update();
							    };
								img.src=propList[p];
								
								props[p] = img;
							}
							else {
								props[p] = propList[p];
							}
						}
						else {
							console.warn("Unknown propriety '"+p+"'");
						}
					}
				}
			}
		};
	}


	/**
	* @Name Layer
	* 
	* @Description This is where MovieClips are assembled and flatten. 
	*	Layers are stacked one over another, like in Photoshop or Flash, so to add a z-index. 
	*	Beware, it cannot be transformed like the MovieClip.
	*/
	Graphics.Layer = function(/*(String) Name*/name,/*(Object) Proprieties*/attributes) {
		
		var 
			//Private
			id = Date.now(),
			lastRender = 0,
			lastUpdate = Date.now(),
			clips = {},
			rendered = false,
			imgData = null,
			canvasObj = null,
			ctx = null,
			//Create canvas
			canvas = document.createElement('canvas'),
			ctx = null,
			props= {
					backgroundColor:null,
					engine:"2d",
					width:0,
					height:0
				}
		;
		
		canvas.setAttribute('class', 'arCanvasLayer');
		canvas.setAttribute('id', 'arCanvasLayer_'+id);
		
		function updateProps(propList) {
			for(p in propList) {
				if (propList.hasOwnProperty(p)) {
					if(props[p] !== undefined) {
						props[p] = propList[p];
					}
					else {
						console.warn("Unknown propriety '"+p+"'");
					}
				}
			}
		}
		
		function updateElement() {
			canvas.setAttribute('height', props.height);
			canvas.setAttribute('width', props.width);
			ctx = canvas.getContext(props.engine);
		}
		
		updateProps(attributes);
		updateElement();
		
		//Public
		return {
			type:"Layer",
			addClip:function(/*(Clip) clip*/clip) {
				var id= clip.name || Date.now();
				clip.parent = this;
				clip.id = id;
				clips[id]=clip;
				clips[id].init();
				return id;
			},
			removeClip:function(/*(String) clip*/clip) {
				if(!(clip instanceof String) && !(typeof clip === "string")) {
					if(clip.id !=undefined){
						delete clips[clip.id];
						return true;
					}
				}
				else {
					delete clips[clip];
					return true;
				}
				return false;
			},
			_render:function() {
				if((lastUpdate - lastRender)>0) {
					var d, t, itemcount = 0, rendercount = 0;
					for(d in clips) {
						itemcount ++;
						if (clips.hasOwnProperty(d)) {
							t = clips[d]._data();
							if(t !== false) {
								ctx.drawImage(clips[d]._data(), 0, 0);
								rendercount++;
							}
						}
					}
					if(itemcount == rendercount) {
						lastRender = Date.now();
					}
				}
			},
			
			_update:function() {
				lastUpdate = Date.now();
			},
			
			context:function() {
				return ctx;
			},
			canvas:function() {
				return canvas;
			},
			framerate:0,			//Not sure. What if we want to change it runtime ?
			visible:true,
			zIndex:0
		}
	}

	/**
	* @Name Canvas
	* 
	* @Description This is where layers are finaly rendered (flat) onto the scene with the appropriate engine.
	*/
	Graphics.Canvas = function(/*(Dom Object) element*/elem) {
		
		var 
			//Private
			layers = {},
			counter=Date.now(),
			handBreak = false,
			state = "idle",
			drawEng = 1,
			sref = this,
			zIndexInc = 0,
			workbench = null,
			
			//Create Dom
			container = document.createElement('div')
		;
		
		container.setAttribute('height', elem.style.height);
		container.setAttribute('width', elem.style.width);
		container.setAttribute('class', 'arCanvasContainer');
		
		elem.appendChild(container);
		
		function _draw() {
			var l;
			if(handBreak == false){
				//Next call
				window.requestAnimFrame(_draw);
				
				//Perform draw
				console.log(state);
				for(l in layers) {
					if (layers.hasOwnProperty(l)) {
						layers[l]._render();
					}
				}
			}
			else{
				state = "stopped";
			}
		}
		
		//Public
		return {
			
			type:"Canvas",
			
			setEngine:function(/*(String) engine*/eng) {
				var i;
				for(i=0; i<engines.length; i++) {
					if(eng == engines[i]) {
						drawEng = i;
						this._applyEngine();
						return true;
					}
				}
				return false;
			},
			
			/*Runtime
			forceDegradeEngine:function() {
				
			},
			*/
			
			addLayer:function(/*(Layer) layer*/layer) {
				layer.parent = this;
				layer.engine = drawEng;
				layer.zIndex = zIndexInc++;
				layers[layer.name]=layer;
				//Add Canvas Dom
				container.appendChild(layer.canvas());
				return layer.name;
			},
			removeLayer:function(/*(String) layer*/layer) {
				if(!(layer instanceof String) && !(typeof layer === "string")) {
					if(layer.name !=undefined){
						delete layers[layer.name];
						//Delete Canvas Dom
						return true;
					}
				}
				else {
					delete layers[layer];
					//Delete Canvas Dom
					return true;
				}
				return false;
			},
			setLayer:function(/*(String) layer*/layer){
				if(!(layer instanceof String) && !(typeof layer === "string")) {
					if(layer.name !=undefined){
						this._activeLayer = layers[layer.name];
						return true;
					}
				}
				else {
					this._activeLayer = layers[layer];
					return true;
				}
				return false;
			},
			
			clear:function(){
				//Warning, this also removes layers! (?)
			},
			
			stopDraw:function(){
				handBreak = true;
				state = "stopping";
			},
			
			startDraw:function(){
				state = "drawing";
				window.requestAnimFrame(_draw);
			},
			
			_testDraw:function(){
				if(handBreak == false){
					//Perform draw
					state = "testing";
					console.log("Test draw:");
					this._clear();
					
				}
			},
			
			_canvas:function(){
				return ctx;
			},
			
			_degradeEngine:function() {
				//Go down one notch, this browser doesn't have it in him.
				if(drawEng <engines.length-1) {
					drawEng++;
					this._applyEngine();
					return true;
				}
				return false;
			},
			
			_applyEngine:function() {
				console.log("Drawing engine changed to '"+engines[drawEng]+"'");
				ctx = canvas.getContext(engines[drawEng]);
				this._testDraw();
			},
			
			_activeLayer : null
		};
	}

	//Allow AMD definition of Graphics
	if (typeof define === "function" && define.amd) {
		define( "ar.core.Graphics", function () { return Graphics; } );
	}

	window.Ar.Graphics = Graphics;
	
	//Prototypes
	Object.prototype.drawCanvas = function(){return Graphics.Canvas(this)};

})(window);