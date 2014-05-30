/**
 * Ads
 * 
 * @version 1.1.4
 * @author frederic charette <fredericcharette@gmail.com>
 */

/*
 * Self-invoked singleton wrapper
 */
;(function(){

	var 
		/**
		 * Static list of already instantiated ads
		 * @private
		 * @type {Array}
		 */
		list = []
	;
	
	/*
	 * Defines the Ad module
	 */
	define( "Arstider/commons/Ad", ["Arstider/Tag"], /** @lends Ad */ function (Tag) {
			
		/**
		 * Ad constructors holder
		 * @class Ad
		 */
                var Ad = {};
                
                Ad.Banner = function Banner(props){
                    props = props || {};
                    props.tag = "iframe";
                    
                    Arstider.Super(this, Tag, props);
                    
                    list.push(this);
                    
                    this.attr("seamless", "seamless");
                    this.attr("scrolling", "no");
                    this.style("border", "0px");
                    this.style("backgroundColor", "white");
                    if(props.url) this.loadUrl( props.url);
                };
                Arstider.Inherit(Ad.Banner, Tag);
                
                Ad.Interstitial = function Interstitial(props){
                    props = props || {};
                    props.tag = "iframe";
                    
                    Arstider.Super(this, Tag, props);
                    
                    list.push(this);
                    this.fill(1,1);
                    this.dock(0.5,0.5);
                    
                    this.attr("seamless", "seamless");
                    this.attr("scrolling", "no");
                    this.style("border", "0px");
                    this.style("backgroundColor", "black");
                    if(props.url) this.loadUrl( props.url);
                };
                Arstider.Inherit(Ad.Interstitial, Tag);
                
                
                Ad.Banner.prototype.loadUrl = Ad.Interstitial.prototype.loadUrl = function(url){
                    this._tag.src = url;
                };
                
                Ad.Banner.prototype.close = Ad.Interstitial.prototype.close = function(){
                    var i = list.indexOf(this);
                    if(i > -1) list.splice(i,1);
                    this.killBuffer();
                };
                
                Ad.closeAll = function(){
                    for(var i = list.length-1; i>=0; i--){
                        list[i].close();
                    }
                };
                
                
                
		return Ad;
                
        });
})();