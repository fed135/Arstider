/**
 * Telemetry
 * 
 * @version 1.1
 * @status Stable
 * @author frederic charette <fredericcharette@gmail.com>
 */
define( "Arstider/net/Telemetry", 
[
	"Arstider/net/Net"
], 
/** @lends net/Telemetry */ 
function (Net){
		
	Telemetry.CATEGORY = "[category]";
	Telemetry.EVENT_NAME = "[name]";

	Telemetry.ALL = "*";

	/**
	 * Telemetry constructor
	 * Stores and sends internal/custom events for tracking purposes
	 * @class net/Telemetry
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
		this._sessionId = null;
		/**
		 * Target server urls
		 * @private
		 * @type {Object}
		 */
		this._targetURLs = {};
	}
	
	Telemetry.prototype.log = function(category, name, data){
		if(!this.enabled) return;

		if(this._sessionId == null) this._sessionId = this.getUid();

		data = data || {};
		data._timestamp = Arstider.timestamp();
		data._category = category;
		data._name = name;
		data._session = this._sessionId;
		
		if(!this._events[category]) this._events[category] = {};
		if(!this._events[category][name]) this._events[category][name] = [];
		this._events[category][name].push(data);
		
		this._send();
	};
	
	Telemetry.prototype.sendTo = function(req, category){
		this.enabled = true;
           category = category || [Telemetry.ALL];
           for(var i = 0; i<category.length; i++){
               this._targetURLs[category[i]] = req;
           }
		this._send();
	};

	Telemetry.prototype.getUid = function(){

		function s4(){
			return Arstider.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	};
	
	Telemetry.prototype._send = function(){
		
		var 
			i, 
			o, 
			u, 
			req
		;
		
		for(i in this._events){
			if(i in this._targetURLs || Telemetry.ALL in this._targetURLs){
				for(o in this._events[i]){
					for(u = 0; u<this._events[i][o].length; u++){
						if(!this._events[i][o][u].__sent){
							this._events[i][o][u].__sent = Arstider.timestamp();
							
							req = Arstider.clone((this._targetURLs[i] || this._targetURLs[Telemetry.ALL] || {});
							req.url = req.url.split(Telemetry.CATEGORY).join(i).split(Telemetry.EVENT_NAME).join(o);
							req.data = JSON.stringify(this._events[i][o][u]);

							Net.post(req);
						}
					}
				}
			}
		}
	};
	
	return new Telemetry();
});