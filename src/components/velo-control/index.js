var VeloNumberInput = require("components/velo-number-input");
var VeloSliderInput = require("components/velo-slider-input");

function ValueSlider ( Mediator ) {
	this.mediator = Mediator;
	this.el = document.createElement("div");
	this.veloNumber = new VeloNumberInput();
	this.veloRange = new VeloSliderInput();
	this.el.appendChild(this.veloNumber.getDOMNode());
	this.el.appendChild(this.veloRange.getDOMNode());
}

ValueSlider.prototype.getDOMNode = function () {
	return this.el;
}

module.exports = ValueSlider;