;(function(){

	var singleton = null;

	define("Arstider/sounds/SoundJSInterface", [], function(){

		if(singleton != null) return singleton;
		
		function SoundJSInterface(){
			this.managerRef;
		}

		SoundJSInterface.prototype.init = function(s){
			singleton.managerRef = s;

			if(!singleton.test()) return;
		};

		SoundJSInterface.prototype.test = function(){
			return false;
		};

		SoundJSInterface.prototype.create = function(id){
			
		};

		SoundJSInterface.prototype.playTrack = function(handle, id, options){
			
		};

		SoundJSInterface.prototype.playSound = function(handle, id, options, callback){
			
		};

		SoundJSInterface.prototype.pause = function(handle, id){
			
		};

		SoundJSInterface.prototype.resume = function(handle, id){
			
		};

		SoundJSInterface.prototype.fade = function(handle, id, startVol, endVol, time, callback){
			
		};

		SoundJSInterface.prototype.stop = function(handle, id){
			
		};

		SoundJSInterface.prototype.setPosition = function(handle, pos, id){
			
		};

		SoundJSInterface.prototype._nodePlaying = function(handle){
			
		};

		SoundJSInterface.prototype.setVolume = function(handle, volume, id){
			
		};

		singleton = new SoundJSInterface();
		return singleton;
	});
})();