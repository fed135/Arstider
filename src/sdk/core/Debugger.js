/**
 * Debugger
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/*
 * Self-invoked singleton wrapper
 */
;(function(){
	
	/**
	 * Returns a color from green to red, with some yellow/orange in between depending on a given value between limits
	 * @private
	 * @type {function}
	 * @param {number} min Minimum bound
	 * @param {number} max Maximum bound
	 * @param {number} current Value to grade
	 * @param {boolean} reverse Whether to reverse the result
	 * @return {string} RGBA color value
	 */
	function gradeColor(min, max, current, reverse){
		var 
			progress = (current - min)/(max-min),

			f = parseInt("99ff00",16),
			t = parseInt("ff0000",16),

			R1 = f>>16,
			G1 = f>>8&0xFF,
			B1 = f&0xFF,

			R2 = t>>16,
			G2 = t>>8&0xFF,
			B2 = t&0xFF
		;

		if(reverse) progress = 1-progress;
		
    	return "#"+(0x1000000+(Math.round((R2-R1)*progress)+R1)*0x10000+(Math.round((G2-G1)*progress)+G1)*0x100+(Math.round((B2-B1)*progress)+B1)).toString(16).slice(1);
	}

	function applyStyles(list, tag){
		for(var i in list){
			tag.style[i] = list[i];
		}
	}

	var singleton = null;

	/**
	 * Defines the Debugger module
	 */	
	define( "Arstider/core/Debugger", ["Arstider/Keyboard", "Arstider/Viewport", "Arstider/GlobalTimers"], function /** @lends Debugger */ (Keyboard, Viewport, GlobalTimers){
		
		if(singleton != null) return singleton;

		/**
		 * Debugger constructor
		 * Visual profiler backend
		 * @class Debugger
		 * @constructor
		 */
		function Debugger(){
			var list = {
				position:"fixed",
				display:"block",
				minWidth:"60px",
				left:"0px",
				zIndex:9001,
				bottom:"0px",
				padding:"3px",
				fontFamily:"Arial",
				backgroundColor:"rgba(0,0,0,0.7)",
				color:"white",
				cursor:"default",
				textShadow:"0px 1px 0px rgba(0,0,0,1)",
				fontSize:"10px"
			};
			this.profiler = document.createElement("div");
			applyStyles(list, this.profiler);
				

			this.layerStyle = {
				clear:"both"
			};

			this.showFrames = false;
			this.stepTimer = null;
			this.layers = {};
				
			Keyboard.bind("d", "down", function(){thisRef.showFrames = true;});
			Keyboard.bind("d", "up", function(){thisRef.showFrames = false;});
		}
		
		/**
		 * By second step updates the data of the the details and minibar tab
		 * @type {function(this:Debugger)}
		 */
		Debugger.prototype.step = function(){
			singleton.stepTimer = setTimeout(singleton.step, 1000);
			
			singleton.profiler.innerHTML = "";

			var layer, perf;
			for(var l in singleton.layers){
				perf = singleton.layers[l].performance;
				if(perf.frames === 0) perf.frames = 1;
				layer = document.createElement("div");
				applyStyles(singleton.layerStyle, layer);

				layer.innerHTML = [l, ":: <span style='color:#FFFF99;'>FPS:", perf.frames, "/", singleton.layers[l].FPS, "</span>",
									"&nbsp;|&nbsp;",
									"<span style='color:#FF9999;'>Draws:", Math.ceil(perf.draws/perf.frames) ,"/ Entities:",Math.ceil(perf.elements/perf.frames),"</span>",
									"&nbsp;|&nbsp;",
 			                    	"<span style='color:#9999FF;'>Transformations:",Math.ceil(perf.transforms/perf.frames),"</span>",
 			                        "&nbsp;|&nbsp;",
 			                        "<span style='color:#FFFFFF;'>Updates:",perf.updates,"</span>"].join("");  
				singleton.profiler.appendChild(layer);
				perf.clean();                 
			}
			
			singleton.profiler.innerHTML += ("Memory:"+Arstider.getMemory()+"mb | Timers:"+GlobalTimers.list.length);
		};
		
		/**
		 * Draws the defined framesImg
		 * @type {function(this:Debugger)}
		 */
		Debugger.prototype.drawFrames = function(){
			/*if(this.engine.debug && this.showFrames){
				this.engine.context.fillStyle = "rgba(0,0,0,0.3)";
				//this.engine.context.globalAlpha = 0.3;
				var w = (Viewport.maxWidth-Viewport.minWidth)*0.5;
				var h = (Viewport.maxHeight-Viewport.minHeight)*0.5;

				//left
				this.engine.context.fillRect(0,0,w, Viewport.maxHeight);
				//right
				this.engine.context.fillRect(Viewport.maxWidth-w,0,w, Viewport.maxHeight);

				//top
				this.engine.context.fillRect(w,0,Viewport.maxWidth-(w*2), h);
				//right
				this.engine.context.fillRect(w,Viewport.maxHeight-h,Viewport.maxWidth-(w*2), h);

				//console.log("drew frames ", w, ",", h);
			}*/


			//Do as DOM
		};
		
		/**
		 * Prints debug start, starts stepping
		 * @private
		 * @type {function(this:Debugger)}
		 */
		Debugger.prototype.init = function(){
			Viewport.container.appendChild(this.profiler);
			this.step();
		};
		
		singleton = new Debugger();
		return singleton;
	});
})();	