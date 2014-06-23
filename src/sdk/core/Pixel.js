/**
 * Pixel
 * 
 * @version 1.1.3
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the pixel module
 */
define("Arstider/core/Pixel", [], /** @lends core/Pixel */ function(){
	
	/**
	 * Pixel constructor
	 * A simple buffer pixel model
	 * @class core/Pixel
	 * @constructor
	 * @param {number} x The x position in the Buffer
	 * @param {number} y The y position in the Buffer
	 * @param {HTMLCanvasElement} canvas The Buffer reference
	 * @param {number} r The red value
	 * @param {number} g The green value
	 * @param {number} b The blue value
	 * @param {number} a The alpha value
	 */
	function Pixel(x,y,canvas,r,g,b,a){
		this.x = x;
		this.y = y;
		this.canvas = canvas;
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	
	return Pixel;
});