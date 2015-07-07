var MyMath = require("utils/math");
require("./index.less");

function VeloSliderInput () {
	this.mediator = require("utils/mediator").getInstance();

	var el = this.el = document.createElement("input");
	el.type = 'range';
	el.min = 0;
	el.max = 100;
	// todo make this a param
	el.value = 30;
	el.name = 'velocity-range';
	el.className ='velo-range';

	el.addEventListener("input", this.onInputValue.bind(this));

	this.mediator.on("velocity:number:changed", this.setValue.bind(this));
}

VeloSliderInput.prototype.getDOMNode = function () {
	return this.el;
}

VeloSliderInput.prototype.setValue = function ( value ) {
	var sliderValue;
	if ( value <= 0 ) {
		sliderValue =  Math.round(( value + 100 ) * 3 / 10);
	} else {
		sliderValue = Math.round(30 + ( value ) * 7 / 10);
	}

	this.el.value = sliderValue;

	// console.log(value, "->", sliderValue);
}

VeloSliderInput.prototype.onInputValue = function () {

	var computedValue,
		value = this.el.value;

	if ( value < 30 ) {
		computedValue = -100 + Math.round( value / 30 * 100 ) ;
	} else {
		computedValue = Math.round( (value - 30 ) / 70 * 100 );
	}

	// console.log(value, "->", computedValue);

	this.mediator.emit("velocity:slider:changed", computedValue);
}

module.exports = VeloSliderInput;