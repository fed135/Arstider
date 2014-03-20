/**
 * Event Manager 
 *
 * @author frederic charette <fredc@meetfidel.com>
 */
;(function(){
	
	var TARGET = 0,
		EVENT = 1,
		FUNCTION = 2,
		
		NO_TARGET = 0,
		NOT_FOUND = -1,
	
		singleton = null,
		targets = [NO_TARGET],
		functions = [],
		junctions = []
	;
	
	function isIn(item, arr, key){
		var i = 0,
			l = arr.length
		;
				
		for(i; i<l; i++){
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
	 * AMD Closure
	 */	
	define( "Arstider/Events", [], function () {
	
		if(singleton != null) return singleton;
		
		function Events(){}
			
		//You should never, ever, bind an anonymous function
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
		
		Events.prototype._print = function(){
			console.log("targets:", targets);
			console.log("functions:", functions);
			console.log("junctions:", junctions);
		};
			
		Events.prototype.broadcast = function(event, data, target){
			target = target || NO_TARGET;	//0 means no specific target
			
			var i,
				l = junctions.length
			;
			
			for(i=l-1; i>=0; i--){
				if(junctions[i]){
					if(junctions[i][EVENT] == event){
						if(targets[junctions[i][TARGET]] == target || target === NO_TARGET){
							if(functions[junctions[i][FUNCTION]] instanceof Function || typeof functions[junctions[i][FUNCTION]] === "function"){
								functions[junctions[i][FUNCTION]](data);
							}
							else{
								console.log("Discrepancy found, flushing events.");
								singleton.flush();
							}
						}
					}
				}
			}
		};
			
		Events.prototype.flush = function(){
			//Sweep through arrays to remove orphans
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