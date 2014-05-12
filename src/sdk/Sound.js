/**
 * Sound
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
	var 
		/**
		 * Singleton static
		 * @private
		 * @type {Sound|null}
		 */
		singleton = null
	;
	
	/**
	 * Defines the Sound module
	 */
	define( "Arstider/Sound", ["Arstider/Browser", "Arstider/Viewport", "Arstider/Request", "Arstider/Timer"], function (Browser, Viewport, Request, Timer) {
		
		if(singleton != null) return singleton;
		
		/**
		 * Sound constructor.
		 * @constructor
		 * @this {Sound}
		 */
		function Sound(){
			/**
			 * Individual tracks Sounds list
			 * @type {Object}
			 */
			this.tracks = {};
			/**
			 * Sprited sfx sound list
			 * @type {Object}
			 */
			this.sounds = {};
			/**
			 * Sound queue (while waiting for sound file to enter the buffer)
			 * @private
			 * @type {Array}
			 */
			this._queue = [];
			/**
			 * Indicates if the file is in the buffer
			 * @private
			 * @type {boolean}
			 */
			this._fileInPipe = false;
			
			/**
			 * List of callbacks, per sound instance
			 * @private
			 * @type {Object}
			 */
			this._callbacks = {};
		}
		
		/**
		 * Starts howler and parses the sound object
		 * @type {function(this:Sound)}
		 * @param {string} url The url of the sound sprite
		 */
		Sound.prototype._init = function(url){
			/**
			 * Check Howler presence
			 */
			if(!Howl){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound._init: sounds disabled, Howler not loaded");
				return;
			}
			
			var 
				i,
				sprite = {empty:[0,1]}
			;
			
			for(i in this.sounds){
				sprite[i] = [this.sounds[i].offset, this.sounds[i].duration];
			}
			
			this.sounds['empty'] = {};
			
			/**
			 * Preload the sound sprite
			 */
			var ext = ".mp3";
			if(Browser.name == "firefox") ext = ".ogg";
			
			var r = new Request({
				url:url+ext,
				caller:this,
				cache:false,
				track:true
			}).send();
			
			this.sounds._handle = new Howl({
				urls:[url+".mp3",url+".ogg"],
				sprite:sprite,
				onend:singleton._removeInstance
			});
			
			if(Browser.isMobile) Viewport.tag.addEventListener("touchstart", singleton._queueFile);
			else singleton._fileInPipe = true;
		};
		
		/**
		 * Puts the file in the buffer (on touch input)
		 * @private
		 * @type {function(this:Sound)}
		 */
		Sound.prototype._queueFile = function(){
			singleton._fileInPipe = true;
			
			if(singleton._queue.length > 0){
				for(var i = 0; i<singleton._queue.length; i++){
					singleton.play(singleton._queue[i].id, singleton._queue[i].props);
				}
			}
			else singleton.play('empty');
			singleton._queue = [];
			
			Viewport.tag.removeEventListener("touchstart", singleton._queueFile);
		};
		
		/**
		 * Defines the list of sounds and sprite informations
		 * @type {function(this:Sound)}
		 * @param {string} url The url of the sound file
		 * @param {string|Object} obj The sound sprite url/object
		 * @param {function} callback Optional callback function, when sounds are setupped
		 */
		Sound.prototype.load = function(url, obj, callback){
			if(obj instanceof String || typeof obj == "string"){
				var req = new Request({
					url:obj,
					caller:this,
					cache:false,
					track:true,
					type:"json",
					callback:function(file){
						this.sounds = file.sounds || {};
						this.tracks = file.tracks || {};
						if(callback) callback();
						this._init(url);
					}
				}).send();
			}
			else{
				this.sounds = obj.sounds || {};
				this.tracks = obj.tracks || {};
				this._init(url);
			}
		};
		
		/**
		 * Downloads a sound and defines handle
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to download
		 * @param {boolean} playOnLoaded Whether to play the sound when it finishes loading
		 * @param {Object} props The play properties of the sound
		 */
		Sound.prototype.preload = function(id, playOnLoaded, props){
			var req = new Request({
				url:this.tracks[id].files[0],
				caller:this,
				cache:false,
				track:true,
				callback:function(){
					this.tracks[id]._handle = new Howl({
						urls:this.tracks[id].files,
						loop:this.tracks[id].loop || false
					});
					if(playOnLoaded) singleton.play(id, props);
				}
			}).send();
		};
		
		/**
		 * Plays a sound
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to play
		 * @param {Object} props The play properties of the sound
		 */
		Sound.prototype.play = function(id, props){
			props = props || {};
			
			if(!singleton._fileInPipe) return singleton._queue.push({id:id, props:props});
			
			if(id in singleton.tracks){
				//Sound not loaded, need to preload
				if(!singleton.tracks[id]._handle) return singleton.preload(id, true, props);
				
				singleton.tracks[id]._handle.volume(Arstider.checkIn(props.volume, 1)); 
				singleton.tracks[id]._handle.play();
				if(singleton.tracks[id].fadeIn) singleton.fade(id, 0, Arstider.checkIn(props.volume, 1), singleton.tracks[id].fadeIn);
				
				if(singleton.tracks[id].fadeOutTimer){
					singleton.tracks[id].fadeOutTimer.pause();
					singleton.tracks[id].fadeOutTimer = null;
				}
				
				if(props.startCallback) singleton.tracks[id]._handle._onplay = [function(){
					singleton.tracks[id].duration = singleton.tracks[id]._handle._duration;
					if(singleton.tracks[id].fadeOut){
						singleton.tracks[id].fadeOutTimer = new Timer(function(){
							singleton.fade(id, singleton.tracks[id]._handle._volume, 0, singleton.tracks[id].fadeOut);
						}, singleton.tracks[id].duration*1000, true);
					}
				}, props.startCallback];
					
				if(props.endCallback) singleton.tracks[id]._handle._onend = [props.endCallback];
			}
			else if(id in singleton.sounds){
				if(!singleton.sounds._handle){
					if(Arstider.verbose > 0) console.warn("Arstider.Sound.play: sounds disabled, Howler not loaded");
					return;
				}
				singleton.sounds._handle.play(id, function(howlId){
					howlId = parseInt(howlId+"");
					singleton._addInstance(id, howlId);
					singleton.sounds._handle.volume(Arstider.checkIn(props.volume, 1), howlId);
					if(props.startCallback) props.startCallback(howlId);
					if(props.endCallback) singleton._callbacks[howlId].push(props.endCallback);
				});
			}
			else{
				if(Arstider.verbose > 1) console.warn("Arstider.Sound.play: sound '", id, "' does not exist");
				return;
			}
		};
		
		/**
		 * Fades a sound instance volume from a start value to an end value over a certain duration
		 * @type {function(this:Sound)}
		 * @param {string} id The name or howlId of the sound to play
		 * @param {number} from The starting volume
		 * @param {number} to The target volume
		 * @param {number} duration The time to complete the transition
		 * @param {function|null} callback Optional callback function
		 */
		Sound.prototype.fade = function(id, from, to, duration, callback){
			if(id in singleton.tracks){
				if(singleton.tracks[id]._handle) singleton.tracks[id]._handle.fade(from, to, duration, callback || Arstider.emptyFunction);
				return;
			}
			
			if(!singleton.sounds._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.fade: sounds disabled, Howler not loaded");
				return;
			}
			
			singleton.sounds._handle.fade(from, to, duration, callback || Arstider.emptyFunction, id);
		};
		
		/**
		 * Adds a sound instance for an Id
		 * @private
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to add
		 * @param {string|number} howlId The howlId for the Howler sound instance
		 */
		Sound.prototype._addInstance = function(id, howlId){
			singleton._callbacks[howlId] = [];
			if(!singleton.sounds[id].instances) singleton.sounds[id].instances = [];
			
			singleton.sounds[id].instances.push(howlId);
		};
		
		/**
		 * Removes a sound instance for an Id
		 * @private
		 * @type {function(this:Sound)}
		 * @param {string|number} howlId The howlId for the Howler sound instance
		 */
		Sound.prototype._removeInstance = function(howlId){
			var cbList = singleton._callbacks[howlId];
			for(var i = 0; i<cbList.length; i++){
				cbList[i]();
			}
			
			singleton._killCallbacks(howlId);
			var i, s;
			
			for(s in singleton.sounds){
				if(singleton.sounds[s].instances && singleton.sounds[s].instances.length != 0){
					for(i = 0; i<singleton.sounds[s].instances.length; i++){
						if(singleton.sounds[s].instances[i] == howlId){
							singleton.sounds[s].instances.splice(i, 1);
							return;
						}
					}
				}
			}
		};
		
		
		/**
		 * Kills the callbacks for a sound instance
		 * @private
		 * @type {function(this:Sound)}
		 * @param {string|number} howlId The howlId for the Howler sound instance
		 */
		Sound.prototype._killCallbacks = function(howlId){
			if(singleton._callbacks[howlId]) singleton._callbacks[howlId] = [];
			else{
				if(Arstider.verbose > 1) console.warn("Arstider.Sound.killCallbacks: sound instance id unavailable");
			}
		};
		
		/**
		 * Gets the sound instances for an Id
		 * @private
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to retrieve
		 * @param {number|null} index The index in the list of instances
		 * @return {string|number} The howlId
		 */
		Sound.prototype.getPlaying = function(id, index){
			if(id in singleton.tracks) return singleton.tracks[id]._handle;
			
			if(!singleton.sounds[id].instances) singleton.sounds[id].instances = [];
			
			if(index != undefined) return singleton.sounds[id].instances[index];
			return singleton.sounds[id].instances;
		};
		
		/**
		 * Stops a sound, or all sounds if no Id is provided
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to stop
		 */
		Sound.prototype.stop = function(id){
			if(id in singleton.tracks){
				if(singleton.tracks[id]._handle) singleton.tracks[id]._handle.stop();
				
				if(singleton.tracks[id].fadeOutTimer) singleton.tracks[id].fadeOutTimer.pause();
				return;
			}
			
			if(!singleton.sounds._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.stop: sounds disabled, Howler not loaded");
				return;
			}
			
			singleton.sounds._handle.stop(id);
		};
		
		/**
		 * Pauses a sound, or all sounds if no Id is provided
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to pause
		 */
		Sound.prototype.pause = function(id){
			if(id in singleton.tracks){
				if(singleton.tracks[id]._handle) singleton.tracks[id]._handle.pause();
				
				if(singleton.tracks[id].fadeOutTimer) singleton.tracks[id].fadeOutTimer.pause();
				return;
			}
			
			if(!singleton.sounds._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.pause: sounds disabled, Howler not loaded");
				return;
			}
			
			singleton.sounds._handle.pause(id);
		};
		
		/**
		 * Unpauses a sound, or all sounds if no Id is provided
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to pause
		 */
		Sound.prototype.resume = function(id){
			if(id in singleton.tracks){
				if(singleton.tracks[id]._handle) singleton.tracks[id]._handle.play();
				
				if(singleton.tracks[id].fadeOutTimer) singleton.tracks[id].fadeOutTimer.resume();
				return;
			}
			
			if(!singleton.sounds._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.resume: sounds disabled, Howler not loaded");
				return;
			}
			
			singleton.sounds._handle.play(id);
		};
		
		/**
		 * Attempts to change the volume of a sound (or all sounds if no Id is provided) ***See platform limitations***
		 * @type {function(this:Sound)}
		 * @param {string} id The id of the sound to modify
		 * @param {number} val The volume (0 to 1)
		 */
		Sound.prototype.setVolume = function(id, val){
			if(id in singleton.tracks){
				if(singleton.tracks[id]._handle) singleton.tracks[id]._handle.volume(val);
				return;
			}
			
			if(!singleton.sounds._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.setVolume: sounds disabled, Howler not loaded");
				return;
			}
			
			singleton.sounds._handle.volume(val, id);
		};
	
		singleton = new Sound();
		return singleton;
	});
})();