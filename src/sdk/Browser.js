/**
 * Browser
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){

	var 
		/**
		 * Singleton static
	 	 * @private
	 	 * @type {Browser|null}
	 	 */
		singleton = null,
		/**
		 * User agent static
	 	 * @const
	 	 * @private
	 	 * @type {string}
	 	 */
		uagent = navigator.userAgent.toLowerCase()
	;
	
	/**
	 * Returns the device's iOS version, based on User Agent
	 * @private
	 * @type {function}
	 * @return {number} The version of iOS
	 */
	function detect_iOS_version(){
		var start = uagent.indexOf('os ');
	    if((uagent.indexOf('iphone') > -1 || uagent.indexOf('ipad') > -1) && start > -1) return window.Number(uagent.substr(start + 3, 3).replace('_', '.'));
	    return 0;
	}
	
	/**
	 * Defines the Browser module
	 */
	define( "Arstider/Browser", [], /** @lends Browser */	function(){
		
		if(singleton != null) return singleton;
	
		/**
		 * Browser module constructor
		 * Analyses browser and platform info, provides basic feature detection
		 * @class Browser
		 * @constructor
		 */
		function Browser(){	
			
			/**
			 * Current platform (iphone, ipad, ipod, android, windows, mac, ...)
			 * @type {string}
			 */
			this.platform = navigator.platform;
			/**
			 * Current platform version
			 * @type {number}
			 */
			this.platformVersion = 0;
			/**
			 * Current app name (firefox, chrome, safari, ie, unknown)
			 * @type {string}
			 */
			this.name = navigator.appName;
			/**
			 * Current app version
			 * @type {number}
			 */
			this.version = parseFloat(navigator.appVersion);
			/**
			 * Is current platform a mobile device
			 * @type {boolean}
			 */
			this.isMobile = false;
			/**
			 * Is current app supported
			 * @type {boolean}
			 */
			this.isSupported = true;
	
			/**
			 * Platform
			 */
			if(navigator.platform.indexOf('iPhone') != -1){
				this.isMobile = true;
				this.platform = 'iphone';
				this.platformVersion = detect_iOS_version();
			}
			else if(navigator.platform.indexOf('iPod') != -1){
				this.isMobile = true;
				this.platform = 'ipod';
				this.platformVersion = detect_iOS_version();
			}
			else if(navigator.platform.indexOf('iPad') != -1){
				this.isMobile = true;
				this.platform = 'ipad';
				this.platformVersion = detect_iOS_version();
			}
			else if(navigator.userAgent.indexOf('Android') != -1){
				this.isMobile = true;
				this.platform = 'android';
				if (/android (\d+\.\d+)/.test(uagent)) {
					this.platformVersion = parseFloat(RegExp.$1);
				}
			}
			else if(navigator.platform.indexOf('Win') != -1){
				this.platform = 'windows';
				this.platformVersion = 0;
			}
			else if(navigator.platform.indexOf('Mac') != -1){
				this.platform = 'mac';
				if(/os x (\d+\_\d+)/.test(uagent)){
					var ver = RegExp.$1;
					ver = ver.replace('_', '.');
					this.platformVersion = parseFloat(ver);
				}
			}
				
			/**
			 * Browser
			 */
			if(uagent.indexOf('firefox') != -1){
				this.name = 'firefox';
				if (/firefox[\/\s](\d+\.\d+)/.test(uagent))
					this.version = parseFloat(RegExp.$1);
			}
			else if(uagent.indexOf('msie') != -1 ){
				this.name = 'ie';
				this.version = parseFloat( (uagent.indexOf('msie') != -1) ? parseInt(uagent.split('msie')[1]) : false);
			}
			else if(uagent.indexOf('trident') != -1 && uagent.indexOf('msie') == -1){
				//IE 10 and up
				this.name = 'ie';
				this.version = parseFloat(uagent.substring(uagent.indexOf('rv:')+3, uagent.indexOf(')')));
			}
			else if(uagent.indexOf('chrome') != -1){
				this.name = 'chrome';
				if (/chrome[\/\s](\d+\.\d+)/.test(uagent))
					this.version = parseFloat(RegExp.$1);
			}
			else if(uagent.indexOf('applewebkit') != -1){
				this.name = 'safari';
				if (/version[\/\s](\d+\.\d+)/.test(uagent))
					this.version = parseFloat(RegExp.$1);
			}
			else {
				this.name = 'unknown';
			}
			
			this.isSupported = this.checkSupport();
		}
			
		/**
		 * Checks if the browser if supported
		 * @type {function(this:Browser)}
		 */
		Browser.prototype.checkSupport = function(list){
		
			var 
				i = 0,
				requirements = list || [
					{"name":"ie","minVersion":8},
					{"name":"firefox","minVersion":3.5},
					{"name":"safari","minVersion":5},
					{"name":"chrome"},
					{"name":"unknown"}	//Can remove if major issues appear
				]
			;
			
			for(i; i < requirements.length; i++){
				if(requirements[i].name == this.name){
					if(requirements[i].minVersion == undefined || parseFloat(this.version) >= requirements[i].minVersion) return true;
					
					if(Arstider.verbose > 0) console.warn("Arstider.Browser: browser version not supported");
					return false;
				}
			}
			if(Arstider.verbose > 0) console.warn("Arstider.Browser: browser not supported");
			return false;
		};
		
		singleton = new Browser();
		return singleton;
	});
})();