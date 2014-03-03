/**
 * AMD Closure - Singleton
 */	
;(function(){
	
	//Set these in main/index
	var singleton = null;

	define( "Arstider/Sound", ["libs/soundmanager2-nodebug-jsmin.js", "sdk/GameData"], function (sm2, GameData) {
		
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
			return soundRef._pipeSound();
		}
		
		Sound.prototype.init = function(){
			//Setup variables, preload and play first song
			var 
				i,
				first = '',
				tag,
				thisRef = this
			;
				
			if(window.GameContainer.browserInfo.touchDevice){
				var url = window.GameContainer.folderPath + 'media/music/sprite';
				var sprite = {empty:[0,1]};
				
				for(i in this.sounds){
					if(i && !(this.sounds[i] instanceof Function)){
						sprite[i] = [this.sounds[i].offset, this.sounds[i].duration];
					}
				}
				
				this.sounds['empty'] = {};
				
				this.mobileSound = new Howl({
					urls:[url+".mp3",url+".ogg"],
					sprite:sprite,
					onend:this.soundEnd
				});
				
				this.play('empty', true);
			}
			else{
				//Desktop Init
				soundManager.setup({
					url: window.GameContainer.folderPath + 'media/swf/soundmanager2_flash9.swf',
					useHTML5Audio: true,
					flashVersion: 9,
					onready: function() {
						for(i in thisRef.sounds){
							if(thisRef.sounds[i].def === true){
								first = i;
								break;
							}
						}
						if(first != ''){
							thisRef.play(first);
						}
					}
				});
			}
		};
		
		Sound.prototype._soundEnd = function(id, ex){
			console.log("Sound ended: " + id);
			console.log(ex);
		};
		
		Sound.prototype.setSounds = function(obj){
			this.sounds = obj;
			this.init();
		};
		
		Sound.prototype._pipeSound = function(){
			console.log("piping sound!!!");
			window.GameContainer.pendingSound = null;
			this.mobileInPipe = true;
			if(this._pendingSound != null){
				this.play(this._pendingSound, true);
				this._pendingSound = null;
			}
		};
			
		Sound.prototype.preload = function(id, play, keepPlaying, callback){
			var thisRef = this;
			if(!window.GameContainer.browserInfo.touchDevice){
				if(this.sounds[id].preloaded !== true){
					
					this.sounds[id].handle = soundManager.createSound({
						id: id,
						url: window.GameContainer.folderPath +'media/music/'+id+thisRef.ext,
						autoLoad: true,
						autoPlay: false,
						onload: function() {
							thisRef.sounds[id].preloaded = true;
							if(play === true){
								thisRef.play(id, keepPlaying, callback);
							}
						}
					});
				}
				else{
					if(play){
						this.play(id, keepPlaying, callback);
					}
				}
			}
		};
		
		Sound.prototype.play = function(id, keepPlaying, callback){
			if(GameData.get("muted", true) != "true"){
				if(window.GameContainer.browserInfo.touchDevice){
					if(soundRef.mobileInPipe){
						if(!keepPlaying){
							soundRef.mobileSound.pause();
						}
						
						soundRef.mobileSound.play(id);
						if(soundRef.sounds[id].loop === true){
							setTimeout(function(){
								soundRef.play(id, keepPlaying, callback);
							},soundRef.sounds[id].duration+100)
						}
						if(callback){
							setTimeout(callback, soundRef.sounds[id].duration+100);
						}
					}
					else{
						window.GameContainer.pendingSound = id;
						soundRef._pendingSound = id;
					}
				}
				else{
					if(soundRef.sounds[id].preloaded !== true){
						soundRef.preload(id, true, keepPlaying, callback);
						return;
					}
					
					if(!keepPlaying){
						soundRef.killSounds();
					}
					
					var sound = soundRef.sounds[id].handle;
					var thisRef = soundRef;
					if(sound && sound.play){
						sound.play({
					    	onfinish: function() {
						      	if(thisRef.sounds[id].loop === true){
						      		thisRef.play(id,true);
						      	}
						      	if(callback){
						      		callback();
						      	}
					    	}
					  	});
					}
				}
			}else{
				if(callback){
					callback();
				}
			}
		};
		
		Sound.prototype.stop = function(id){

			if(window.GameContainer.browserInfo.touchDevice){
				this.mobileSound.pause(id);
			}
			else{
				if(this.sounds[id].handle != undefined){	
					this.sounds[id].handle.stop();
				}else{
					console.warn("The sound: "+id+" is not defined");
				}
			}
		};
		
		Sound.prototype.pause = function(id){
			if(window.GameContainer.browserInfo.touchDevice){
				this.mobileSound.pause(id);
			}
			else{
				this.sounds[id].handle.pause();
			}
		};
			
		Sound.prototype.setVolume = function(id, val){
			if(window.GameContainer.browserInfo.touchDevice){
				this.mobileSound.volume(val, id);
			}
			else{
				if(val == undefined){
					val = id;
					
					//Set global
					soundManager.setVolume(val);
					
					//Now for mobile...
					this.volumeRef = val;
				}
				else{
					//Set for a specific
					this.sounds[id].handle.setVolume(val);
				}
			}
		};
			
		Sound.prototype.playFromTo = function(id, posA, posB){
			if(!window.GameContainer.browserInfo.touchDevice){
				this.breakLoop = true;
				this.killSounds();
				var sound = this.sounds[id].handle;
				if(sound && sound.play){
					sound.play({
						from:posA,
				    	to:posB
				  	});
					sound.setPosition(posA);
				}
			}
		};
			
		Sound.prototype.loopFromTo = function(id, posA, posB){
			if(!window.GameContainer.browserInfo.touchDevice){
				this.killSounds();
				var sound = this.sounds[id].handle;
				var thisRef = this;
				if(sound && sound.play){
					sound.play({
						from:posA,
				    	to:posB,
				    	onstop:function(){
				    		if(!thisRef.breakLoop){
				    			thisRef.loopFromTo(id, posA, posB);
				    		}
				    		else{
				    			thisRef.breakLoop = false;
				    		}
				    	}
				  	});
					sound.setPosition(posA);
				}
			}
		};
			
		Sound.prototype.killSounds = function(){
			if(window.GameContainer.browserInfo.touchDevice){
				
				console.log("killsound called!!!");
				
				this.mobileSound.pause();
			}
			else{
				soundManager.stopAll();
			}
		};
	
		singleton = new Sound();
		return singleton;
	});
})(window);