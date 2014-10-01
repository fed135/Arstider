define("entities/CustomEntity",[
	"Arstider/DisplayObject",
	"Arstider/TextField",
	"Arstider/Fonts",
	"Arstider/Viewport"
], 
function(DisplayObject, TextField, Fonts, Viewport){
    
	function CustomEntity(props){
		Arstider.Super(this, DisplayObject, props);

                if(!props) props = Arstider.emptyObject;

		this.width = Arstider.checkIn(props.width, 171);
		this.height = Arstider.checkIn(props.height, 71);
                this.enabled = Arstider.checkIn(props.enabled, true);
		this.callback = Arstider.checkIn(props.callback, Arstider.emptyFunction);

		this.bg = new DisplayObject({
			data: "btnLarge.png",
			width: this.width,
			height: this.width
		});
		this.addChild(this.bg);

		this.label = new TextField({
			name: "label_" + this.name
		});
		this.label.setText(Arstider.checkIn(props.label, this.name));
		this.label.setFont(Fonts.get(props.font));
		this.addChild(this.label);
		this.label.dock(0.5, 0.5);

		this.onhover = function(){ 
                    if(!this.enabled) return;
                    Viewport.tag.style.cursor = "pointer";
                };
		
		this.onleave = function(){ 
                    if(!this.enabled) return;
                    Viewport.tag.style.cursor = "default";
                };

		this.onrelease = function(){
                    if(!this.enabled) return;
                    Viewport.tag.style.cursor = "default";

                    if(this.callback) this.callback.apply(this, []);
		};
	}
	
	Arstider.Inherit(CustomEntity, DisplayObject);
        
        CustomEntity.prototype.disable = function(){
            this.enabled = false;
        };
        
        CustomEntity.prototype.enable = function(){
            this.enabled = true;
        };
        
        CustomEntity.prototype.update = function(){
            if(this.enabled) this.alpha = 1;
            else this.alpha = 0.5;
        };
	
	return CustomEntity;
});