;(function(){
		
	var singleton=null;
	
	function notInQueue(queue, key){
		var i = queue.length-1;
		for(i; i>=0; i--){
			if(queue[i].name === key) return false;
		}
		return true;
	}
	
	/**
	 * AMD Closure
	 */	
		define( "Arstider/Preloader", ["Arstider/Events"], function(Events) {
		
			if(singleton != null) return singleton;
			
			/**
			 * Creates a singleton instance of Preloader.
			 *
			 * @constructor
			 * @this {Preloader}
			 * @param {Engine} engine The game engine reference
			 */
			
			function Preloader(){
				this.queue = [];
				this.gracePeriodTimer = null;
				
				this.clickToDismiss = false;
				
				this.name = "_Arstider_Preloader";
				this._screen = null;
				
				this._checks = 0;
					
				this.update = function(p,c){}; /*This get overriden by game main for handling progress*/
			}
				
			Preloader.prototype.set = function(name, clickReq){
				Events.broadcast("Preloader.showPreloader", name);
				this.queue = [];
				this._checks = 0;
				this.clickToDismiss = clickReq || false;
			};
			
			Preloader.prototype.setScreen = function(screen){
				this._screen = new screen();
			};
				
			Preloader.prototype.progress = function(key, value, force){
				var
					i,
					len = this.queue.length,
					thisRef = this
				;
				
				if(value > 0 && !force){
					setTimeout(function(){
						thisRef.progress.apply(thisRef, [key, value, true]);
					}, 100);
					return;
				}
				
				if(value == undefined || value === 0){
					if(notInQueue(this.queue, key)){
						this.queue.push({
							name:key,
							loaded:value
						});
					}
				}
				else{
					for(i = len-1; i>=0; i--){
						if(this.queue[i].name == key){
							this.queue[i].loaded = value;
							break;
						}
					}
				}
				
				var currPcent = this.totalPercent();
				if(this._screen){
					this._screen.update(currPcent, this.clickToDismiss);
				}
				if(currPcent >= 100){
					this.checkComplete(true);
				}
			};
				
				
			Preloader.prototype.checkComplete = function(fromProgress){
				if(singleton._checks == 0 && fromProgress){
					singleton._checks = 1;
					singleton.gracePeriodTimer = setTimeout(singleton.checkComplete, 100);
				}
				else if(!fromProgress && singleton._checks == 1){
					if(singleton.totalPercent() < 100){
						singleton._checks = 0;
					}
					else{
						singleton.complete();
					}
				}
				
			};
				
			Preloader.prototype.totalPercent = function(){
				var
					i,
					len = this.queue.length,
					total = 0
				;
				
				for(i = len-1; i>=0; i--){
					total += this.queue[i].loaded;
				}
					
				return Math.floor(total/len);
			};
				
			Preloader.prototype.reset = function(){
				//this.canvas.removeEventListener('click', this.hide);
				this.queue = [];
				this._checks = 0;
			};
				
			Preloader.prototype.complete = function(){
				//if(singleton.clickToDismiss){
					//singleton.canvas.addEventListener('click', singleton.hide);
				//}
				//else{
					singleton.hide();
				//}
			};
			
			Preloader.prototype.hide = function(){
				Events.broadcast("Preloader.loadingCompleted");
				this.reset();
			};
			
			singleton = new Preloader();
			return singleton;
		});
	
})();