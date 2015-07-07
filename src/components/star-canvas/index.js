require("./index.less");
var MyMath = require("utils/math");

function StarCanvas ( options ) {

	this.mediator = require("utils/mediator").getInstance();
	var canvas = this.canvas = document.createElement("canvas");
	canvas.className='star-canvas';
	if ( options && options.imageSrc ) {
		this.setImage(options.imageSrc);
	}
}

function redAlterration ( pixelData, i, factor ) {
	pixelData[i] = MyMath.Lerp(pixelData[i],255,factor);
	pixelData[i+1] = MyMath.Lerp(0, pixelData[i+1],factor);
	pixelData[i+2] = MyMath.Lerp(0, pixelData[i+2],factor);
}

function blueAlterration ( pixelData, i, factor ) {
	pixelData[i] = MyMath.Lerp(0, pixelData[i],factor);
	pixelData[i+1] = MyMath.Lerp(0, pixelData[i+1],factor);
	pixelData[i+2] = MyMath.Lerp(pixelData[i+2], 255,factor);
}


StarCanvas.prototype.getDOMNode = function () {
	return this.canvas;
}

StarCanvas.prototype.setImage = function ( imageSrc ) {
	
	var imgNode = this.imageNode = document.createElement("img");

	imgNode.onload = function () {
		this.canvas.width = imgNode.width;
		this.canvas.height = imgNode.height;
		this.context = this.canvas.getContext("2d");
		this.context.drawImage(imgNode, 0, 0);
	}.bind(this);

	imgNode.src = imageSrc;
}

StarCanvas.prototype.alertImagePixel = function ( value ) {

	this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
	this.context.drawImage(this.imageNode, 0, 0);

	var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height),
		pixelData = imageData.data,
		chagneFactor = 1-value/100,
		alterationFn = redAlterration;

	if ( value < 0 ) {
		chagneFactor = 1+value/100;
		alterationFn = blueAlterration;
	}

	console.log(value , "->", chagneFactor);

	for (var i = 0, n = pixelData.length; i < n ; i += 4 ) {
		if ( pixelData[i+3] === 0 ) {
			continue;
		}
		alterationFn(pixelData, i, chagneFactor);

	}

	this.context.putImageData(imageData,0,0);
}

module.exports = StarCanvas;