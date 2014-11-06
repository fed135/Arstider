/**
 * Display Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Display",
[
	"Arstider/components/Component",
	"Arstider/managers/AssetManager",
	"Arstider/events/Signal"
],
/** @lends components/Display */
function(Component, AssetManager, Signal){
	
	Display.DEFAULTS = {
		alpha:1,
		outline:{
			color:"red",
			size:1,
			visible:false
		},
		crop:{
			x:0,
			y:0,
			width:null,
			height:null
		},
		mask:false,
		composite:Arstider.defaultComposition
	};

	function Display(data){
		this.data = null;

		/**
		 * Dispatched when element data has finished loading
		 */
		this.onload = new Signal();

		/**
		 * Called after disposal of data
		 */
		this.onunload = new Signal();

		/**
		 * Called in case of a load error
		 */
		this.onerror = new Signal()
	}

	Display.prototype.load = function(url, callback, errorCallback){

		var
			thisRef = this
		;

		AssetManager.get(url, 
			function(data){
				thisRef.data = data;
				thisRef.onload.dispatch();
				if(callback) callback(data);
			},
			function(error){
				thisRef.onerror.dispatch();
				if(errorCallback) errorCallback(error);
			}
		);
	}

	Display.prototype.dispose = function(){
		this.data = null;
	};

	return Display;
});