require("./index.less");

function StarCanvas ( options ) {

	this.mediator = require("utils/mediator").getInstance();
	var canvas = this.canvas = document.createElement("canvas");
	canvas.className='star-canvas';
	if ( options && options.imageSrc ) {
		this.setImage(options.imageSrc);
	}
}


StarCanvas.prototype.getDOMNode = function () {
	return this.canvas;
}

StarCanvas.prototype.setImage = function ( imageSrc ) {
	
	var imgNode = document.createElement("img");

	imgNode.onload = function () {
		this.canvas.width = imgNode.width;
		this.canvas.height = imgNode.height;
		this.context = this.canvas.getContext("2d");
		this.context.drawImage(imgNode, 0, 0);
	}.bind(this);

	imgNode.src = imageSrc;
}

module.exports = StarCanvas;