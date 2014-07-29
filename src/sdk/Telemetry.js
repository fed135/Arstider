/**
 * Telemetry
 * 
 * @version 1.1
 * @status Stable
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
	define( "Arstider/Telemetry", ["Arstider/Request"], /** @lends Telemetry */ function (Request){
			
		if(singleton != null) return singleton;
		
		/**
		 * Telemetry constructor
		 * Stores and sends internal/custom events for tracking purposes
		 * @class Telemetry
		 * @constructor
		 */	
		function Telemetry(){
			/**
			 * Whether the telemetry is enabled or not
			 * @type {boolean}
			 */
			this.enabled = false;

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
			
			/**
			 * Target server urls
			 * @private
			 * @type {Object}
			 */
			this._targetURLs = {};
		}
		
		Telemetry.prototype.log = function(category, name, data){
			if(!singleton.enabled) return;

			data = data || {};
			data._timestamp = Arstider.timestamp();
			data._category = category;
			data._name = name;
			data._session = singleton._sessionId;
			data._orderId = singleton._orderId;
			
			if(!singleton._events[category]) singleton._events[category] = {};
			if(!singleton._events[category][name]) singleton._events[category][name] = [];
			singleton._events[category][name].push(data);
			
			if(name == "screenstart") singleton._orderId++;
			
			singleton._send();
		};
		
		Telemetry.prototype.sendTo = function(req, category){
			singleton.enabled = true;

            category = category || ["*"];
            for(var i = 0; i<category.length; i++){
                singleton._targetURLs[category[i]] = req;
            }
			singleton._send();
		};
		
		Telemetry.prototype._send = function(){
			var i, o, u, thisRef = singleton;
			
			for(i in singleton._events){
				if(i in singleton._targetURLs || "*" in singleton._targetURLs){
					for(o in singleton._events[i]){
						for(u = 0; u<singleton._events[i][o].length; u++){
							if(!singleton._events[i][o][u].__sent){
								singleton._events[i][o][u].__sent = Arstider.timestamp();
								
								var req = new Request(Arstider.clone((singleton._targetURLs[i] || singleton._targetURLs["*"] || {}), true));
								
								req.url = req.url.split("[category]").join(i).split("[name]").join(o);
								req.postData = JSON.stringify(singleton._events[i][o][u]);
								req.send();
							}
						}
					}
				}
			}
		};
		
		singleton = new Telemetry();
		return singleton;
	});
})();