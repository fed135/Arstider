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
	define( "Arstider/Sound", ["Arstider/Browser", "Arstider/Request", "Arstider/Timer"], /** @lends Sound */ function (Browser, Request, Timer) {
		
		if(singleton != null) return singleton;
		
		/**
		 * Sound constructor
		 * Used to play sound tracks
		 * @class Sound
		 * @constructor
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

			/**
			 * Prevents sounds from playing
			 * @type {boolean}
			 */
			this.muted = false;
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

			if(Browser.name == "android") Howler.usingWebAudio = false;
			
			var 
				i,
				sprite = {empty:[0,1]}
			;
			
			for(i in this.sounds){
				sprite[i] = [this.sounds[i].offset, this.sounds[i].duration, this.sounds[i].loop];
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
			
			if(!Browser.isMobile) singleton._fileInPipe = true;
		};
		
		/**
		 * Puts the file in the buffer (on touch input)
		 * @private
		 * @type {function(this:Sound)}
		 */
		Sound.prototype._queueFile = function(){
			if(singleton._fileInPipe==true) return;
			singleton._fileInPipe = true;
			
			if(singleton._queue.length > 0){
				for(var i = 0; i<singleton._queue.length; i++){
					singleton.play(singleton._queue[i].id, singleton._queue[i].props);
				}
			}
			else singleton.play('empty');
			singleton._queue = [];
		};
		
		/**
		 * Defines the list of sounds and sprite informations
		 * @type {function(this:Sound)}
		 * @param {string} url The url of the sound file
		 * @param {string|Object} obj The sound sprite url/object
		 * @param {function} callback Optional callback function, when sounds are setupped
		 * @return {Object} Self reference, for chaining
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
			return singleton;
		};
		
		/**
		 * Downloads a sound and defines handle
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to download
		 * @param {boolean} playOnLoaded Whether to play the sound when it finishes loading
		 * @param {Object} props The play properties of the sound
		 * @return {Object} Self reference, for chaining
		 */
		Sound.prototype.preload = function(id, playOnLoaded, props){
			if(Browser.isMobile){
				this.tracks[id]._handle = new Howl({
					urls:this.tracks[id].files,
					loop:this.tracks[id].loop || false
				});
				if(playOnLoaded) singleton.play(id, props);
			}
			else{
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
			}
			return singleton;
		};
		
		/**
		 * Plays a sound
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to play
		 * @param {Object} props The play properties of the sound
		 * @return {Object} Self reference, for chaining
		 */
		Sound.prototype.play = function(id, props){
			props = props || {};
			
			if(singleton.muted) return singleton;

			if(!singleton._fileInPipe){
				singleton._queue.push({id:id, props:props});
				return singleton;
			}
			
			if(id in singleton.tracks){
				//Sound not loaded, need to preload
				if(!singleton.tracks[id]._handle){
					singleton.preload(id, true, props);
					return singleton;
				}
				
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
					return singleton;
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
			}
			return singleton;
		};
		
		/**
		 * Fades a sound instance volume from a start value to an end value over a certain duration
		 * @type {function(this:Sound)}
		 * @param {string} id The name or howlId of the sound to play
		 * @param {number} from The starting volume
		 * @param {number} to The target volume
		 * @param {number} duration The time to complete the transition
		 * @param {function|null} callback Optional callback function
		 * @return {Object} Self reference, for chaining
		 */
		Sound.prototype.fade = function(id, to, duration, callback){
			if(id in singleton.tracks){
				if(singleton.tracks[id]._handle) singleton.tracks[id]._handle.fade(singleton.tracks[id]._handle._volume, to, duration, callback || Arstider.emptyFunction);
				return singleton;
			}
			
			if(!singleton.sounds._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.fade: sounds disabled, Howler not loaded");
				return singleton;
			}
			
			if(singleton.checkInstance(id)) singleton.sounds._handle.fade(singleton.sounds._handle._volume, to, duration, callback || Arstider.emptyFunction, id);
			return singleton;
		};

		/**
		 * Sets the position of a sound instance, does not alter the playing property
		 * @type {function(this:Sound)}
		 * @param {string|number} id The name/howlerId of the sound
		 * @param {number} pos The position (in ms) to go to
		 */
		Sound.prototype.setPosition = function(id, pos){
			if(id in singleton.tracks){
				if(singleton.tracks[id]._handle) singleton.tracks[id]._handle.pos(pos);
				return singleton;
			}
			
			if(!singleton.sounds._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.setPosition: sounds disabled, Howler not loaded");
				return singleton;
			}
			
			if(singleton.checkInstance(id)) singleton.sounds._handle.pos(pos, id);
			return singleton;
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
			if(cbList && cbList.length){
				for(var i = 0; i<cbList.length; i++){
					cbList[i]();
				}
			}
			
			var i, s;
			
			for(s in singleton.sounds){
				if(singleton.sounds[s].instances && singleton.sounds[s].instances.length != 0){
					for(i = 0; i<singleton.sounds[s].instances.length; i++){
						if(singleton.sounds[s].instances[i] == howlId){
							singleton.sounds[s].instances.splice(i, 1);
							break;
						}
					}
				}
			}

			singleton._killCallbacks(howlId);
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
		 * @return {Object} Self reference, for chaining
		 */
		Sound.prototype.stop = function(id){
			if(id == undefined){
				this.stopAllTracks();
				this.stopAllSounds();
				return singleton;
			}

			if(id in singleton.tracks){
				if(singleton.tracks[id]._handle) singleton.tracks[id]._handle.stop();
				
				if(singleton.tracks[id].fadeOutTimer) singleton.tracks[id].fadeOutTimer.pause();
				return singleton;
			}
			
			if(!singleton.sounds._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.stop: sounds disabled, Howler not loaded");
				return singleton;
			}
			
			if(singleton.checkInstance(id)) singleton.sounds._handle.stop(id);
			return singleton;
		};

		/**
		 * Stops all tracks not in the sprite
		 * @type {function(this:Sound)}
		 * @return {Object} Self reference, for chaining
		 */
		Sound.prototype.stopAllTracks = function(){
			for(var id in singleton.tracks){
				if(singleton.tracks[id]._handle){
					singleton.tracks[id]._handle.stop();
					singleton.tracks[id]._handle._playStart = 0;
				}
				if(singleton.tracks[id].fadeOutTimer) singleton.tracks[id].fadeOutTimer.pause();
			}
			return singleton;
		};

		/**
		 * Stops all sounds and prevents further playing of sounds until unmute
		 * @type {function(this:Sound)}
		 * @return {Object} Self reference, for chaining
		 */
		Sound.prototype.mute = function(){
			this.stopAllSounds();
			this.stopAllTracks();
			this.muted = true;
			return singleton;
		};

		/**
		 * Sounds can play again (does not resume)
		 * @type {function(this:Sound)}
		 * @return {Object} Self reference, for chaining
		 */
		Sound.prototype.unmute = function(){
			this.muted = false;
			return singleton;
		};

		/**
		 * Stops all the sounds from the sprite
		 * @type {function(this:Sound)}
		 * @return {Object} Self reference, for chaining
		 */
		Sound.prototype.stopAllSounds = function(){	
			singleton.sounds._handle.stop();
			return singleton;
		};
		
		/**
		 * Pauses a sound, or all sounds if no Id is provided
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to pause
		 * @return {Object} Self reference, for chaining
		 */
		Sound.prototype.pause = function(id){
			if(id == "__emergency-stop__"){
				for(var i in singleton.tracks){
					if(singleton.tracks[i]._handle){
						if(!singleton.tracks[i]._handle._audioNode[0].paused){
							singleton.tracks[i]._handle.pause();
							if(singleton.tracks[i].fadeOutTimer) singleton.tracks[i].fadeOutTimer.pause();
						}
						else{
							singleton.tracks[i]._handle.pause();
							singleton.tracks[i]._handle._playStart = 0;
						}
					}
				}
				return;
			}

			if(id in singleton.tracks){
				if(singleton.tracks[id]._handle) singleton.tracks[id]._handle.pause();
				
				if(singleton.tracks[id].fadeOutTimer) singleton.tracks[id].fadeOutTimer.pause();
				return singleton;
			}
			
			if(!singleton.sounds._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.pause: sounds disabled, Howler not loaded");
				return singleton;
			}
			
			if(singleton.checkInstance(id)) singleton.sounds._handle.pause(id);
			return singleton
		};
		
		/**
		 * Unpauses a sound, or all sounds if no Id is provided
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to pause
		 * @return {Object} Self reference, for chaining
		 */
		Sound.prototype.resume = function(id){
			if(id == "__emergency-stop__"){
				for(var i in singleton.tracks){
					if(singleton.tracks[i]._handle){
						if(singleton.tracks[i]._handle._playStart != 0){
							singleton.tracks[i]._handle.play();
							if(singleton.tracks[i].fadeOutTimer) singleton.tracks[i].fadeOutTimer.resume();
						}
					}
				}
				return;
			}

			if(id in singleton.tracks){
				if(singleton.tracks[id]._handle) singleton.tracks[id]._handle.play();
				
				if(singleton.tracks[id].fadeOutTimer) singleton.tracks[id].fadeOutTimer.resume();
				return singleton;
			}
			
			if(!singleton.sounds._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.resume: sounds disabled, Howler not loaded");
				return singleton;
			}
			
			if(singleton.checkInstance(id)) singleton.sounds._handle.play(id);
			return singleton;
		};

		/**
		 * Checks the state of a sfx instance
		 * @type {function(this:Sound)}
		 * @param {string} id The howl id of the sound to check
		 * @return {boolean} True if instance is live false if it doesn't exist
		 */
		Sound.prototype.checkInstance = function(id){
			var s;

			for(s in singleton.sounds){
				if(singleton.sounds[s].instances && singleton.sounds[s].instances.length != 0){
					if(singleton.sounds[s].instances.indexOf(id) != -1) return true;
				}
			}
			if(Arstider.verbose > 0) console.warn("Arstider.Sound.checkInstance: sound instance doesn't exist");

			return false;			
		};
		
		/**
		 * Attempts to change the volume of a sound (or all sounds if no Id is provided) ***See platform limitations***
		 * @type {function(this:Sound)}
		 * @param {string} id The id of the sound to modify
		 * @param {number} val The volume (0 to 1)
		 * @return {Object} Self reference, for chaining
		 */
		Sound.prototype.setVolume = function(id, val){
			if(id in singleton.tracks){
				if(singleton.tracks[id]._handle) singleton.tracks[id]._handle.volume(val);
				return singleton;
			}
			
			if(!singleton.sounds._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.setVolume: sounds disabled, Howler not loaded");
				return singleton;
			}
			
			if(singleton.checkInstance(id)) singleton.sounds._handle.volume(val, id);
			return singleton;
		};

		singleton = new Sound();
		return singleton;
	});
})();