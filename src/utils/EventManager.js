;(function(window){
	var 
		//Const
		TARGET = 0,
		EVENT = 1,
		FUNCTION = 2,
		
		NO_TARGET = 0,
		NOT_FOUND = -1,
	
		EventManager = {},
		targets = [NO_TARGET],
		functions = [],
		junctions = []
	;
	
	//You should never, ever, bind an anonymous function
	EventManager.bind = function(event, fct, target){
		target = target || NO_TARGET;	//0 means no specific target
		
		var 
			i = isIn(fct, functions),
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
	
	EventManager.unbind = function(event, fct, target){
		target = target || NO_TARGET;	//0 means no specific target
		fct = fct || NOT_FOUND;
		
		var 
			i,
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
	
	EventManager.broadcast = function(event, data, target){
		target = target || NO_TARGET;	//0 means no specific target
		
		var 
			i,
			l = junctions.length
		;
		
		for(i=l-1; i>=0; i--){
			if(junctions[i][EVENT] == event){
				if(targets[junctions[i][TARGET]] == target || target === NO_TARGET){
					functions[junctions[i][FUNCTION]](data);
				}
			}
		}
	};
	
	EventManager.flush = function(){
		//Sweep through arrays to remove orphans
		cleanup(functions, FUNCTION);
		cleanup(targets, TARGET);
		
		//..then sort the junction table by event
		junctions.sort(function(x, y) {
		    return (x[EVENT] > y[EVENT]) ? 1 : ( (y[EVENT] > x[EVENT]) ? -1 : 0 );
		});
	};
	
	Object.prototype.bind = Function.prototype.bind = function(event, fct){
		EventManager.bind.apply(event, fct, this);
	};
	
	Object.prototype.unbind = Function.prototype.unbind = function(event, fct){
		EventManager.unbind.apply(event, fct, this);
	};
	
	Object.prototype.dispatch = Function.prototype.dispatch = function(event, data){
		EventManager.broadcast.apply(event, data, this);
	};
	
	function isIn(item, arr, key){
		var 
			i = 0,
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
		var 
			i,
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
	
	if ( typeof define === "function" && define.amd ) {
		define( "EventManager", [], function () { return EventManager; } );
	}
	else{
		window.EventManager = EventManager;
	}
	
})(window);