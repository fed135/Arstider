define("Arstider/sounds/Track", ["Arstider/Signal", "Arstider/Timer"], function(Signal, Timer){
	
	function Track(props){
		props = props || {}

		this.files=Arstider.checkIn(props.files, []);
		this.ready=false;
		this.handle=null;
		this.volume=Arstider.checkIn(props.volume, 1);
		this.fadeOutTimer=null;
		this.loop=Arstider.checkIn(props.loop, false);
		this.fadeIn=Arstider.checkIn(props.fadeIn, null);
		this.fadeOut=Arstider.checkIn(props.fadeOut, null);
		this._timer = new Timer();

		this.onload=new Signal();
		this.onstart=new Signal();
		this.onend=new Signal();
	}

	Track.prototype.load = function(url){

	};

	Track.prototype.play = function(){

		return this;
	};

	Track.prototype.stop = function(){

		return this;
	};

	Track.prototype.pause = function(){

		return this;
	};

	Track.prototype.setPosition = function(){

		return this;
	};

	Track.prototype.setVolume = function(){

		return this;
	};

	Track.prototype.setPan = function(){

		return this;
	};

	Track.prototype.fade = function(){

		return this;
	};

	return Track;
});