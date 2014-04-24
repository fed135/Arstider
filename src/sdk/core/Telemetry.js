/**
 * Telemetry
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/*
 * Self-invoked singleton wrapper
 */
;(function(){
	
	var 
		/**
		 * Singleton static
	 	 * @private
	 	 * @type {Telemetry|null}
	 	 */
		singleton = null
	;
	
    /**
	 * Defines performance module
	 */	
	define( "Arstider/core/Telemetry", [], function (){
			
		if(singleton != null) return singleton;
		
		/**
		 * Telemetry module constructor
		 * @constructor
		 */	
		function Telemetry(){
			/**
			 * Logged Events
			 * @private
			 * @type {Object}
			 */
			this._events = {};
			
			/**
			 * Session ID
			 * @private
			 * @type
			 */
			this._sessionId = Arstider.guid();
			
			/**
			 * Screen order index
			 * @private
			 * @type {number}
			 */
			this._orderId = 0;
		}
		
		Telemetry.prototype.log = function(category, name, data){
			data = data || {};
			data._timestamp = Arstider.timestamp();
			data._category = category;
			data._name = name;
			data._session = this._sessionId;
			data._orderId = this._orderId;
			
			if(!this._events[category]) this._events[category] = {};
			if(!this._events[category][name]) this._events[category][name] = [];
			this._events[category][name].push(data);
			
			console.log(this._events[category][name][this._events[category][name].length-1]);
			
			if(name == "screenstart") this._orderId++;
		};
		
		singleton = new Telemetry();
		return singleton;
	});
})();