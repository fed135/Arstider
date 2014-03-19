/**
 * AMD Closure - Singleton
 */	
;(function(){
	
	//Set these in main/index
	var singleton = null;

	define( "Arstider/Sound", ["howler", "Arstider/GameData", "Arstider/Browser"], function (howlerreq, GameData, Browser) {
		
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
			
			this.mobileSound = null;
			this.mobileInPipe = false;
			this._pendingSound = null;
		}
		
		Sound.prototype.proxyPipe = function(){
			return singleton._pipeSound();
		};
		
		Sound.prototype.init = function(url){
			//Setup variables, preload and play first song
			var 
				i
			;
			
			var sprite = {empty:[0,1]};
			
			for(i in this.sounds){
				sprite[i] = [this.sounds[i].offset, this.sounds[i].duration];
			}
			
			this.sounds['empty'] = {};
			
			this.mobileSound = new Howl({
				urls:[url+".mp3",url+".ogg"],
				sprite:sprite,
				onend:this.soundEnd
			});
				
			this.play('empty', true);
		};
		
		Sound.prototype._soundEnd = function(id, ex){
			console.log("Sound ended: " + id);
		};
		
		Sound.prototype.setSounds = function(url, obj){
			if(obj instanceof String || typeof obj == "string"){
				var thisRef = this;
				require(["textLib!./"+obj],function(file){
					console.log(url);
					thisRef.sounds = JSON.parse(file);
					thisRef.init(url);
				});
			}
			else{
				this.sounds = obj;
				this.init(url);
			}
		};
		
		Sound.prototype._pipeSound = function(){
			Arstider.pendingSound = null;
			this.mobileInPipe = true;
			if(this._pendingSound != null){
				this.play(this._pendingSound, true);
				this._pendingSound = null;
			}
		};
			
		Sound.prototype.preload = function(id, play, keepPlaying, callback){
			this.play(id, keepPlaying, callback);
		};
		
		Sound.prototype.play = function(id, keepPlaying, callback){
			if(GameData.get("muted", true) != "true"){
				if(singleton.mobileInPipe){
					if(!keepPlaying){
						singleton.mobileSound.pause();
					}
						
					singleton.mobileSound.play(id);
					if(singleton.sounds[id].loop === true){
						setTimeout(function(){
							singleton.play(id, keepPlaying, callback);
						},singleton.sounds[id].duration+100);
					}
					if(callback){
						setTimeout(callback, singleton.sounds[id].duration+100);
					}
				}
				else{
					Arstider.pendingSound = id;
					singleton._pendingSound = id;
				}
			}
		};
		
		Sound.prototype.stop = function(id){
			this.mobileSound.pause(id);
		};
		
		Sound.prototype.pause = function(id){
			this.mobileSound.pause(id);
		};
			
		Sound.prototype.setVolume = function(id, val){
			this.mobileSound.volume(val, id);
		};
			
		Sound.prototype.killSounds = function(){
			this.mobileSound.pause();
		};
	
		singleton = new Sound();
		return singleton;
	});
})();