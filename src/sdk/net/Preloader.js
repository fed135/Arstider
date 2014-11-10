/**
 * Preloader
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/net/Preloader", 
[
	"Arstider/events/Signal",
	"Arstider/managers/AssetManager"
], 
/** @lends Preloader */ 
function(Signal, AssetManager) {

	/**
	 * Preloader constructor
	 * The screen preloading logic
	 * @class net/Preloader
	 * @constructor
	 */
	function Preloader(){
		
		/**
		 * The list of items in the preload queue
		 * @private
		 * @type {Array}
		 */
		this._queue = [];
	
		this.onprogress = new Signal();
		this.oncomplete = new Signal();
	}
		
	/**
	 * Resets the preloader and prepares the load of a new screen
	 * @type {function(this:Preloader)}
	 * @param {string} name The name of the screen that is about to be preloaded
	 */
	Preloader.prototype.setManifest = function(manifest){
		
		var 
			i = 0,
			thisRef = this
		;

		this._queue.length = 0;

		for(i; i<manifest.length; i++){
			this._queue.push({
				url:manifest[i],
				loaded:0
			});

			(function(_i){
				Net.get({
					url:manifest[_i],
					onprogress:function(e){
						thisRef._progress.call(thisRef, _i, Math.floor((e.loaded/e.total)*100));
					}
				}).then(function(res){
					thisRef._progress.call(thisRef, _i, 100);
					AssetManager.register(manifest[_i], res.response);
				},function(error){
					thisRef._progress.call(thisRef, _i, 100);
					Arstider.log("Preloading Error: ", manifest[_i], " : ", error);
				});
			})(i);
		}
	};
	
	/**
	 * Updates the progress of a preload item
	 * @type {function(this:Preloader)}
	 * @param {string} key The name of the preload item
	 * @param {number} value The percentage value of the item that is loaded (delayed if)
	 */
	Preloader.prototype._progress = function(id, value){
		
		var
			len = this._queue.length,
			currTotal = 0
		;
		
		if(this._queue[i]){
			this._queue[i].loaded = value;
		}
		
		currTotal = this.totalPercent();
		this.onprogress.dispatch(currTotal);
		if(currPcent >= 100) this.oncomplete.dispatch();
	};
		
	/**
	 * Returns the total percentage loaded
	 * @type {function(this:Preloader)}
	 * @return {number} The average percentage of loaded items
	 */
	Preloader.prototype._getTotal = function(){

		var
			i,
			len = this._queue.length,
			total = 0
		;
		
		for(i = len-1; i>=0; i--){
			total += this._queue[i].loaded;
		}
			
		return Arstider.floor(total/len);
	};

	return new Preloader();
});