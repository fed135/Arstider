//Define Window props
window.classmap = [];
if(console==undefined)
{
	console = {error:function(m){document.write(m);}};
}

function checkclassmap(c)
{
	var l = window.classmap.length;
	for(var i =0; i<l; i++)
	{
		if(window.classmap[i]==c)
		{
			return false;
		}
	}
	window.classmap.push(c);
	return true;
}

function Class(path, body)
{
	for(obj in body)
	{
		this[obj] = body[obj];
	}
	
	var data = path.split(".");
	
	if(data.length <=1)
	{
		console.error("Invalid path parameter at "+path+" expecting \"Package.Class\" format.");
	}
	if(window[data[data.length-2]] == undefined)
	{
		console.error("Package does not exist : "+data[data.length-2]);
	}
	
	//Sets Class-specific values
	this.__proto__.type = "Class";
	this.name = data[data.length-1];
	this.parent = data[data.length-2];
	
	if(body.requireOnce === true)
	{
		this.requireOnce = true;
		if(checkclassmap(this.name) == false)
		{
			console.error("Class "+this.name+" has already been defined and specified as requiredOnce.");
			return false;
		}
	}
	else
	{
		this.requireOnce = false;
		window.classmap.push(this.name);
	}
	
	//Class-specific functions
	
	//extend by duplication
	if(this.__proto__.extend == undefined)
	{
		this.__proto__.extend = function()
		{
			var i;
			var obj;
			
			for(i = 0; i<arguments.length; i++)
			{
				for(obj in arguments[i])
				{
					this.__proto__[obj] = arguments[i][obj];
				}
			}
		}
		
		//inherit by reference
		this.__proto__.inherit = function()
		{
			var i;
			var obj;
			
			for(i = 0; i<arguments.length; i++)
			{
				for (obj in arguments[i]) 
				{
					if(arguments[i][obj] instanceof Function)
					{
						if(this[obj] == undefined)
						{
							var getter = arguments[i].__lookupGetter__(arguments[i][obj]), setter = arguments[i].__lookupSetter__(arguments[i][obj]);
						   
							if ( getter || setter ) 
							{
								if ( getter )
								{
									this.__defineGetter__(arguments[i][obj], getter);
								}
								if ( setter )
								{
									this.__defineSetter__(arguments[i][obj], setter);
								}
							} 
							else
							{
								this[obj] = arguments[i][obj];
							}
						}
					}
				}
			}
		}
	}

	//Defines init
	if(this.init == undefined)
	{
		this.init = function(){ return true};
	}
	
	//Defines Test (Batch Unit testing)
	if(this.test == undefined)
	{
		//Typically a batch of Core.UnitTest(target, [type, reg]);
		this.test = function(){ return true};
	}
	
	
	
	//return the final object
	window[this.parent][this.name]=this;
	//return newClass;
};

var Package = function(n){
	this.require = function(path)
	{
		p=path.split(".");
		if(p[0]=="core")
		{
			//This one of my packages. Make a script tag to require it from the CDN.
			
		}
		else
		{
			//A custom class, just make a script tag.
		}
	}
	
	this.__proto__.type = "Package";
	this.__proto__.name = n;
	
	var thisRef = this;
	//Once every class is ready, we build the hierachy
	document.addEventListener("DOMContentLoaded", function(){
		//For every class in this package. //Lighter than putting it in each classes.
		for(var c in thisRef)
		{
			if(thisRef[c].type == "Class")
			{
				thisRef[c].init();
			}
		}
	});
	
	window[n] = this;
	//return p;
}
/*
new Package("Sieg");

new Class("Sieg.Main",{
		requireOnce:true,
		init:function()
		{
			this.inherit(Sieg.Utils, Sieg.Meta);
		}
});

new Class("Sieg.Utils",{
		test:function()
		{
			console.log("Test")
		}
});

new Class("Sieg.Meta",{
		test2:function()
		{
			console.log("Test2")
		}
});

console.warn(Sieg);
*/