/**
 * Keyboard
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
	var 
		/**
		 * Singleton static
		 * @private
		 * @type {Keyboard|null}
		 */
		singleton = null,
		/**
		 * Key map holds states for the keys
		 * @private
		 * @type {Object}
		 */
		keyMap = {},
		/**
		 * Holds the list of binds with their properties
		 * @private
		 * @type {Object}
		 */
		binds = {}
	;
	
	/**
	 * Converts keyCode to readable character name
	 * @private
	 * @type {function}
	 * @param {number} code The keyCode to convert
	 * @return {string} The readable character name
	 */
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
	
	/**
	 * Add document event listener for keydown
	 */
	document.addEventListener("keydown", function(event){
		var key = keyCodeToCharName(event.keyCode);
		
		keyMap[key] = 1;
		
		runCallbacks(key, "down");
	});
	
	/**
	 * Add document event listener for key release
	 */
	document.addEventListener("keyup", function(event){
		var key = keyCodeToCharName(event.keyCode);
		
		keyMap[key] = 1;
		
		runCallbacks(key, "up");
	});
	
	/**
	 * Prevent arrow scrolling
	 */
	window.addEventListener('keydown',  function(e){
		if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
			e.preventDefault();
			return false;
		};
	},false);
	
	/**
	 * Runs the list of callbacks associated with the keyboard event processed
	 * @private
	 * @type {function}
	 * @param {string} key The key that changed
	 * @param {string} action The action (up, down)
	 */
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
	
	/**
	 * Defines the Keyboard module
	 */
	define("Arstider/Keyboard", [], function(){
		
		if(singleton != null) return singleton;
		
		/**
		 * Keyboard constructor
		 * @constructor
		 */
		function Keyboard(){
			this.enabled = true;
		}
		
		/**
		 * Binds an event to a callback
		 * @type {function(this:Keyboard)}
		 * @param {Object} key The keyboard key
		 * @param {Object} action The action (up, down)
		 * @param {Object} callback The callback function
		 */
		Keyboard.prototype.bind = function(key, action, callback){
			if(!this.enabled) return;
			
			if(binds[key.toLowerCase()] == undefined){
				binds[key.toLowerCase()] = [];
			}
			
			binds[key.toLowerCase()].push([action, callback]);
		};
		
		/**
		 * Gets the status of a key in the map
		 * @type {function(this:Keyboard)}
		 * @param {string} key The readable character name to look for
		 * @return {number|null} The status of the key (1 for pressed, 0 or null for released)
		 */
		Keyboard.prototype.getKey = function(key){
			return keyMap[key];
		};
		
		/**
		 * Unbinds an event
		 * @type {function(this:Keyboard)}
		 * @param {string} key The keyboard key
		 * @param {Object} action The action (up, down)
		 * @param {Object} callback The callback function
		 */
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