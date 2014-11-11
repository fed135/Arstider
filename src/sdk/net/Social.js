/**
 * Social
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */
define("Arstider/net/Social", 
[
	"Arstider/net/social/Facebook"
], 
/** @lends net/Social */ 
function(Facebook){
	
	Social.FACEBOOK = "facebook";

	/**
	 * Social constructor
	 * An entry point for social network integration
	 * @class Social
	 * @constructor
	 */
	function Social(){}
	
	/**
	 * Logs in to a social network
	 * @param {string} network
	 * @param {} props
	 */
	Social.prototype.login = function(network, props, permissions, callback, error){
		
		if(network == Social.FACEBOOK){
			Facebook.init(props);

			Facebook.login(permissions, callback, error);
		}
	};

	Social.prototype.api = function(network, query, callback, error){

		if(network == Social.FACEBOOK){
			Facebook.query(query, callback, error);
		}
	};
	
	return new Social();
});