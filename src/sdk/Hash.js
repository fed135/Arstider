;(function(){
	
	/**
	 * Defines the Hash module
	 */
	define("Arstider/Hash", ["Arstider/Events","Arstider/Engine"], /** @lends Hash */ function(Events, Engine){
		
		/**
		 * Hash constructor
		 * @class Hash
		 * @constructor
		 */
		function Hash(){

			this.anchor = this.getAnchor();
			if (!this.anchor) return false;	
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
				Events.broadcast("Hash.hashchange",thisRef.anchor);
			};
		};


		return Hash;
	});
})();