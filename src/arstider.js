/**
 * //Main Package//
 *
 * @Author Frederic Charette <fredericcharette@gmail.com>
 *
 * @Version
 *	- Concept (Feb 9 2012)
 *  - v0.0.1 (Dec 11 2012) : Rough draft - build tools
 *  - v0.0.2 (Jan 2013) : First re-write attempt - Dojo classes
 *  - v0.0.3 (April 12 2013) : Second re-write attempt - Pure javascript
 *
 *	//LICENCE
 *	This program is free software; you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation; either version 3 of the License, or
 *	(at your option) any later version.
 *	
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *	GNU General Public License for more details.
 *	
 *	You should have received a copy of the GNU General Public License
 *	along with this program. If not, see <http://www.gnu.org/licenses/>. 	
 */

;(function(window){
	
	/**
	 * //Main Arstider instance//
	 * 
	 * Attributes are given inside an object an can be as follow:
	 *	 - debug : true | false 									//Toggles extensive debug. Default is False.
	 *	 - exceptions : true | false								//Toggles the use of exceptions throwing (can be used along extensive debug). Default is False.
	 *	 - stopOnError : true | false								//Toggles the stopping of the app when an error is encountered. Default is False.
	 */
	
	var Ar = function(props) {
		var 
			STATE = {LOADING:0, STOP:1, PLAY:2, PAUSE:3, ERROR:4},
			maxLayerSize = 4096,
			selfRef = this
		;
		
		window.requestAnimFrame = (function(){
		  return  window.requestAnimationFrame       || 
				  window.webkitRequestAnimationFrame || 
				  window.mozRequestAnimationFrame    || 
				  window.oRequestAnimationFrame      || 
				  window.msRequestAnimationFrame     || 
				  function( callback ){
					window.setTimeout(callback, 17 /*60 fps*/);
				  };
		})();
		
		this.debug = props.debug || false;
		this.exceptions = props.exceptions || false;
		this.stopOnError = props.stopOnError || false;
		
		function loadError(err) {
			if(selfRef.debug && console) {
				console.error("Load Error :: " + err);
			}
			if(selfRef.exceptions) {
				throw err;
			}
		}
		
		function systemError(err, data) {
			if(selfRef.debug && console) {
				console.error("System Error :: " + err);
				if(data) {
					console.error(data);
				}
			}
			if(selfRef.exceptions) {
				throw err;
			}
			if(selfRef.stopOnError) {
				window.requestAnimFrame = null;
			}
		}
	