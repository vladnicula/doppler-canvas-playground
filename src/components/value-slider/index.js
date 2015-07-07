function ValueSlider ( Mediator ) {
	this.mediator = Mediator;
	this.el = document.createElement("div");
}

ValueSlider.prototype.getDOMNode = function () {
	return this.el;
}

module.exports = ValueSlider;