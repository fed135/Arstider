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

//Declare Arstider Object if not already defined.
//NOTE:Thus far, we do not need the main package for this package to work properly, so developers can actually just import this only.
if(window.Ar == undefined) {
	window.Ar = { };
}
//Pick up Animation Frame handler, depending on browser engine.
(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

//Define Current Package.
Ar.Graphics = {version:"0.0.1"};


/**
* @Name MovieClip
* 
* @Description Your basic display object. Pretty similar to the Flash element as it can contain graphic data and also MovieClips.
*/
Ar.Graphics.MovieClip = function(/*(String) Name*/name,/*(Object) Proprieties*/props) {
	
	//Private 
	var id = Date.now();
	
	if(!(name instanceof String) && !(typeof name === "string")) {
		//unregistered
		props = name;
		name = id;
	}
	
	//Public
	return {
		name:name,
		id:id,
		
	};
}


/**
* @Name Layer
* 
* @Description This is where MovieClips are assembled and flatten. 
*	Layers are stacked one over another, like in Photoshop or Flash, so to add a z-index. 
*	Beware, it cannot be transformed like the MovieClip.
*/
Ar.Graphics.Layer = function() {
	
}

/**
* @Name Canvas
* 
* @Description This is where layers are finaly rendered (flat) onto the scene with the appropriate engine.
*/
Ar.Graphics.Canvas = function(/*(Dom Object) element*/elem) {
	
	//Defines
	var engines=["webgl","2d"/*,"dom"*/];
	
	//Private
	var layers = {};
	var counter=Date.now();
	var handBreak = false;
	var state = "idle";
	var drawEng = 0;
	var sref = this;
	
	//Create canvas
	var canvas = document.createElement('canvas');
	canvas.setAttribute('height', elem.style.height);
	canvas.setAttribute('width', elem.style.width);
	elem.appendChild(canvas);
	
	var ctx = canvas.getContext(engines[drawEng]);
	
	//Public
	return {
		
		type:"canvas",
		
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
			layers[layer.name]=layer;
			return layers[layer.name];
		},
		removeLayer:function(/*(String) layer*/layer) {
			if(!(layer instanceof String) && !(typeof layer === "string")) {
				if(layer.name !=undefined){
					delete layers[layer.name];
					return true;
				}
			}
			else {
				delete layers[layer];
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
		
		startDraw:function(){
			state = "drawing";
			requestAnimationFrame(sref._draw);
		},
		
		stopDraw:function(){
			handBreak = true;
			state = "stopping";
		},
		
		//No touching outside of Canvas scope!
		
		_draw:function(){
			if(handBreak == false){
				//Perform draw
				console.log(state);
				//Next call
				requestAnimationFrame(sref._draw);
			}
			else{
				state = "stopped";
			}
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

//Prototypes
Object.prototype.drawCanvas = function(){return Ar.Graphics.Canvas(this)};

