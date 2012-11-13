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

var Ar = {};
Ar.classmap = [];
Ar.extmap = [];
if (console === undefined) {
	console = {error: function (m) { return m; }};
}
Ar.proto = ((Ar.__proto__ === undefined)?"prototype":"__proto__");

function checkclassmap(c, add) {
	var i, l = Ar.classmap.length;
	for (i = 0; i < l; i++) {
		if (Ar.classmap[i] === c) {
			return false;
		}
	}
	if(add === true)
	{
		Ar.classmap.push(c);
	}
	return true;
}

function checkextmap(c) {
	var i, l = Ar.extmap.length;
	for (i = 0; i < l; i++) {
		if (Ar.extmap[i] === c) {
			return false;
		}
	}
	return true;
}

function Class(path, body) {
	var obj, data, i, crawler, t;
	
	this.type = "Class";
	
	if(!(path instanceof String) && !(typeof path === "string")) {
		//unregistered
		body = path;
	}
	else
	{
		data = path.split(".");
		
		if(data.length <=1) {
			console.error("Invalid path parameter at "+path+" expecting \"Package.Class\" format.");
			return false;
		}
		
		crawler = window;
		t=data.concat();
		while(t.length >1) {
			if(crawler[t[0]] !== undefined) {
				crawler = t[0];
				t.splice(0,1);
			}
			else {
				console.error("Invalid path : "+data);
				return false;
			}
		}
		t=crawler=null;
		
		//Sets registered Class-specific values
		this.name = data[data.length-1];
		this.parent = data[data.length-2];
	}
	
	if(checkclassmap(this.name, (body.requireOnce!==undefined)) === false) {
		console.error("Class "+this.name+" has already been defined and specified as requiredOnce.");
		return false;
	}
	
	for (obj in body) {
		if (body.hasOwnProperty(obj)) {
			this[obj] = body[obj];
		}
	}
	
	//Class-specific functions
	
	//extend by reference
	this.inherit = function() {
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
	};

	//Defines init
	if(this.init === undefined) {
		this.init = function(){ return true;};
	}
	
	//Defines Test (Batch Unit testing)
	if(this.test === undefined) {
		//Typically a batch of Core.UnitTest(target, [type, reg]);
		this.test = function(){ return true;};
	}
	
	this.init();
	return this;
}

var Package = function(n){
	var p,thisRef = this;
	
	this.require = function(path) {
		var t = document.getElementsByTagName('body')[0], script, sheme, tag;
		
		if(checkextmap(path) === false)
		{
			console.error("File already required "+path);
			return false;
		}
		
		if(document.getElementById("Ar_imports") === null)
		{
			tag = document.createElement('script');
			tag.id = 'Ar_imports';
			t.appendChild(tag);
		}
		
		t = document.getElementById("Ar_imports");
		script = document.createElement('script');
		script.type= 'text/javascript';
		
		sheme = (((document.URL).indexOf("http:") === -1 && (document.URL).indexOf("https:") === -1)?"http:":"");
		
		p=path.split(".");
		
		if(p[0]==="core") {
			
			//This one of my packages. Required from the CDN.
			script.src= sheme+'//arstider-libs.appspot.com/libs/'+p[1]+"/"+p[2]+".js";
		}
		else {
			if(sheme === "http:")
			{
				sheme = (((path).indexOf("http:") === -1 && (path).indexOf("https:") === -1)?"http:":"");
			}
			script.src= sheme + path;
		}
		
		t.appendChild(script);
	};
	
	this.type = "Package";
	this.name = n;
	
	//Once every class is ready, we build the hierachy - > bind some events for the extends and inherits
	/*document.addEventListener("DOMContentLoaded", function() {
		var c,s;
		//For every class in this package. //Lighter than putting it in each classes.
		for(c in thisRef) {
			if (thisRef.hasOwnProperty(c)) {
				if(thisRef[c].type === "Class") {
					thisRef[c].init();
				}
			}
		}
	});*/
	
	return p;
};

Ar.start = function (fct){
	document.addEventListener("DOMContentLoaded", function() {
		fct();
	});
}