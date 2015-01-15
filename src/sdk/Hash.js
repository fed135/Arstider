;(function(){
	
	var singleton = null;

	/**
	 * Defines the Hash module
	 */
	define("Arstider/Hash", ["Arstider/Signal"], /** @lends Hash */ function(Signal){
			
		if(singleton != null) return singleton;

		/**
		 * Hash constructor
		 * @class Hash
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
			return anchor;
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

		singleton = new Hash();
		return singleton;
	});
})();