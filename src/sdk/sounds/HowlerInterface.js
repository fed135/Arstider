;(function(){

	var singleton = null;

	define("Arstider/sounds/HowlerInterface", ["Arstider/Browser", "Arstider/Timer"], function(Browser, Timer){

		if(singleton != null) return singleton;
		
		function HowlerInterface(){
			this.managerRef;
			this.ieTimer = null;
		}

		HowlerInterface.prototype.init = function(s, url, callback){
			singleton.managerRef = s;

			if(!singleton.test()) return;

			if(Browser.name == "android") Howler.usingWebAudio = false;
			//Howler.iOSAutoEnable = false;

			var 
				i,
				sprite = {empty:[0,11]},
				padding = 0
			;

			if(Browser.name == "ie"){
				padding = 100;
			}
			
			for(i in singleton.managerRef.sounds){
				sprite[i] = [singleton.managerRef.sounds[i].offset - padding, singleton.managerRef.sounds[i].duration, singleton.managerRef.sounds[i].loop];
			}
			
			singleton.managerRef.sounds['empty'] = {};
			
			singleton.managerRef.sounds.handle = new Howl({
				urls:[url+".mp3",url+".ogg"],
				sprite:sprite,
				onend:singleton.managerRef._removeInstance
			});

			if(callback) callback();
		};

		HowlerInterface.prototype.test = function(){
			if(!Howl){
				if(Arstider.verbose > 0) console.warn("Arstider.HowlerInterface.test: sounds disabled, Howler not loaded");
				return false;
			}
			return true;
		};

		HowlerInterface.prototype.create = function(id){
			return new Howl({
				urls:singleton.managerRef.tracks[id].files,
				loop:singleton.managerRef.tracks[id].loop || false
			});
		};

		HowlerInterface.prototype.playTrack = function(handle, id, options){
			//Really, really bad hack... I hate myself
			if(handle._audioNode && handle._audioNode.length){
				for(var i = 0; i< handle._audioNode.length; i++){
					if(handle._audioNode[i].paused) handle._audioNode[i].paused = false;
					break;
				}
			}

			handle.play();

			options = options || {};

			var fadeIn = Arstider.checkIn(options.fadeIn, singleton.managerRef.tracks[id].fadeIn);
			if(fadeIn) singleton.fade(handle, id, 0, handle._volume, fadeIn);
			var fadeOut = Arstider.checkIn(options.fadeOut, singleton.managerRef.tracks[id].fadeOut);

			if(singleton.managerRef.tracks[id].fadeOutTimer){
				singleton.managerRef.tracks[id].fadeOutTimer.pause();
				singleton.managerRef.tracks[id].fadeOutTimer = null;
			}
				
			var callbacks = [];
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
			if(options.startCallback) callbacks.push(function(){options.startCallback.apply(singleton.managerRef, [id]);});
			handle._onplay = callbacks;
					
			if(options.endCallback) handle._onend = [options.endCallback];
			return singleton.managerRef;
		};

		HowlerInterface.prototype.playSound = function(handle, id, options, callback){
			if(Browser.name == "ie") handle.stop();	//Force stop off all sounds before playing new ones

			//Really, really bad hack... I hate myself
			if(handle._audioNode && handle._audioNode.length){
				for(var i = 0; i< handle._audioNode.length; i++){
					if(handle._audioNode[i].paused) handle._audioNode[i].paused = false;
					break;
				}
			}

			handle.play(id, function(howlId){
				howlId = parseInt(howlId+"");
				singleton.managerRef._addInstance(id, howlId);
				handle.volume(Arstider.checkIn(options.volume, 1), howlId);
				//sfx should just fire and go, no questions or ties. for anything longer, make tracks.

				//safety net for IE
				if(Browser.name == "ie"){
					clearTimeout(singleton.ieTimer);
					singleton.ieTimer = setTimeout(function(){
						handle.stop(howlId); //stop after playing
					}, singleton.managerRef.sounds[id].duration + 50);
				}

				//if(options.startCallback) options.startCallback(howlId);
				//if(options.endCallback) singleton.managerRef._callbacks[howlId].push(options.endCallback);
			});
			return singleton.managerRef;
		};

		HowlerInterface.prototype.pause = function(handle, id){
			if(handle){
				if(singleton._nodePlaying(handle)){
					handle.pause();
					if(id && singleton.managerRef.tracks[id] && singleton.managerRef.tracks[id].fadeOutTimer) singleton.managerRef.tracks[id].fadeOutTimer.pause();
				}
				else{
					handle.pause();
					handle._playStart = 0;
				}
			}
			return singleton.managerRef;
		};

		HowlerInterface.prototype.resume = function(handle, id){
			if(handle){
				if(handle._playStart != 0){
					handle.play();
					if(id && singleton.managerRef.tracks[id] && singleton.managerRef.tracks[id].fadeOutTimer) singleton.managerRef.tracks[id].fadeOutTimer.resume();
				}
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.HowlerInterface.fade: sound ",id, " not loaded, no handle");
			}
			return singleton.managerRef;
		};

		HowlerInterface.prototype.fade = function(handle, id, startVol, endVol, time, callback){
			if(handle){
				if(startVol === "auto") startVol = handle._volume;

				handle.fade(startVol, endVol, time, callback || Arstider.emptyFunction, id);
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.HowlerInterface.fade: sound ",id, " not loaded, no handle");
			}
			return singleton.managerRef;
		};

		HowlerInterface.prototype.stop = function(handle, id){
			if(handle){
				handle.stop(id);
				handle._playStart = 0;
				if(id && singleton.managerRef.tracks[id] && singleton.managerRef.tracks[id].fadeOutTimer) singleton.managerRef.tracks[id].fadeOutTimer.pause();
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.HowlerInterface.stop: sound ",id, " not loaded, no handle");
			}
			return singleton.managerRef;
		};

		HowlerInterface.prototype.setPosition = function(handle, pos, id){
			if(handle){
				handle.pos(pos, id);
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.HowlerInterface.setPosition: sound ",id, " not loaded, no handle");
			}
			return singleton.managerRef;
		};

		HowlerInterface.prototype._nodePlaying = function(handle){
			if(handle){
				for(var i = 0; i<handle._audioNode.length; i++){
					if(!handle._audioNode[i].paused) return true;
				}
				return false;
			}
			else return false;
		};

		HowlerInterface.prototype.setVolume = function(handle, volume, id){
			if(handle){
				handle.volume(volume, id);
			}
			else{
				if(Arstider.verbose > 0) console.warn("Arstider.HowlerInterface.setVolume: sound ",id, " not loaded, no handle");
			}
			return singleton.managerRef;
		};

		singleton = new HowlerInterface();
		return singleton;
	});
})();