require("./index.less");

var 
	EventEmitter = require("events").EventEmitter,
	StarCanvas = require("./components/star-canvas"),
	ValueSlider = require("./components/value-slider"),
	Mediator = new EventEmitter();

var starCanvas = new StarCanvas(Mediator);
var valueSldier = new ValueSlider(Mediator);

var mainNode = document.getElementById("app-container");

starCanvas.setImage("./src/star-with-transparent-bg.png");


mainNode.appendChild( starCanvas.getDOMNode() );
mainNode.appendChild( valueSldier.getDOMNode() );
