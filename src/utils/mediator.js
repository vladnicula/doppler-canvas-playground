var instance = null,
	EventEmitter = require("events").EventEmitter;
	
module.exports = {
	getInstance : function () {
		if ( !instance ) {
			instance = new EventEmitter();
		}
		return instance;
	}
};