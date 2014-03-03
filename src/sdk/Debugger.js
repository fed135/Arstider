;(function(){
	
	//Get all canvas elements
	function getCanvasElements(engine, target){
		var ret = [], i = 0, t = (target && target.children)?target:engine.captureTarget;
		if(t && t.children){
			for(i; i<t.children.length; i++){
				ret.push(t.children[i]);
				if(t.children[i].children){
					ret = ret.concat(window.getCanvasElements(t.children[i]));
				}
			}
		}
		return ret;
	}
	
	//Get specific canvas element
	function findCanvasElement(name, target){
		var ret = [], i = 0, t = (target && target.children)?target:thisRef.captureTarget;
		if(t && t.children){
			for(i; i<t.children.length; i++){
				if(t.children[i].name === name){
					ret.push(t.children[i]);
				}
				if(t.children[i].children && t.children[i].children.length > 0){
					ret = ret.concat(window.findCanvasElement(name, t.children[i]));
				}
			}
		}
		
		if(ret.length == 1){
			return ret[0];
		}
		
		return ret;
	}
	
	function debugDraw(target){
		var ctx = null;
			win = document.getElementById("debugWindow");
		if(!win){
			win = document.createElement('canvas');
			win.width=300;
			win.height=300;
			win.id = "debugWindow";
			win.style.height = "300px";
			win.style.width = "300px";
			win.style.position = "absolute";
			win.style.display = "block";
			win.style.backgroundColor = "green";
			win.style.bottom = "0px";
			win.style.right = "0px";
			win.style.zIndex = 999;
			document.body.appendChild(win);
		}
		ctx = win.getContext('2d');
		ctx.clearRect(0,0,300,300);
		if(target.data){
			ctx.drawImage(target.data, 0,0,300,300);
		}
	}
	
	/**
	 * AMD Closure
	 */	
		define( "Arstider/Debugger", [
		                   "Arstider/Buffer", 
		                   "Arstider/Events",
		                   "Arstider/core/Performance"
		                   ], 
		function (Buffer, Events,Performance){

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
				
				if(this.engine.container){
					
					this.framesImg = new Image();
					this.framesImg.src = this.engine.container.folderPath + "media\/images\/backgrounds\/iOSframes.png";
					
					window.addEventListener('keydown', function(e){
						if(e.keyCode == "68"){
							thisRef.showFrames = true;
						}
					});
					
					window.addEventListener('keyup', function(e){
						if(e.keyCode == "68"){
							thisRef.showFrames = true;
						}
					});
				}
				
				//Global access debug methods
				window.arstider_getCanvasElements = window.Arstider_getCanvasElements = function(){getCanvasElements(thisRef.engine, thisRef)};
				window.arstider_findCanvasElement = window.Arstider_findCanvasElement = function(target){findCanvasElement(target, thisRef.engine.currentScreen);};
				window.arstider_debugDraw = window.Arstider_debugDraw = function(target){debugDraw(target);};
				window.arstider_debugBroadcast = window.Arstider_debugBroadcast = Events.broadcast;
			}
			
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