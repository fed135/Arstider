/**
 * Abstract dataset superclass
 *
 * @version 2.0.1
 * @author frederic charette <fredc@meetfidel.com>
 */
define("Arstider/core/Dataset", 
[], 
/** @lends core/Dataset */
function(){
	
	/**
	 * Abstract dataset constructor
	 * A basic construct for modules that need to handle multiple config sources
	 * @class core/Dataset
	 * @constructor
	 * @param {Object|null} def Optional default set.
	 * @param {function|null} parser Optional post-load operation on config load.
	 */
	function Dataset(def, parser){

		/**
		 * The data set that comes from the config file, second in priority to the runtime set (defined at runtime)
		 * @private
		 * @type {Object}
		 */
		this._defaultSet = def || {};

		/**
		 * The data set that is defined in external config files.
		 * @private
		 * @type {Object}
		 */
		this._configSet = {};

		/**
		 * The data set that is defined at runtime, also serves as a cache for localStorage
		 * @private
		 * @type {Object}
		 */
		this._runtimeSet = {};

		/**
		 * Stored data url (require path)
		 * @private
		 * @type {string|null}
		 */
		this._dataUrl = null;

		/**
		 * Post-launch parsing method
		 * @private
		 * @type {function|null}
		 */
		this.parser = parser;

		if(this.parser) this.parser(this._defaultSet);
	}

	Dataset.prototype.load = function(dataUrl){
		this._dataUrl = dataUrl;

		var thisRef = this;
		requirejs([dataUrl], function(v){
			thisRef._configSet = v;
			if(thisRef.parser) thisRef.parser.call(thisRef, thisRef._configSet);
		});
	};

	Dataset.prototype.reload = function(){
		if(this._dataUrl != null){
			requirejs.unset(this._dataUrl);
			this.load(this._dataUrl);
		}
	};

	Dataset.prototype.get = function(key){
		return Arstider.firstOf([
			this._runtimeSet[key],
			this._configSet[key],
			this._defaultSet[key]
		], null);
	};

	Dataset.prototype.set = function(key, val){
		this._runtimeSet[key] = val;
	};

	return Dataset;
});