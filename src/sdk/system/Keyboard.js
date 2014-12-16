/**
 * Keyboard
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/system/Keyboard", 
[
	"Arstider/core/Dataset"
], 
/** @lends system/Keyboard */ 
function(Dataset){
	
	Keyboard.DEFAULTS = {
		aliases:{
			13:"enter",
			16:"shift",
			18:"alt",
			27:"escape",
			32:"space",
			37:"left",
			38:"up",
			39:"right",
			40:"down"
		},
		enabled:true,
		preventScrolling:true
	};

	Keyboard.PRESSED = "pressed";
	Keyboard.RELEASED = "released";

	Keyboard.ANY_KEY = "any";

	/**
	 * Keyboard constructor
	 * A keyboard event mapper
	 * @class system/Keyboard
	 * @constructor
	 */
	function Keyboard(){

		var
			thisRef = this
		;

		this._map = {};
		this._binds = {};

		/**
		 * Add document event listener for keydown
		 */
		window.document.addEventListener("keydown", function(event){
			thisRef.handleKeyEvent.call(thisRef, event, Keyboard.PRESSED);
		});

		/**
		 * Add document event listener for key release
		 */
		window.document.addEventListener("keyup", function(event){
			thisRef.handleKeyEvent.call(thisRef, event, Keyboard.RELEASED);
		});

		Arstider.utils.Super(this, Dataset, Keyboard.DEFAULTS);
	}
	Arstider.utils.Inherit(Keyboard, Dataset);

	Keyboard.prototype.handleKeyEvent = function(event, state){
		
		var 
			e = event || window.event,
			key = this.getCharName(event.keyCode)
		;
			
		this._map[key] = (state == Keyboard.PRESSED);
		this.runCallbacks(key, state);
		
		if(this.preventScrolling){
			//Prevent page scrolling. That very annoying browser behavior.
			if(event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 32){
				e.stopPropagation();
				e.preventDefault();

				return false;
			}
		}
	};

	/**
	 * Runs the list of callbacks associated with the keyboard event processed
	 * @private
	 * @type {function}
	 * @param {string} key The key that changed
	 * @param {string} action The action (up, down)
	 */
	Keyboard.prototype.runCallbacks = function(key, action){

		var
			i = 0
		;

		if(this._binds[key] != undefined){
			for(i; i<this._binds[key].length; i++){
				if(action === this._binds[key][i][0]){
					if(this._binds[key][i][1]) this._binds[key][i][1]();
				}
			}
		}

		if(key != Keyboard.ANY_KEY) this.runCallbacks(Keyboard.ANY_KEY, action);
	};
	
	Keyboard.prototype.getCharName = function(code){

		if(this.aliases[code]) return this.aliases[code];
		return String.fromCharCode(code).toLowerCase();
	};

	/**
	 * Binds an event to a callback
	 * @type {function(this:Keyboard)}
	 * @param {Object} key The keyboard key
	 * @param {Object} action The action (up, down)
	 * @param {Object} callback The callback function
	 */
	Keyboard.prototype.bind = function(key, action, callback){

		var
			index = key.toLowerCase()
		;

		if(!this.enabled) return;
		
		if(this._binds[index] == undefined) this._binds[index] = [];
		this._binds[index].push([action, callback]);
	};
	
	/**
	 * Gets the status of a key in the map
	 * @type {function(this:Keyboard)}
	 * @param {string} key The readable character name to look for
	 * @return {number|null} The status of the key (1 for pressed, 0 or null for released)
	 */
	Keyboard.prototype.getKey = function(key){

		var
			i
		;

		if(key == Keyboard.ANY_KEY){
			for(i in this._map){
				if(this._map[i] == 1) return 1;
			}
			return 0;
		}
		else return this._map[key];
	};
	
	/**
	 * Unbinds an event
	 * @type {function(this:Keyboard)}
	 * @param {string} key The keyboard key
	 * @param {Object} action The action (up, down)
	 * @param {Object} callback The callback function
	 */
	Keyboard.prototype.unbind = function(key, action, callback){
		
		var
			index = key.toLowerCase(),
			i = this._binds[index].length-1,
			pos = this._binds[index].indexOf([action, callback])
		;

		if(action == undefined || this._binds[index] == undefined){
			this._binds[index] = [];
		}
		else{
			if(callback == undefined){
				//keep stuff linked to other actions
				for(i; i>=0; i--){
					if(this._binds[index][i][0] == action) this._binds[index].splice(i,1);
				}
			}
			else{
				if(pos != -1) this._binds[index].splice(pos,1);
			}
		}
	};
	
	return new Keyboard();
});