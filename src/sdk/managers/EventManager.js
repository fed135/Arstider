/**
 * Engine 
 * 
 * @version 1.1.2
 * @author frederic charette <fredericcharette@gmail.com>
 */
;(function(){
	
	var 
		/**
		 * Index of the target object
		 * @const
		 * @private
		 * @type {number}
		 */
		TARGET = 0,
		/**
		 * Index of the event string
		 * @const
		 * @private
		 * @type {number}
		 */
		EVENT = 1,
		/**
		 * Index of the callback function
		 * @const
		 * @private
		 * @type {number}
		 */
		FUNCTION = 2,
		
		/**
		 * No target flag
		 * @const
		 * @private
		 * @type {number}
		 */
		NO_TARGET = 0,
		/**
		 * Index not found flag
		 * @const
		 * @private
		 * @type {number}
		 */
		NOT_FOUND = -1,
		
		/**
		 * Singleton static
		 * @private
		 * @type {Events|null}
		 */
		singleton = null,
		
		/**
		 * List of targets
		 * @private
		 * @type {Array}
		 */
		targets = [NO_TARGET],
		/**
		 * List of functions
		 * @private
		 * @type {Array}
		 */
		functions = [],
		/**
		 * Junction table (sql-like)
		 * @private
		 * @type {Array}
		 */
		junctions = []
	;
	
	/**
	 * Looks for the existence of an event key
	 * @private
	 * @type {function}
	 * @param {*} item The item to look for
	 * @param {Array} arr The array to look in
	 * @param {*} key Optional search key
	 * @return {boolean} If the key is in the array
	 */
	function isIn(item, arr, key){
		var l = arr.length;
				
		for(var i = 0; i<l; i++){
			if(key){
				if(arr[i][key] == item){
					return i;
				}
			}
			else{
				if(arr[i] == item){
					return i;
				}
			}
		}
		return NOT_FOUND;
	}
			
	/**
	 * Cleans unused items, not present in the junction table
	 * @private
	 * @type {function}
	 * @param {Array} arr The array to look into
	 * @param {*} key The key to look for
	 * @return {number} The number of spliced elements
	 */
	function cleanup(arr, key){
		var i,
			l = arr.length,
			spliced = 0
		;
				
		//Clean in junctions
		for(i=l-1; i>=0; i--){
			if(isIn(i, junctions, key) === NOT_FOUND){
				arr.splice(i,1);
				spliced++;
			}
		}
				
		return spliced;
	}
	
	/**
	 * Defines the Events Module
	 */	
	define( "Arstider/Events", [], /** @lends Events */ function (){
	
		if(singleton != null) return singleton;
		
		/**
		 * Events constructor
		 * A flexible custom events dispatcher
		 * @class Events
		 * @constructor
		 */
		function Events(){}
			
		/**
		 * Binds an event name to a callback function, with the option to bind for a single target
		 * @type {function(this:Events)}
		 * @param {string} event The name of the event to bind
		 * @param {function} fct The callback function ***Preferable not to bind anonymous functions***
		 * @param {Object|null} target The optional bind target 
		 */		
		Events.prototype.bind = function(event, fct, target){
			target = target || NO_TARGET;	//0 means no specific target
				
			var i = isIn(fct, functions),
				u = isIn(target, targets)
			;
				
			if(i === NOT_FOUND){
				i = functions.length;
				functions[i] = fct;
			}
			if(u === NOT_FOUND){
				u = targets.length;
				targets[u] = target;
			}
				
			junctions[junctions.length] = [u,event,i];
		};
		
		/**
		 * Unbinds an event on a specified set of items
		 * @type {function(this:Events)}
		 * @param {string} event The name of the event to unbind
		 * @param {function|null} fct The optional callback function to target, if none is provided, will remove all callbacks for that event
		 * @param {Object|null} target The optional unbind target , if none is provided, will remove callbacks for all items
		 */	
		Events.prototype.unbind = function(event, fct, target){
			target = target || NO_TARGET;	//0 means no specific target
			fct = fct || NOT_FOUND;
			
			var i,
				l = junctions.length
			;
				
			for(i=l-1; i>=0; i--){
				if(junctions[i][EVENT] == event){
					if(functions[junctions[i][FUNCTION]] == fct || fct === NOT_FOUND){
						if(targets[junctions[i][TARGET]] == target || target === NO_TARGET){
							junctions.splice(i,1);
						}
					}
				}
			}
		};
		
		/**
		 * Broadcasts an event with optional data and target
		 * @type {function(this:Events)}
		 * @param {string} event
		 * @param {*} data
		 * @param {Object|null} target
		 */	
		Events.prototype.broadcast = function(event, data, target){
			target = target || NO_TARGET;	//0 means no specific target
			
			var i,
				l = junctions.length
			;
			
			for(i=l-1; i>=0; i--){
				if(junctions[i]){
					if(junctions[i][EVENT] == event){
						if(functions[junctions[i][FUNCTION]] instanceof Function || typeof functions[junctions[i][FUNCTION]] === "function"){
							if(targets[junctions[i][TARGET]] && (target === NO_TARGET || target == targets[junctions[i][TARGET]])){
								functions[junctions[i][FUNCTION]].apply(targets[junctions[i][TARGET]], [data]);
							}
							else{
								functions[junctions[i][FUNCTION]](data);
							}
						}
						else{
							if(Arstider.verbose > 1) console.warn("Arstider.Events.broadcast: discrepancy found, flushing events");
							singleton.flush();
						}
					}
				}
			}
		};
			
		/**
		 * Sweep through arrays to remove orphans and discrepancies
		 * @type {function(this:Events)}
		 */
		Events.prototype.flush = function(){
			cleanup(functions, FUNCTION);
			cleanup(targets, TARGET);
			
			//..then sort the junction table by event
			junctions.sort(function(x, y) {
			    return (x[EVENT] > y[EVENT]) ? 1 : ( (y[EVENT] > x[EVENT]) ? -1 : 0 );
			});
		};
		
		singleton = new Events();
		return singleton;
	});
})();