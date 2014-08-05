/**
 * Webgl Shader manager
 * 
 * @version 1.1.4
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
	var
	    singleton = null
	;

	define("Arstider/contexts/webgl/Shader", ["Arstider/Request"], function(Request){
		
		if(singleton != null) return singleton;

		function Shader(){
			this.fragmentStore = {};
			this.vertexStore = {};
		}

		Shader.prototype.load = function(type, url, callback){
			var req = new Request({
                url:url,
                cache:true,
                track:true,
                caller:singleton,
                mimeOverride:"text",
                async:false,
                callback:function(res){
                    singleton[type+"Store"][url] = {script: res, type: type};
                    if(callback) callback(singleton[type+"Store"][url]);
                }
            }).send();
		};

		Shader.prototype.get = function(type, url, callback){
			if(singleton[type+"Store"][url]){
				if(callback) callback(singleton[type+"Store"][url]);
			}
			else{
				singleton.load(type, url, callback);
			}
		};

		singleton = new Shader();
		return singleton;
	});
})();