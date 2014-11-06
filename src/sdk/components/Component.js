/**
 * Component
 *
 * @version 2.0.1
 */
define("Arstider/components/Component", 
[], 
/** @lends components/Component */
function(){

	/**
	 * Component structure constructor
	 * Base structure for custom components
	 * @class components/Component
	 * @constructor
	 * @param {Object|null} data
	 * @param {Obejct|null} defaults Default values for the component   
	 */
	function Component(data, defaults){
		if(defaults) Arstider.deepMerge(defaults, this);

		if(data) Arstider.deepMerge(data, this);
	}

	return Component;
});