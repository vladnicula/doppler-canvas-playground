var MyMath = require("utils/math");
require("./index.less");

function VeloSliderInput () {
	var el = this.el = document.createElement("input");
	el.type = 'range';
	el.min = 0;
	el.max = 100;
	el.name = 'velocity-range';
	el.className ='velo-range';
}

VeloSliderInput.prototype.getDOMNode = function () {
	return this.el;
}

module.exports = VeloSliderInput;