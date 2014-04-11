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
		//return extremes
		if((current < min && !reverse) || (current > max && reverse)) return "rgba(255, 0, 0, 1)";
		if((current > max && !reverse) || (current < min && reverse)) return "rgba(0, 255, 0, 1)";
		
		var red, green, inc;
		
		if(reverse){
			red = Math.round(((current - min)/(max-min)) * 255);
			green = 255 - Math.round(((current - min)/(max-min)) * 255);
		}
		else{
			red = 255 - Math.round(((current - min)/(max-min)) * 255);
			green = Math.round(((current - min)/(max-min)) * 255);
		}
		
		inc = Math.floor(Math.max(red-(255-red), 0)*0.6 + Math.max(green-(255-green))*0.6);
		
		return "rgba("+(red+inc)+","+(green+inc)+",0,1)";
	}
	
	/**
	 * Defines the Debugger module
	 */	
	define( "Arstider/Debugger", ["Arstider/core/Performance","Arstider/Keyboard","Arstider/core/Profiler"], function (Performance, Keyboard, Profiler){

		/**
		 * Debugger constructor
		 * @constructor
		 * @param {Object} eng Engine Reference
		 */
		function Debugger(eng){
			this.engine = eng;
			
			this.profiler = Profiler;
			document.body.appendChild(this.profiler);
				
			this.showFrames = false;
			this.stepTimer = null;
			
			this.loggedFrames = 0;
				
			var thisRef = this;
					
			this.framesImg = new Image();
				
				
			Keyboard.bind("d", "down", function(){thisRef.showFrames = true;});
			Keyboard.bind("d", "up", function(){thisRef.showFrames = false;});
		}
		
		/**
		 * Defines the frame asset to display along the debug outlines (visible zone)
		 * @type {function(this:Debugger)}
 		 * @param {string} e The string of the asset
		 */	
		Debugger.prototype.setFramesAsset = function(e){
			this.framesImg.src = e;
		};
		
		/**
		 * By second step updates the data of the the details and minibar tab
		 * @type {function(this:Debugger)}
		 */
		Debugger.prototype.step = function(){
			var thisRef = this;
			this.stepTimer = setTimeout(function(){thisRef.step.apply(thisRef);}, 1000);
			
			this.loggedFrames++;
			
			if(!this.profiler.collapsed){
				
				if(this.profiler.currentTab === "draw"){
					
					if(Performance.frames > 0){
						var newCol = this.createColumn("second_"+this.loggedFrames);
						
						var numEntities = Math.ceil((Performance.elements - Performance.draws)/Performance.frames);
						var numDraws = Math.ceil(Performance.draws/Performance.frames);
						var numTransforms = Math.ceil(Performance.transforms/Performance.frames);
						var numComposition = Math.ceil((Performance.composition || 0)/Performance.frames);
						
						var total = numEntities + numDraws + numTransforms + numComposition;
						var currPos = 0;
						var maxHeight = 300;
						
						var entitiesSection = this.createSection(numEntities + " empty element(s)", 0, Math.round((numEntities/total)*maxHeight), "rgba(150,150,190,1)");
						currPos += Math.round((numEntities/total)*maxHeight);
						newCol.appendChild(entitiesSection);
						
						var drawsSection = this.createSection(numDraws + " draw(s)", currPos, Math.round((numDraws/total)*maxHeight), "rgba(200,200,50,1)");
						currPos += Math.round((numDraws/total)*maxHeight);
						newCol.appendChild(drawsSection);
						
						var transformSection = this.createSection(numTransforms + " transformation(s)", currPos, Math.round((numTransforms/total)*maxHeight), "#f80");
						currPos += Math.round((numTransforms/total)*maxHeight);
						newCol.appendChild(transformSection);
						
						
						var compSection = this.createSection(numComposition + " composion mode change(s)", currPos, Math.round((numComposition/total)*maxHeight), "#f03");
						currPos += Math.round((numComposition/total)*maxHeight);
						newCol.appendChild(compSection);
						
						var fpsBar = document.createElement("div");
						fpsBar.title = Performance.frames;
						fpsBar.style.width = "100%";
						fpsBar.style.height = "4px";
						fpsBar.style.backgroundColor = gradeColor(30, 65, Performance.frames);
						fpsBar.style.borderBottom = "1px solid black";
						fpsBar.style.top = (300 - Math.round((Performance.frames/65)*150)) + "px";
						fpsBar.style.position = "absolute";
						fpsBar.style.display = "block";
						fpsBar.style.zIndex = "99999";
						newCol.appendChild(fpsBar);
						
						this.profiler.detailsTab.appendChild(newCol);
					}
				}
				else{
					this.profiler.detailsTab.innerHTML = "";
					
					var sizeColor;
					var size;
					var buffers = Arstider.bufferPool;
					var bar;
					for(var i in buffers){
						size = buffers[i].getMemory() >> 20;
						bar = this.createBar(i, size, gradeColor(0.25, 12, size, true));
						this.profiler.detailsTab.appendChild(bar);
					}
				}
			}
			else{
				if(this.profiler.detailsTab) this.profiler.detailsTab.innerHTML = "";
			}
			
			this.profiler.minibar.innerHTML = [
 			                           //FPS
 			                           "<span style='color:#FFFF99;'>FPS:",Performance.frames ,"</span>",
 			                           "&nbsp;|&nbsp;",
 			                           //Buffer Memory
 			                           "<span style='color:#99FF99;'>Memory:",Arstider.getMemory(),"</span>",
 			                           "&nbsp;|&nbsp;",
 			                           //Drawn Objects
 			                           "<span style='color:#FF9999;'>Draws:", Math.ceil(Performance.draws/Performance.frames) ,"/ Entities:",Math.ceil(Performance.elements/Performance.frames),"</span>",
 			                           "&nbsp;|&nbsp;",
 			                           //Transformations
 			                           "<span style='color:#9999FF;'>Transformations:",Math.ceil(Performance.transforms/Performance.frames),"</span>",
 			                           "&nbsp;|&nbsp;",
 			                           //Num Buffers
 			                           "<span style='color:#FFFFFF;'>Buffers:",Arstider.countBuffers(),"</span>",
 			                           "&nbsp;|&nbsp;",
 			                           //Skips
 			                           "<span style='color:#FF0000;'>D-",Performance.skippedDraw,"</span>"].join("");
			
			Performance.update();
		};
		
		/**
		 * Draws the defined framesImg
		 * @type {function(this:Debugger)}
		 */
		Debugger.prototype.drawFrames = function(){
			if(this.engine.debug && this.showFrames){
				this.engine.context.drawImage(this.framesImg,0,0,1136,672);
			}
		};
		
		/**
		 * Returns a column to use in the visual profiler
		 * @private
		 * @type {function(this:Debugger)}
		 * @param {string} name The name of the column
		 * @return {HTMLDivElement}
		 */
		Debugger.prototype.createColumn = function(name){
			var ret = document.createElement("div");
			ret.id = name;
			ret.style.width = "4px";
			ret.style.height = "300px";
			ret.style.overflow = "hidden";
			ret.style.cssFloat = "left";
			ret.style.right = "0px";
			ret.style.display = "block";
			ret.style.position = "relative";
			ret.style.backgroundColor = "#FFFFFF";
			
			return ret;
		};
		
		/**
		 * Returns a section to use in the visual profiler
		 * @private
		 * @type {function(this:Debugger)}
		 * @param {string} title The name of the section
		 * @param {number} top The starting y of the section
		 * @param {number} height The height of the section
		 * @param {string} color The color of the section
		 * @return {HTMLDivElement}
		 */
		Debugger.prototype.createSection = function(title, top, height, color){
			var ret = document.createElement("div");
			ret.title = title;
			ret.style.width = "100%";
			ret.style.height = height + "px";
			ret.style.backgroundColor = color;
			ret.style.top = top + "px";
			ret.style.position = "absolute";
			ret.style.display = "block";
			return ret;
		};
		
		/**
		 * Returns a bar to use in the visual profiler
		 * @private
		 * @type {function(this:Debugger)}
		 * @param {string} name The name of the bar
		 * @param {number} size The size of the bar
		 * @param {string} color The color of the bar
		 * @return {HTMLDivElement}
		 */
		Debugger.prototype.createBar = function(name, size, color){
			var ret = document.createElement("div");
			ret.title = name + ":" + size + "mb";
			ret.style.width = (25 +((size/24)*75)) + "%";
			ret.style.height = "16px";
			ret.style.backgroundColor = color;
			ret.style.clear = "both";
			ret.style.marginBottom = "3px";
			ret.style.position = "relative";
			ret.style.overflow = "hidden";
			ret.style.display = "block";
			ret.style.paddingTop = "4px";
			ret.style.color = "white";
			ret.style.textShadow = "1px 1px 0px rgba(0,0,0,0.7)";
			ret.innerHTML = name;
			return ret;
		};
		
		/**
		 * Prints debug start, starts stepping
		 * @private
		 * @type {function(this:Debugger)}
		 */
		Debugger.prototype.init = function(){
			console.log("New instance of the "+this.engine.name + " Engine.");
			console.log("Version "+this.engine.version);
			console.log("DEBUG MODE.");
			console.log("##################################################");
			
			this.step(this);
		};
			
		return Debugger;
	});
})();	