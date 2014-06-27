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
			data = data || {};
			data._timestamp = Arstider.timestamp();
			data._category = category;
			data._name = name;
			data._session = this._sessionId;
			data._orderId = this._orderId;
			
			if(!this._events[category]) this._events[category] = {};
			if(!this._events[category][name]) this._events[category][name] = [];
			this._events[category][name].push(data);
			
			if(name == "screenstart") this._orderId++;
			
			this._send();
		};
		
		Telemetry.prototype.sendTo = function(req, category){
                    category = category || ["*"];
                    for(var i = 0; i<category.length; i++){
                        this._targetURLs[category[i]] = req;
                    }
			
                    this._send();
		};
		
		Telemetry.prototype._send = function(){
			var i, o, u, thisRef = this;
			
			for(i in this._events){
				if(i in this._targetURLs || "*" in this._targetURLs){
					for(o in this._events[i]){
						for(u = 0; u<this._events[i][o].length; u++){
							if(!this._events[i][o][u].__sent){
								this._events[i][o][u].__sent = Arstider.timestamp();
								
								var req = new Request(Arstider.clone((this._targetURLs[i] || this._targetURLs["*"] || {}), true));
								
								req.url = req.url.split("[category]").join(i).split("[name]").join(o);
								req.postData = JSON.stringify(this._events[i][o][u]);
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