var VeloNumberInput = require("components/velo-number-input");
var VeloSliderInput = require("components/velo-slider-input");

require("./index.less");

function ValueSlider () {
	this.mediator = require("utils/mediator").getInstance();
	this.el = document.createElement("div");
	this.veloNumber = new VeloNumberInput();
	this.veloRange = new VeloSliderInput();
	this.el.className = "velo-control-component";
	this.el.appendChild(this.veloNumber.getDOMNode());
	this.el.appendChild(this.veloRange.getDOMNode());

	this.mediator.on("velocity:slider:changed", this.setInputValue.bind(this));
	this.mediator.on("velocity:number:changed", this.setRangeValue.bind(this));
}

ValueSlider.prototype.getDOMNode = function () {
	return this.el;
}

ValueSlider.prototype.setInputValue = function ( value, silent ) {
	this.veloNumber.setValue(value);
	!silent && this.mediator.emit("velocity:changed", value);
}

ValueSlider.prototype.setRangeValue = function ( value, silent ) {
	this.veloRange.setValue(value);
	!silent && this.mediator.emit("velocity:changed", value);
}

ValueSlider.prototype.setValue = function ( value ) {
	this.setRangeValue(value, true);
	this.setInputValue(value, true);
}

module.exports = ValueSlider;