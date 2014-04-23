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
	define( "Arstider/Sound", ["Arstider/Browser", "Arstider/Viewport", "Arstider/Request"], function (Browser, Viewport, Request) {
		
		if(singleton != null) return singleton;
		
		/**
		 * Sound constructor.
		 * @constructor
		 * @this {Sound}
		 */
		function Sound(){
			/**
			 * Sounds list
			 * @type {Object}
			 */
			this.sounds = {};
			/**
			 * Howler instance
			 * @private
			 * @type {Object}
			 */
			this._handle = null;
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
		 * @param {string} url The url of the 
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
			
			this._handle = new Howl({
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
			singleton.play('empty', true);
			if(singleton._queue.length > 0){
				for(var i = 0; i<singleton._queue.length; i++){
					singleton.play(singleton._queue[i].id, singleton._queue[i].startCallback, singleton._queue[i].endCallback);
				}
			}
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
						this.sounds = file;
						if(callback) callback();
						this._init(url);
					}
				}).send();
			}
			else{
				this.sounds = obj;
				this._init(url);
			}
		};
		
		/**
		 * Plays a sound
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to play
		 * @param {function|null} startCallback Optional on sound start callback function
		 * @param {function|null} endCallback Optional on sound end callback function
		 */
		Sound.prototype.play = function(id, startCallback, endCallback){
			if(!singleton._handle){
				if(Arstider.verbose > 0) console.warn("Arstider.Sound.play: sounds disabled, Howler not loaded");
				return;
			}
			
			if(!singleton.sounds[id]){
				if(Arstider.verbose > 1) console.warn("Arstider.Sound.play: sound '", id, "' does not exist");
				return;
			}
			
			if(singleton._fileInPipe){
				singleton._handle.play(id, function(howlId){
					howlId = parseInt(howlId+"");
					singleton._addInstance(id, howlId); 
					if(startCallback) startCallback(howlId);
					
					if(singleton.sounds[id].loop === true){
						singleton._callbacks[howlId].push(function(){
							singleton.play(id, startCallback, endCallback);
						});
					}
					if(endCallback) singleton._callbacks[howlId].push(endCallback);
				});
			}
			else{
				singleton._queue.push({id:id, startCallback:startCallback, endCallback:endCallback});
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
			singleton._handle.fade(from, to, duration, callback || Arstider.emptyFunction, id);
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
			this._handle.pause(id);
		};
		
		/**
		 * Pauses a sound, or all sounds if no Id is provided
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to pause
		 */
		Sound.prototype.pause = function(id){
			this._handle.pause(id);
		};
		
		/**
		 * Unpauses a sound, or all sounds if no Id is provided
		 * @type {function(this:Sound)}
		 * @param {string} id The name of the sound to pause
		 */
		Sound.prototype.resume = function(id){
			this._handle.play(id);
		};
		
		/**
		 * Attempts to change the volume of a sound (or all sounds if no Id is provided) ***See platform limitations***
		 * @type {function(this:Sound)}
		 * @param {string} id The id of the sound to modify
		 * @param {number} val The volume (0 to 1)
		 */
		Sound.prototype.setVolume = function(id, val){
			this._handle.volume(val, id);
		};
	
		singleton = new Sound();
		return singleton;
	});
})();