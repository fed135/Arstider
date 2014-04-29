/**
 * Social
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

;(function(){
	
	var 
		/**
		 * Singleton static
		 * @private
		 * @type {Social|null}
		 */
		singleton = null,
		
		/**
		 * Facebook Static
		 * @private
		 * @const
		 * @type {string}
		 */
		FACEBOOK = "facebook"
	;
	
	/**
	 * Creates requirejs shim for facebook
	 */
	require.config({
		shim:{
			"facebook":{
				exports:"FB"
			}
		},
		paths:{
			"facebook": "//connect.facebook.net/en_US/all"
		}
	});
	
	/**
	 * Defines the Social module
	 */
	define("Arstider/Social", ["Arstider/Request"], function(Request){
		
		/**
		 * Social constructor
		 * @constructor
		 */
		function Social(){
			/**
			 * The network currently logged into
			 * @type {string}
			 */
			this.currentNetwork = "";
			
			/**
			 * User login token
			 * @private
			 * @type {string}
			 */
			this._token = "";
			/**
			 * User session timeout timer(for reconnection)
			 * @private
			 * @type {number|null}
			 */
			this._sessionTimeout = null;
			
			/**
			 * User object, fetched on login
			 * @type {Object}
			 */
			this.user = null;
			
			/**
			 * The list of friends, fetched on login
			 * @type {Array}
			 */
			this.friends = [];
			
			/**
			 * Whether the divs and libs for facebook are loaded
			 * @private
			 * @type {boolean}
			 */
			this._facebookSetupped = false;
		}
		
		/**
		 * Logs in to a social network
		 * @param {string} network
		 * @param {} props
		 */
		Social.prototype.login = function(network, props, callback){
			var thisRef = this;
			
			if(network == FACEBOOK){
				this.currentNetwork = FACEBOOK;
				require(["facebook"], function(){
					if(!this._facebookSetupped){
						var fbBase = document.createElement("div");
						fbBase.id = "fb-root";
						document.body.appendChild(fbBase);
						FB.init({
							appId:props.appId,
							cookie:props.cookie,
							frictionlessRequests:true
						});
						this._facebookSetupped = true;
					}	
					
					FB.login(function(response){
						if(response.authResponse){
							FB.api('/me', function(response){
								thisRef.user = response;
								FB.api('/friends', function(response){
									thisRef.friends = response;
									if(callback) callback();
								});
							});
						}else{
							console.log('User cancelled login or did not fully authorize.');
						}
					}, {scope:(props.permissions || []).join()});
				});
			}
		};
		
		singleton = new Social();
		return singleton;
	});
})();