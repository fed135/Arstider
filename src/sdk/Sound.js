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
	define( "Arstider/Sound", ["howler", "Arstider/Browser", "Arstider/Viewport"], function (howlerreq, Browser,Viewport) {
		
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
		}
		
		/**
		 * Starts howler and parses the sound object
		 * @param {string} url The url of the 
		 */
		Sound.prototype._init = function(url){
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
			require(["Arstider/Request"], function(Request){
				var ext = ".mp3";
				if(Browser.name == "firefox") ext = ".ogg";
				
				var r = new Request({
					url:url+ext,
					caller:this,
					track:true
				}).send();
			});
			this.handle = new Howl({
				urls:[url+".mp3",url+".ogg"],
				sprite:sprite
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
					singleton.play(singleton._queue[i].id, singleton._queue[i].callback);
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
				var thisRef = this;
				require(["textLib!./"+obj],function(file){
					thisRef.sounds = JSON.parse(file);
					if(callback) callback();
					thisRef._init(url);
				});
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
		 * @param {function|null} callback Optional callback function
		 */
		Sound.prototype.play = function(id, callback){
			if(singleton._fileInPipe){
				singleton._handle.play(id);
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
				singleton._queue.push({id:id, callback:callback});
			}
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