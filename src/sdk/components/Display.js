/**
 * Display Component
 * 
 * @version 2.0.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/components/Display",
[
	"Arstider/managers/AssetManager",
	"Arstider/events/Signal"
],
/** @lends components/Display */
function(AssetManager, Signal){
	
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

	Display.namespace = "display";

	function Display(){

		this.data = null;
	}

	Display.prototype.load = function(url, callback, errorCallback){

		var
			thisRef = this
		;

		AssetManager.get(url, 
			function(data){
				thisRef.data = data;
				if(thisRef.owner.onload) thisRef.owner.onload.dispatch();
				if(callback) callback(data);
			},
			function(error){
				if(thisRef.owner.onerror) thisRef.owner.onerror.dispatch();
				if(errorCallback) errorCallback(error);
			}
		);
	}

	Display.prototype.dispose = function(){
		this.data = null;
	};

	return Display;
});