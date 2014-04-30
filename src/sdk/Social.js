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
		Social.prototype.login = function(network, props, callback, error){
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
								clearTimeout(thisRef._sessionTimeout);
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
									thisRef.login.apply(thisRef, [FACEBOOK, {}, callback, error]);
								}else{
									if(error) error(response);
								}
							}, {scope:props.permissions.join()});
						}
					});
				});
			}
		};
		
		/**
		 * Gets information about a person
		 * @type {function(this:Social)}
		 * @param {string} uid The id of the person
		 * @param {Array} The list of fields to collect
		 * @param {function|null} callback The function to call once the url is fetched
		 * @param {function|null} error The callback in case of an error
		 */
		Social.prototype.getInfo = function(uid, fields, callback, error){
			var 
				friendObj = this.getUser(uid),
				i = 0
			;
			
			fields = fields || [];
			
			for(i; i<fields.length; i++){
				if(!(fields[i] in friendObj)){
					if(this.currentNetwork == FACEBOOK){
						FB.api("/"+uid, {"access_token":this._token, "fields":fields.join()}, function(response){
							if(response.data){
								Arstider.mixin(friendObj, response.data, true);
								if(callback) callback(friendObj);
							}
							else{
								if(error) error(response);
							}	
						});
					}
					return;
				}
			}
			
			if(callback) callback(friendObj);
		};
		
		/**
		 * Gets the picture for a user
		 * @type {function(this:Social)}
		 * @param {string} uid The id of the user 
		 * @param {number|null} width The desired width of the picture
		 * @param {number|null} height The desired height of the picture
		 * @param {function|null} callback The function to call once the url is fetched
		 * @param {function|null} error The callback in case of an error
		 */
		Social.prototype.getPictureUrl = function(uid, width, height, callback, error){
			var 
				friendObj = this.getUser(uid),
				storageName = "picture_" + Arstider.checkIn(width, 100) + "x" + Arstider.checkIn(height, 100)
			;
			
			if(friendObj[storageName]){
				if(callback) callback(friendObj[storageName]);
				return;
			}
			
			if(this.currentNetwork == FACEBOOK){
				FB.api("/"+uid+"/picture?width="+Arstider.checkIn(width, 100)+"&height="+Arstider.checkIn(height, 100), {"access_token":this._token}, function(response){
					if(response.data && response.data.url){
						friendObj[storageName] = response.data.url;
						if(callback) callback(friendObj[storageName]);
					}
					else{
						if(error) error(response);
					}	
				});
			}
		};
		
		/**
		 * Gets the picture for a user
		 * @type {function(this:Social)}
		 * @param {string} uid The id of the user 
		 * @return {Object} The user object
		 */
		Social.prototype.getUser = function(uid){
			var 
				friendObj = null,
				i = 0
			;
			
			//check if current player
			if(uid == "me" || uid == this.user.id) friendObj = this.user;
			else{
				//check current list
				for(i; i<this.friends.length; i++){
					if(this.friends[i].id == uid){
						friendObj = this.friends[i];
						break;
					}
				}
				
				//create user if it doesn't exist
				if(friendObj == null){
					friendObj = {id:uid};
					this.friends.push(friendObj);
				}
			}
			
			return friendObj;
		};
		
		singleton = new Social();
		return singleton;
	});
})();