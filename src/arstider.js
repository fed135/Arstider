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

	
/**
 * //Main Arstider instance//
 * 
 * Attributes are given inside an object an can be as follow:
 *	 - debug : true | false 									//Toggles extensive debug. Default is False.
 *	 - exceptions : true | false								//Toggles the use of exceptions throwing (can be used along extensive debug). Default is False.
 *	 - stopOnError : true | false								//Toggles the stopping of the app when an error is encountered. Default is False.
 * 	 - performanceAdapter : true | false						//Toggles the automatic performance enhancer: automatically reduces target FPS and physics accuracy. Default is False.
 * 	 - fps : int												//Sets target FPS. Default is 60.
 * 	 - physicsAccuracy : int									//Sets physics accuracy (if box2dweb implementation is present). Default is 10 - (lower = less accuracy).
 */

var Ar = function(props) {
	
	var 
		selfRef = this
	;
	
	//Call proper css fixes and polyfills depending on platform
	window.document.body.style["-webkit-tap-highlight-color"] = "rgba(0, 0, 0, 0)";
	window.offscreenBuffering = false;
	
	//Set proprieties
	this.debug = props.debug || false;
	this.exceptions = props.exceptions || false;
	this.stopOnError = props.stopOnError || false;
	this.performanceAdapter = props.performanceAdapter || false;
	this.fps = props.fps || 60;
	this.physicsAccuracy = props.physicsAccuracy || 10;
	
	//Set vendor prefixed requestAnimationFrameValue
	window.requestAnimFrame = (function(a){
		  return  window.requestAnimationFrame       || 
				  window.webkitRequestAnimationFrame || 
				  window.mozRequestAnimationFrame    || 
				  window.oRequestAnimationFrame      || 
				  window.msRequestAnimationFrame     || 
				  function( callback ){
					window.setTimeout(callback, (1000/a) );
				  };
	})(this.fps);
	
	//Arstider error method
	this.error = function(err, data) {
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
};
