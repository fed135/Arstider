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
		define( "Arstider/Preloader", ["Arstider/Events", "Arstider/DisplayObject"], function (Events, DisplayObject) {
		
			if(singleton != null){return singleton;}
			
			/**
			 * Creates a singleton instance of Preloader.
			 *
			 * @constructor
			 * @this {Preloader}
			 * @param {Engine} engine The game engine reference
			 */
			//Preloader.Inherit(DisplayObject);
			function Preloader(){
				//this.Inherit(DisplayObject, "Arstider_Preloader");
				
				this.queue = [];
				this.gracePeriodTimer = null;
				
				this.clickToDismiss = false;
					
				this.update = function(p,c){}; /*This get overriden by game main for handling progress*/
			}	
				
			Preloader.prototype.set = function(name, clickReq){
				Events.broadcast("showPreloader", name);
				this.queue = [];
				this.clickToDismiss = clickReq || false;
			};
				
			Preloader.prototype.progress = function(key, value){
				var
					i,
					len = this.queue.length
				;
				
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
				this.update(currPcent, this.clickToDismiss);
				if(currPcent >= 100){
					this.checkComplete();
				}
			};
				
				
			Preloader.prototype.checkComplete = function(){
				if(singleton.gracePeriodTimer == null){
					singleton.gracePeriodTimer = setTimeout(singleton.complete, 100);
				}
				else{
					clearTimeout(singleton.gracePeriodTimer);
					singleton.checkComplete();
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
				Events.broadcast("loadingCompleted");
				this.reset();
			};
			
			singleton = new Preloader();
			return singleton;
		});
	
})();