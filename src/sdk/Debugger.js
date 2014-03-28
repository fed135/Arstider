;(function(){
	
	/**
	 * AMD Closure
	 */	
		define( "Arstider/Debugger", [
		         "Arstider/Buffer", 
		                   "Arstider/core/Performance"
		                   ], 
		function (Buffer,Performance){

			function Debugger(eng){
				this.engine = eng;
				
				this.profiler = document.createElement("div");
				this.profiler.id = "fpsCounter";
				this.profiler.style.position = "absolute";
				this.profiler.style.display = "block";
				this.profiler.style.left = "0px";
				this.profiler.style.zIndex = "9001";
				this.profiler.style.top = "0px";
				this.profiler.style.padding = "3px";
				this.profiler.style.fontSize = "10px";
				this.profiler.style.fontFamily = "Arial";
				this.profiler.style.backgroundColor = "black";
				this.profiler.style.color = "white";
				document.body.appendChild(this.profiler);
				
				this.showFrames = false;
				this.stepTimer = null;
				
				var thisRef = this;
					
				this.framesImg = new Image();
				
					
				window.addEventListener('keydown', function(e){
					if(e.keyCode == "68"){
						thisRef.showFrames = true;
					}
				});
					
				window.addEventListener('keyup', function(e){
					if(e.keyCode == "68"){
						thisRef.showFrames = false;
					}
				});
			}
			
			Debugger.prototype.setFramesAsset = function(e){
				this.framesImg.src = e;
			};
			
			Debugger.prototype.step = function(ref){
				ref.stepTimer = setTimeout(function(){ref.step(ref);}, 1000);
				
				ref.profiler.innerHTML = [
				                           //FPS
				                           "<span style='color:#FFFF99;'>FPS:",Performance.frames , "/" , Performance.topFrames ,"</span>",
				                           "&nbsp;|&nbsp;",
				                           //Buffer Memory
				                           "<span style='color:#99FF99;'>Memory:",Buffer.getMemInfo(),"</span>",
				                           "&nbsp;|&nbsp;",
				                           //Drawn Objects
				                           "<span style='color:#FF9999;'>Entities:", Math.ceil(Performance.draws/Performance.frames) ,"/",Math.ceil(Performance.elements/Performance.frames),"</span>",
				                           "&nbsp;|&nbsp;",
				                           //Transformations
				                           "<span style='color:#9999FF;'>Transformations:",Math.ceil(Performance.transforms/Performance.frames),"</span>",
				                           "&nbsp;|&nbsp;",
				                           //Num Buffers
				                           "<span style='color:#FFFFFF;'>Buffers:",Buffer.count(),"</span>",
				                           "&nbsp;|&nbsp;",
				                           //Skips
				                           "<span style='color:#FF0000;'>U-",Performance.skippedUpdate,",D-",Performance.skippedDraw,"</span>",
				                           "&nbsp;|&nbsp;",
				                           //Chcklist
				                           "<a href='checklist.html' style='color:magenta;' target='_blank'>Checklist</a>"].join("");
				
				Performance.update();
			};
			
			Debugger.prototype.drawFrames = function(){
				if(this.showFrames){
					this.engine.context.drawImage(this.framesImg,0,0,1136,672);
				}
			};
			
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