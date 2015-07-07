var MyMath = require("utils/math");

require("./index.less");

function VeloNumberInput () {
	this.mediator = require("utils/mediator").getInstance();
	var el = this.el = document.createElement("input");
	el.type = 'text';
	// todo, could be param
	el.value = 0;
	el.name = 'velocity-value';
	el.className ='velo-value';

	el.addEventListener("input", this.sanitize.bind(this));
}

VeloNumberInput.prototype.getDOMNode = function () {
	return this.el;
}

VeloNumberInput.prototype.setValue = function ( value ) {
	this.el.value = MyMath.Clamp(value, -100, 100);
}

VeloNumberInput.prototype.sanitize = function () {
	var el = this.el,
		value = el.value,
		number = parseInt(value, 10);

	if ( value === '-') {
		return;
	}

	if ( !number ) {
		number = 0;
	}
	// todo, could be params
	var clampedNumber = MyMath.Clamp(number, -100, 100);

	if ( number != value || number !== clampedNumber ) {
		el.value = clampedNumber;
	}

	this.mediator.emit("velocity:number:changed", clampedNumber);

}

module.exports = VeloNumberInput;