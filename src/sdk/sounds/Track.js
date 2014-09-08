define("Arstider/sounds/Track", ["Arstider/Signal"], function(Signal){
	
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

		this.onload=new Signal();
		this.onstart=new Signal();
		this.onend=new Signal();
	}

	return Track;
});