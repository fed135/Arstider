/**
* //Main Package//
*
* @Author Frederic Charette <fredericcharette@gmail.com>
*
* @Version
*	- 0.1.1 (Feb 9 2012) : Initial stub with basic parenting functionalities.
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

//TODO -> Redo all

;(function(window){
	
	//Private definitions
	
	var 
		Ar = {},			//Base Object
		classMap = [],		//Map of classes //Hidden
		rOnceNS = [],		//List of require once classnames
		debug = true,		//Shows logs, warns and errors from Arstider. (TODO: What about error handling ? Return an exeption ?)
		proto,				//Gets appropriate name of the prototype parameter, depending on the browser.
		console				//overrides the window console within this scope
	;
	
	//Assign Prototype value
	proto = ((Ar.__proto__ === undefined)?"prototype":"__proto__");
	
	//Looks through the classmap (see if we didnt already call a requireOnce class)
	function checkclassmap(c, add) {
		var i, l = classMap.length;
		for (i = 0; i < l; i++) {
			if (classMap[i] === c) {
				return false;
			}
		}
		if(add === true)
		{
			classMap.push(c);
		}
		return true;
	}
	
	//Take care of console output
	(function(){
		//Earlier versions of IE don't have a console object defined unless the console window is explicitly opened.
		var dummy = function (m) { return m; };
		if (window.console === undefined) {
			console = {error: dummy, warn:dummy, log:dummy};
		}
		else {
			if(debug === true) {
				console = window.console;
			}
			else{
				console = {error: dummy, warn:dummy, log:dummy};
			}
		}
	})();
	
	//Class definition
	function Class(stamp, body) {
		var 
			obj, 
			id, 
			b,
			i
		;
		
		id = stamp;
		b = body.body || {};
		
		for (obj in b) {
			if (b.hasOwnProperty(obj)) {
				if(b[obj] instanceof Function) {
					this[proto][obj] = b[obj];
				}
				else {
					this.__defineGetter__(obj, b[obj]);
					this.__defineSetter__(obj, b[obj]);
				}
			}
		}
		
		this.parent = body.parent || window;
		
		//extend by reference
		/*this.inherit = function() {
			var obj,i,getter,setter ;
			
			for(i = 0; i<arguments.length; i++) {
				for (obj in arguments[i]) {
					if (arguments[i].hasOwnProperty(obj)) {
						if(arguments[i][obj] instanceof Function) {
							if(this[obj] === undefined) {
								getter = arguments[i].__lookupGetter__(arguments[i][obj]);
								setter = arguments[i].__lookupSetter__(arguments[i][obj]);
								
								if ( getter || setter ) {
									if ( getter ) {
										this.__defineGetter__(arguments[i][obj], getter);
									}
									if ( setter ) {
										this.__defineSetter__(arguments[i][obj], setter);
									}
								} 
								else {
									this[obj] = arguments[i][obj];
								}
							}
						}
					}
				}
			}
		};*/
		
		//Defines init
		if(this.init === undefined) {
			this.init = function(){ return true;};
		}
		
		//Defines Test (Batch Unit testing)
		if(this.test === undefined) {
			this.test = function(){ return true;};
		}
		
		this.init();
		return this;
	}
	
	Ar.Class = function(body) {
		var
			def = false,	//Holds if we need to define or not
			cl				//Holds the return value of the class request
		;
		
		body = body || {};
		
		if(body.requireOnce === true || body.requireOnce === "true") {
			if(body.name !== undefined) {
				if(checkclassmap(this.name, (body.requireOnce!==undefined)) === false) {
					console.error("Class "+this.name+" has already been defined and specified as requiredOnce.");
					return false;
				}
				else {
					//Register passed the scan,
					//Allow AMD definition of Class
					def = true;
				}
			}
			else {
				console.error("Cannot reserve namespace without a proper 'name' parameter");
				return false;
			}
		}
		
		cl = new Class((Date.now()+""),body);
		
		if(cl === false) {
			console.error("Class creation Failed");
			return false;
		}
		else {
			if(def === true) {
				if (typeof define === "function" && define.amd) {
					define( ("ar."+body.name), function () { return cl; } );
				}
			}
			return cl;
		}
	};

	Ar.start = function (fct){
		document.addEventListener("DOMContentLoaded", function() {
			fct();
		});
	};
	
	window.Ar = Ar;
	
	//Allow AMD definition of Arstider
	if (typeof define === "function" && define.amd) {
		define( "arstider", function () { return Ar; } );
	}
})(window);