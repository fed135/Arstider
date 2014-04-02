/**
 * AMD Closure - Singleton
 */	
;(function(){
	
	//Set these in main/index
	var singleton = null;

	define( "Arstider/Sound", ["howler", "Arstider/Browser", "Arstider/Viewport"], function (howlerreq, Browser,Viewport) {
		
		if(singleton != null){return singleton;}
		
		/**
		 * Creates an instance of Font.
		 *
		 * @constructor
		 * @this {Sound}
		 */
		function Sound(){
			//Prefered extension
			this.ext = ".mp3";
			//List of all the sounds
			this.sounds = {};
			//Global volume ref - mobile
			this.volumeRef = 1;
			
			this.handle = null;
			this.queue = [];
			
			this.fileInPipe = false;
		}
		
		Sound.prototype.init = function(url){
			//Setup variables, preload and play first song
			var 
				i,
				sprite = {empty:[0,1]}
			;
			
			for(i in this.sounds){
				sprite[i] = [this.sounds[i].offset, this.sounds[i].duration];
			}
			
			this.sounds['empty'] = {};
			
			this.handle = new Howl({
				urls:[url+".mp3",url+".ogg"],
				sprite:sprite,
				onend:this._soundEnd
			});
			
			if(Browser.isMobile) Viewport.tag.addEventListener("touchstart", singleton._queueFile);
			else singleton.fileInPipe = true;
		};
		
		Sound.prototype._queueFile = function(){
			singleton.fileInPipe = true;
			singleton.play('empty', true);
			if(singleton.queue.length > 0){
				for(var i = 0; i<singleton.queue.length; i++){
					singleton.play(singleton.queue[i].id, singleton.queue[i].callback);
				}
			}
			singleton.queue = [];
			
			Viewport.tag.removeEventListener("touchstart", singleton._queueFile);
		};
		
		Sound.prototype._soundEnd = function(id, ex){
			if(Arstider.verbose > 2) console.warn("Arstider.Sound.ended: " + id);
		};
		
		Sound.prototype.setSounds = function(url, obj, callback){
			if(obj instanceof String || typeof obj == "string"){
				var thisRef = this;
				require(["textLib!./"+obj],function(file){
					thisRef.sounds = JSON.parse(file);
					if(callback) callback();
					thisRef.init(url);
				});
			}
			else{
				this.sounds = obj;
				this.init(url);
			}
		};
		
		Sound.prototype.play = function(id, callback){
			if(singleton.fileInPipe){
				singleton.handle.play(id);
				if(singleton.sounds[id].loop === true){
					setTimeout(function(){
						singleton.play(id, callback);
					},singleton.sounds[id].duration+100);
				}
				if(callback){
					setTimeout(callback, singleton.sounds[id].duration+100);
				}
			}
			else{
				singleton.queue.push({id:id, callback:callback});
			}
		};
		
		Sound.prototype.stop = function(id){
			this.handle.pause(id);
		};
		
		Sound.prototype.pause = function(id){
			this.handle.pause(id);
		};
			
		Sound.prototype.setVolume = function(id, val){
			this.handle.volume(val, id);
		};
			
		Sound.prototype.killSounds = function(){
			this.handle.pause();
		};
	
		singleton = new Sound();
		return singleton;
	});
})();