;(function(){

	var singleton = null;

	define("Arstider/sounds/SoundJSInterface", [], function(){

		if(singleton != null) return singleton;
		
		function SoundJSInterface(){
			this.managerRef;
		}

		SoundJSInterface.prototype.init = function(s, url, callback){
			singleton.managerRef = s;

			if(!singleton.test()) return;

			createjs.Sound.initializeDefaultPlugins();
			createjs.Sound.alternateExtensions = ["mp3", "ogg"];
			var manifest = [{
				src:url+".ogg", 
				data:{
					audioSprite: []
				}
			}];

			for(i in singleton.managerRef.sounds){
				manifest[0].data.audioSprite.push({id:i, startTime:singleton.managerRef.sounds[i].offset, duration:singleton.managerRef.sounds[i].duration, loop:singleton.managerRef.sounds[i].loop});
			}

			createjs.Sound.addEventListener("fileload", function(){
				if(callback) callback();
			});
			createjs.Sound.registerManifest(manifest);
		};

		SoundJSInterface.prototype.test = function(){
			if(!createjs || !createjs.Sound){
				if(Arstider.verbose > 0) console.warn("Arstider.SoundJSInterface.test: sounds disabled, SoundJS not loaded");
				return false;
			}
			return true;
		};

		SoundJSInterface.prototype._fadeLoop = function(handle, to, delay, callback){

			var inc = (handle._volume - to)/(delay *0.05);

			s.setVolume(Math.round(handle._volume - inc));
			delay -= 20;

			if(delay > 0){
				setTimeout(function internalSoundFade(){
					singleton._fadeLoop(handle, to, delay, callback);
				},20);
			}
			else{
				if(callback) callback();
			}
		};

		SoundJSInterface.prototype.create = function(id){
			return createjs.Sound.registerSound(singleton.managerRef.tracks[id].files[0], id);
		};

		SoundJSInterface.prototype.playTrack = function(handle, id, options){
			options = options || {};
			var callbacks = [];

			if(handle){
				handle.addEventListener("succeeded", function(){
					if(options.startCallback) options.startCallback.apply(singleton.managerRef, [id]);

					var fadeIn = Arstider.checkIn(options.fadeIn, singleton.managerRef.tracks[id].fadeIn);
					if(fadeIn) singleton.fade(handle, id, 0, handle._volume, fadeIn);
					var fadeOut = Arstider.checkIn(options.fadeOut, singleton.managerRef.tracks[id].fadeOut);

					if(singleton.managerRef.tracks[id].fadeOutTimer){
						singleton.managerRef.tracks[id].fadeOutTimer.pause();
						singleton.managerRef.tracks[id].fadeOutTimer = null;
					}

					singleton.managerRef.tracks[id].duration = handle.getDuration();
					if(fadeOut){
						singleton.managerRef.tracks[id].fadeOutTimer = new Timer(function(){
							singleton.fade(handle, id, handle.getVolume(), 0, fadeOut);
						}, singleton.managerRef.tracks[id].duration, true);
					}
				});

				handle.play();
			}
			return singleton.managerRef;
		};

		SoundJSInterface.prototype.playSound = function(handle, id, options, callback){
			createjs.Sound.play(id);
			
			return singleton.managerRef;
		};

		SoundJSInterface.prototype.pause = function(handle, id){
			if(handle){
				handle.pause();
			}
			else{
				createjs.Sound.pause(id);
			}
			return singleton.managerRef;
		};

		SoundJSInterface.prototype.resume = function(handle, id){
			if(handle){
				handle.resume();
			}
			else{
				createjs.Sound.resume(id);
			}
			return singleton.managerRef;
		};

		SoundJSInterface.prototype.fade = function(handle, id, startVol, endVol, time, callback){
			handle.setVolume(startVol);
			singleton._fadeLoop(handle, endVol, time, callback);
			return singleton.managerRef;
		};

		SoundJSInterface.prototype.stop = function(handle, id){
			if(handle){
				handle.stop();
				if(id && singleton.managerRef.tracks[id] && singleton.managerRef.tracks[id].fadeOutTimer) singleton.managerRef.tracks[id].fadeOutTimer.pause();
			}
			else{
				createjs.Sound.stop(id);
			}
			return singleton.managerRef;
		};

		SoundJSInterface.prototype.setPosition = function(handle, pos, id){
			if(handle){
				handle.setPosition(pos);
			}
			return singleton.managerRef;
		};

		SoundJSInterface.prototype.setVolume = function(handle, volume, id){
			if(handle){
				handle.setVolume(volume);
			}
			return singleton.managerRef;
		};

		singleton = new SoundJSInterface();
		return singleton;
	});
})();