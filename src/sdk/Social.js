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
					if(!thisRef._facebookSetupped){
						var fbBase = document.createElement("div");
						fbBase.id = "fb-root";
						document.body.appendChild(fbBase);
						FB.init({
							appId:props.appId,
							cookie:props.cookie,
							frictionlessRequests:true
						});
						thisRef._facebookSetupped = true;
					}	
					
					FB.getLoginStatus(function(response){
  						if(response.status === 'connected'){
  							if(response.authResponse){
								thisRef._token = response.authResponse.accessToken;
								thisRef._sessionTimeout = setTimeout(function(){thisRef.login.apply(thisRef, [FACEBOOK]);}, response.authResponse.expiresIn*1000);
							}
  							FB.api('/me', function(response){
								thisRef.user = response;
								FB.api('/me/friends', {"access_token":thisRef._token}, function(response){
									thisRef.friends = response.data;
									if(callback) callback();
								});
							});
						}
						else{
							props = props || {};
							props.permissions = props.permissions || [];
							if(props.permissions.indexOf("user_friends") == -1) props.permissions.push("user_friends");
							if(props.permissions.indexOf("user_location") == -1) props.permissions.push("user_location");
							
							FB.login(function(response){
								if(response.authResponse){
									thisRef._token = response.authResponse.accessToken;
									thisRef._sessionTimeout = setTimeout(function(){thisRef.login.apply(thisRef, [FACEBOOK]);}, response.authResponse.expiresIn*1000);
									
									thisRef.login.apply(thisRef, [FACEBOOK, {}, callback]);
								}else{
									console.log('User cancelled login or did not fully authorize.');
								}
							}, {scope:props.permissions.join()});
						}
					});
				});
			}
		};
		
		singleton = new Social();
		return singleton;
	});
})();