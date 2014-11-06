define("Arstider/system/Hash", 
[
	"Arstider/events/Signal"
],
/** @lends system/Hash */ 
function(Signal){

	/**
	 * Hash constructor
	 * @class system/Hash
	 * @constructor
	 */
	function Hash(){

		this.anchor = this.getAnchor();
		this.onchange = new Signal();	
	}

	Hash.prototype.getAnchor= function(){

		var anchor = window.location.hash;
		anchor = anchor.substring(1,anchor.length); 

		if (anchor == "") return false;
		anchor = anchor.replace(".js", "");
		return anchor
	};

	Hash.prototype.setAnchor= function(anchor){

		anchor = anchor.replace("#", "");
		window.location.hash = anchor;
	};

	Hash.prototype.listenHash= function(){
			
		var thisRef = this;
		window.onhashchange = locationHashChanged;

		function locationHashChanged (){
			thisRef.anchor = thisRef.getAnchor();
			thisRef.onchange.dispatch(thisRef.anchor);
		};
	};

	return new Hash();
});