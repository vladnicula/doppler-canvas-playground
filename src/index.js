require("./index.less");

var
	StarCanvas = require("./components/star-canvas"),
	ValueSlider = require("./components/velo-control"),
	mediator = require("./utils/mediator").getInstance();

var starCanvas = new StarCanvas();
var valueSldier = new ValueSlider();

var mainNode = document.getElementById("app-container");

starCanvas.setImage("./src/star-with-transparent-bg.png");

mediator.on("velocity:changed", function ( value ) {
	console.log("should change velocity", value );
	// starCanvas.alertImagePixel(value);
});

mainNode.appendChild( starCanvas.getDOMNode() );
mainNode.appendChild( valueSldier.getDOMNode() );
