/**
 * Keyboard
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

/*
 * Self-invoked singleton wrapper
 */
;(function(){
	
	var 
		singleton = null,
		keyMap = {},
		binds = {}
	;

	function keyCodeToCharName(code){
		if(code == 18) return "alt";
		if(code == 13) return "enter";
		if(code == 27) return "esc";
		if(code == 32) return "space";
		if(code == 37) return "left";
		if(code == 38) return "up";
		if(code == 39) return "right";
		if(code == 40) return "down";
		else return String.fromCharCode(code).toLowerCase();
	}

	document.addEventListener("keydown", function(e){
		var key = keyCodeToCharName(event.keyCode);
		
		keyMap[key] = 1;
		
		runCallbacks(key, "down");
	});
	
	document.addEventListener("keyup", function(e){
		var key = keyCodeToCharName(event.keyCode);
		
		keyMap[key] = 1;
		
		runCallbacks(key, "up");
	});

	function runCallbacks(key, action){
		if(binds[key] != undefined){
			for(var i = 0; i<binds[key].length; i++){
				if(action === binds[key][i][0]){
					if(binds[key][i][1] && (binds[key][i][1] instanceof Function || typeof binds[key][i][1] === 'function')){
						binds[key][i][1]();
					}
				}
			}
		}
	}

	define("Arstider/Keyboard", [], function(){
		
		if(singleton != null) return singleton;
		
		function Keyboard(){}
		
		Keyboard.prototype.bind = function(key, action, callback){
			if(binds[key.toLowerCase()] == undefined){
				binds[key.toLowerCase()] = [];
			}
			
			binds[key.toLowerCase()].push([action, callback]);
		};
		
		Keyboard.prototype.getKey = function(key){
			return keyMap[key];
		};
		
		Keyboard.prototype.unbind = function(key, action, callback){
			
			if(action == undefined || binds[key.toLowerCase()] == undefined){
				binds[key.toLowerCase()] = [];
			}
			else{
				if(callback == undefined){
					//keep stuff linked to other actions
					var i = binds[key.toLowerCase()].length;
					for(i; i>=0; i--){
						if(binds[key.toLowerCase()][i][0] == action){
							binds[key.toLowerCase()].splice(i,1);
						}
					}
				}
				else{
					var pos = binds[key.toLowerCase()].indexOf([action, callback]);
					if(pos != -1){
						binds[key.toLowerCase()].splice(pos,1);
					}
				}
			}
		};
		
		singleton = new Keyboard();
		return singleton;
	});
})();