require("./index.less");

var
	StarCanvas = require("./components/star-canvas"),
	ValueSlider = require("./components/velo-control"),
	mediator = require("./utils/mediator").getInstance();

var starCanvas = new StarCanvas();
var valueSldier = new ValueSlider();
var updateInCooldown = false;

var mainNode = document.getElementById("app-container");

starCanvas.setImage("./src/star-with-transparent-bg.png");

mediator.on("velocity:changed", function ( value ) {
	if ( updateInCooldown ) {
		return;
	}

	starCanvas.alertImagePixel(value);
	updateInCooldown = true;

	setTimeout( function(){
		updateInCooldown = false;
	}, 100);	
});

mainNode.appendChild( starCanvas.getDOMNode() );
mainNode.appendChild( valueSldier.getDOMNode() );
