;(function(){

	var singleton = null;
	var uagent = navigator.userAgent.toLowerCase();
	
	function detect_iOS_version(){
		var start = uagent.indexOf('os ');
	 
	    if((uagent.indexOf('iphone') > -1 || uagent.indexOf('ipad') > -1) && start > -1){
	        return window.Number(uagent.substr(start + 3, 3).replace('_', '.'));
	    }
	    
	    return 0;
	}
	
		define( "Arstider/Browser", [], 
		function(){
			if(singleton != null) return singleton;
		
			function Browser(){	
	
				this.platform = navigator.platform;
				this.platformVersion = 0;
				this.name = navigator.appName;
				this.version = parseFloat(navigator.appVersion);
				this.isMobile = false;
				this.isSupported = null;
	
				//Platform
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
				
				//Browser
				if(uagent.indexOf('firefox') != -1){
					this.name = 'firefox';
					if (/firefox[\/\s](\d+\.\d+)/.test(uagent))
						this.version = parseFloat(RegExp.$1);
				}
				else if(uagent.indexOf('msie') != -1){
					this.name = 'ie';
					this.version = parseFloat( (uagent.indexOf('msie') != -1) ? parseInt(uagent.split('msie')[1]) : false);
				}
				else if(uagent.indexOf('chrome') != -1){
					this.name = 'chrome';
					if (/chrome[\/\s](\d+\.\d+)/.test(uagent))
						this.version = parseFloat(RegExp.$1);
				}
				else if(uagent.indexOf('safari') != -1){
					this.name = 'safari';
					if (/version[\/\s](\d+\.\d+)/.test(uagent))
						this.version = parseFloat(RegExp.$1);
				}
				else {
					this.name = 'unknown';
				}
				
				//TODO:Check support
			}
			
			Browser.prototype.checkSupport = function(){
				if(isSupported != null) return isSupported;
			
				var i, minBrowser, requirements = [
						{"name":"ie","minVersion":8},
						{"name":"firefox","minVersion":3.5},
						{"name":"safari","minVersion":5},
					], len = mydata.length;
				
				for(var i = 0; i < len; i++) {
					minBrowser = requirements[i];
					if((!minBrowser.name || this.name == minBrowser.name) &&
						(!minBrowser.platform || this.platform == minBrowser.platform)){
						if(minBrowser.minVersion < 0) {
							this.isSupported = false;
							return this.isSupported;
						}
						if(this.version < minBrowser.minVersion) {
							this.isSupported = false;
							return this.isSupported;
						}
						return true;
					}
				}
				
				this.isSupported = false;
				return false;
			};
			
			singleton = new Browser();
			return singleton;
		});
})();