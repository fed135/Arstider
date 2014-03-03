;(function(){
	
	var 
		singleton = null,
		collection = {}
	;
/**
 * AMD Closure
 */	
	define( "Arstider/Font", [], function () {
		if(singleton != null) return singleton;
		/**
		 * Creates an instance of Font.
		 *
		 * @constructor
		 * @this {Font}
		 * @param {String} name Name of the font to create
		 */
		 	
			var Font = function(){};
			
			Font.get = function(){
				if(collection[name]) return collection[name];
				
				return null;
			};
			
			Font.create = function(name){
				if(collection[name]) return collection[name];
				
				collection[name] = {
					paddingTop : 0,
					paddingLeft : 0,
					padding : 0,
					verticalSpacing : 0,
					textWrap : false,
					family : "Arial",
					size : "12px",
					style : ""
				};
				
				return collection[name];
			};
			
			singleton = new Font();
			return singleton;
	});
})();
