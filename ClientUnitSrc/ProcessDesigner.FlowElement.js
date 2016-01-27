define('FlowElement', ['ext-base', 'terrasoft', 'FlowElementResources'],
	function(Ext, Terrasoft, resources) {
		return function(shape) {
			this.uid = shape.id;
			//this.caption = shape.caption;
			//this.name = shape.name;
			//this.type = shape.type;
			this.position = {x: shape.x, y: shape.y};
			this.size = {width: shape.width, height: shape.height};
		};
	});
