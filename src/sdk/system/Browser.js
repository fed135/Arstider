/**
 * Browser
 * 
 * @version 1.1
 * @author frederic charette <fredericcharette@gmail.com>
 */
define( "Arstider/system/Browser", [], /** @lends Browser */	function(){
	
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
	 * User agent static
 	 * @const
 	 * @private
 	 * @type {string}
 	 */
	var uagent = navigator.userAgent.toLowerCase();

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
		if(uagent.indexOf('iphone') != -1){
			this.isMobile = true;
			this.platform = 'iphone';
			this.platformVersion = detect_iOS_version();
		}
		else if(uagent.indexOf('ipod') != -1){
			this.isMobile = true;
			this.platform = 'ipod';
			this.platformVersion = detect_iOS_version();
		}
		else if(uagent.indexOf('ipad') != -1){
			this.isMobile = true;
			this.platform = 'ipad';
			this.platformVersion = detect_iOS_version();
		}
		else if(uagent.indexOf('android') != -1){
			this.isMobile = true;
			this.platform = 'android';
			if (/android (\d+\.\d+)/.test(uagent)) {
				this.platformVersion = parseFloat(RegExp.$1);
			}
		}
		else if(uagent.indexOf('win') != -1){
			this.platform = 'windows';
			this.platformVersion = 0;
		}
		else if(uagent.indexOf('mac') != -1){
			this.platform = 'mac';
			if(/os x (\d+\_\d+)/.test(uagent)){
				var ver = RegExp.$1;
				ver = ver.replace('_', '.');
				this.platformVersion = parseFloat(ver);
			}
		}
		else if(uagent.indexOf('iemobile') != -1){
			this.isMobile = true;
			this.platform = 'windows';
		}
		if(uagent.indexOf("mobile") != -1 || uagent.indexOf("arm") != -1 || uagent.indexOf("touch") != -1){
			this.isMobile = true;
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
	
		var requirements = list || [
				{"name":"ie","minVersion":8},
				{"name":"firefox","minVersion":3.5},
				{"name":"safari","minVersion":5},
				{"name":"chrome"},
				{"name":"unknown"}	//Can remove if major issues appear
			]
		;
		
		for(var i = 0; i < requirements.length; i++){
			if(requirements[i].name == this.name){
				if(requirements[i].minVersion == undefined || parseFloat(this.version) >= requirements[i].minVersion) return true;
				
				Arstider.log("Arstider.Browser: browser version not supported", 1);
				return false;
			}
		}
		Arstider.log("Arstider.Browser: browser not supported", 1);
		return false;
	};
	
	return new Browser();
});