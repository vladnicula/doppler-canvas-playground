var MyMath = require("utils/math");

require("./index.less");

function VeloNumberInput () {
	var el = this.el = document.createElement("input");
	el.type = 'text';
	el.value = 0;
	el.name = 'velocity-value';
	el.className ='velo-value';

	el.addEventListener("input", this.sanitize.bind(this));
}

VeloNumberInput.prototype.getDOMNode = function () {
	return this.el;
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

	var clampedNumber = MyMath.Clamp(number, -100, 100);

	if ( number != value || number !== clampedNumber ) {
		el.value = clampedNumber;
	}

}

module.exports = VeloNumberInput;