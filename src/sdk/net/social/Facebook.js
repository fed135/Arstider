define("Arstider/net/social/Facebook", 
[],
function(){

	Facebook.CONNECTED = "connected";

	Facebook.requiredPermissions = ["user_friends", "user_location"];

	function Facebook(){
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
		 * Whether the divs and libs for facebook are loading
		 * @private
		 * @type {boolean}
		 */
		this.loading = false;

		this.handle = null;
		this.pending = [];
	}

	Facebook.prototype.getHandle = function(callback){

		var
			thisRef = this
		;

		if(this.handle){
			callback(this.handle);
			return;
		}

		if(this.loading){
			this.pending.push(callback);
			return;
		}

		this.loading = true;

		/**
		 * Creates requirejs shim for facebook
		 */
		requirejs.config({
			shim:{
				"facebook":{
					exports:"FB"
				}
			},
			paths:{
				"facebook": "//connect.facebook.net/en_US/all"
			}
		});

		requirejs(["facebook"], function(){
			var fbBase = window.document.createElement("div");
			fbBase.id = "fb-root";
			window.document.body.appendChild(fbBase);
			thisRef.handle = FB;
			thisRef.loading = false;
			callback(FB);
			thisRef._handleLoadedCallback.call(thisRef, FB);

		});
	};

	Facebook.prototype._handleLoadedCallback = function(handle){

		var
			i = 0
		;

		for(i; i<this.pending.length; i++){
			this.pending[i](handle);
		}

		this.pending.length = 0;
	};

	Facebook.prototype.init = function(props, callback){

		this.getHandle(function(handle){
			handle.init(props);
			if(callback) callback();
		});
	};

	Facebook.prototype.login = function(permissions, callback, error){

		var
			thisRef = this,
			handle
		;

		this.getHandle(function(handle){
			handle.getLoginStatus(function(response){
				if(response.status === Facebook.CONNECTED){
 					if(response.authResponse){
 						thisRef._handleConnectionSuccessful.call(thisRef, response.authResponse, callback);
					}
					else{
						permissions = thisRef._mixPermissions(permissions);
						
						FB.login(function(response){
							if(response.authResponse){
								thisRef.login.call(thisRef, [], callback, error);
							}else{
								if(error) error(response);
							}
						}, {scope:permissions});
					}
				}
			});
		});
	};

	Facebook.prototype._mixPermissions = function(permissions){

		var
			i = 0
		;

		if(!permissions || permissions.length === 0) return "";

		for(i; i<Facebook.requiredPermissions.length; i++){
			if(permissions.indexOf(Facebook.requiredPermissions[i]) == -1){
				permissions.push(Facebook.requiredPermissions[i]);
			}
		}

		return permissions;
	};

	Facebook.prototype._handleConnectionSuccessful = function(authResponse, callback){

		this._token = authResponse.accessToken;
		clearTimeout(this._sessionTimeout);
		this._sessionTimeout = setTimeout(this.login.bind(this), authResponse.expiresIn*1000);
		
		if(callback) callback();
	};
	

	Facebook.prototype.query = function(query, callback, error){

		var
			thisRef = this
		;

		this.getHandle(function(handle){
			handle.api(query, {"access_token":thisRef._token}, function(response){
				if(response.data){
					if(callback) callback(response.data);
				}
				else{
					if(error) error(response);
				}
			});
		});
	};

	return new Facebook();
});