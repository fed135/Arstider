;(function(){

	var singleton = null;

	define("Arstider/sounds/SM2Interface", [], function(){

		if(singleton != null) return singleton;
		
		function SM2Interface(){
			this.managerRef;
		}

		SM2Interface.prototype.init = function(s, url, callback){
			singleton.managerRef = s;

			if(!singleton.test()) return;

			soundManager.setup({
				html5PollingInterval:245,
				preferFlash:false,
				useHTML5Audio:true,
				onready:function(){
					singleton.managerRef.sounds._handle = soundManager.createSound({
						id:"sounds",
						url: [url+".mp3",url+".ogg"],
						multiShot:true,
						multiShotEvents:true,
						onfinish:singleton.managerRef._removeInstance
					});
					if(callback) callback();
				}
			});
		};

		SM2Interface.prototype.test = function(){
			if(!soundManager){
				if(Arstider.verbose > 0) console.warn("Arstider.SM2Interface.test: sounds disabled, soundManager2 not loaded");
				return false;
			}
			return true;
		};

		SM2Interface.prototype.create = function(id){
			return soundManager.createSound({
				id:id,
				url:singleton.managerRef.tracks[id].files,
				multiShot:true
			});
		};

		SM2Interface.prototype._fadeLoop = function(handle, to, delay, callback){

			var inc = (handle.volume - to)/(delay *0.05);

			s.setVolume(Math.round(handle.volume - inc));
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

		SM2Interface.prototype.playTrack = function(handle, id, options, isSound){

			options = options || {};
			var callbacks = [];

			if(!isSound){
				var fadeIn = Arstider.checkIn(options.fadeIn, singleton.managerRef.tracks[id].fadeIn);
				if(fadeIn) singleton.fade(handle, id, 0, handle._volume, fadeIn);
				var fadeOut = Arstider.checkIn(options.fadeOut, singleton.managerRef.tracks[id].fadeOut);

				if(singleton.managerRef.tracks[id].fadeOutTimer){
					singleton.managerRef.tracks[id].fadeOutTimer.pause();
					singleton.managerRef.tracks[id].fadeOutTimer = null;
				}
			
				if(fadeOut){
					callbacks.push(function(){
						singleton.managerRef.tracks[id].duration = handle._duration;
						if(fadeOut){
							singleton.managerRef.tracks[id].fadeOutTimer = new Timer(function(){
								singleton.fade(handle, id, handle._volume, 0, fadeOut);
							}, singleton.managerRef.tracks[id].duration*1000, true);
						}
					});
				}
			}

			if(options.startCallback) callbacks.push(function(){options.startCallback.apply(singleton.managerRef, [id]);});
			handle._onplay = callbacks;
					
			if(options.endCallback) handle._onend = [options.endCallback];

			handle.onPosition(1, function(){
				for(var i = 0; i< callbacks; i++){
					if(callbacks[i]) callbacks[i]();
				}
			});

			options.onfinish = function(){
				if(handle._onend){
					for(var i = 0; i< handle._onend.length; i++){
						if(handle._onend[i]) handle._onend[i]();
					}
				}
			};

			handle.play(options);

			return singleton.managerRef;
		};

		SM2Interface.prototype.playSound = function(handle, id, options, callback){
			//handle.stop();
			
			options = options || {};
			options.from = singleton.managerRef.sounds[id].offset;
			options.to = options.from + singleton.managerRef.sounds[id].duration;

			singleton.playTrack(handle, id, options, true);
		};

		SM2Interface.prototype.pause = function(handle, id){
			if(handle){
				handle.pause();
				if(id && singleton.managerRef.tracks[id] && singleton.managerRef.tracks[id].fadeOutTimer) singleton.managerRef.tracks[id].fadeOutTimer.pause();
			}
			return singleton.managerRef;
		};

		SM2Interface.prototype.resume = function(handle, id){
			if(handle){
				handle.resume();
				if(id && singleton.managerRef.tracks[id] && singleton.managerRef.tracks[id].fadeOutTimer) singleton.managerRef.tracks[id].fadeOutTimer.resume();
			}
			return singleton.managerRef;
		};

		SM2Interface.prototype.fade = function(handle, id, startVol, endVol, time, callback){
			handle.setVolume(startVol);
			singleton._fadeLoop(handle, endVol, time, callback);
			return singleton.managerRef;
		};

		SM2Interface.prototype.stop = function(handle, id){
			if(handle){
				handle.stop();
				if(id && singleton.managerRef.tracks[id] && singleton.managerRef.tracks[id].fadeOutTimer) singleton.managerRef.tracks[id].fadeOutTimer.pause();
			}
			return singleton.managerRef;
		};

		SM2Interface.prototype.setPosition = function(handle, pos, id){
			if(handle){
				handle.setPosition(pos);
			}
			return singleton.managerRef;
		};

		SM2Interface.prototype.setVolume = function(handle, volume, id){
			if(handle){
				handle.setVolume(volume*100);
			}
			return singleton.managerRef;
		};

		singleton = new SM2Interface();
		return singleton;
	});
})();