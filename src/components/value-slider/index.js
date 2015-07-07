var NumberInput = require("/src/components/number-input");

function ValueSlider ( Mediator ) {
	this.mediator = Mediator;
	this.el = document.createElement("div");
	this.numberInput = new NumberInput();
	this.el.appendChild(this.numberInput.getDOMNode());
}

ValueSlider.prototype.getDOMNode = function () {
	return this.el;
}

module.exports = ValueSlider;