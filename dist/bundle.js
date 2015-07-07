(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
require("./index.less");
var MyMath = require("utils/math");

function StarCanvas ( options ) {

	this.mediator = require("utils/mediator").getInstance();
	var canvas = this.canvas = document.createElement("canvas");
	canvas.className='star-canvas';
	if ( options && options.imageSrc ) {
		this.setImage(options.imageSrc);
	}
}

function redAlterration ( pixelData, i, factor ) {
	pixelData[i] = MyMath.Lerp(pixelData[i],255,factor);
	pixelData[i+1] = MyMath.Lerp(0, pixelData[i+1],factor);
	pixelData[i+2] = MyMath.Lerp(0, pixelData[i+2],factor);
}

function blueAlterration ( pixelData, i, factor ) {
	pixelData[i] = MyMath.Lerp(0, pixelData[i],factor);
	pixelData[i+1] = MyMath.Lerp(0, pixelData[i+1],factor);
	pixelData[i+2] = MyMath.Lerp(pixelData[i+2], 255,factor);
}


StarCanvas.prototype.getDOMNode = function () {
	return this.canvas;
}

StarCanvas.prototype.setImage = function ( imageSrc ) {
	
	var imgNode = this.imageNode = document.createElement("img");

	imgNode.onload = function () {
		this.canvas.width = imgNode.width;
		this.canvas.height = imgNode.height;
		this.context = this.canvas.getContext("2d");
		this.context.drawImage(imgNode, 0, 0);
	}.bind(this);

	imgNode.src = imageSrc;
}

StarCanvas.prototype.alertImagePixel = function ( value ) {

	this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
	this.context.drawImage(this.imageNode, 0, 0);

	var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height),
		pixelData = imageData.data,
		chagneFactor = 1-value/100,
		alterationFn = redAlterration;

	if ( value < 0 ) {
		chagneFactor = 1+value/100;
		alterationFn = blueAlterration;
	}

	console.log(value , "->", chagneFactor);

	for (var i = 0, n = pixelData.length; i < n ; i += 4 ) {
		if ( pixelData[i+3] === 0 ) {
			continue;
		}
		alterationFn(pixelData, i, chagneFactor);

	}

	this.context.putImageData(imageData,0,0);
}

module.exports = StarCanvas;
},{"./index.less":3,"utils/math":11,"utils/mediator":12}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
var VeloNumberInput = require("components/velo-number-input");
var VeloSliderInput = require("components/velo-slider-input");

function ValueSlider () {
	this.mediator = require("utils/mediator").getInstance();
	this.el = document.createElement("div");
	this.veloNumber = new VeloNumberInput();
	this.veloRange = new VeloSliderInput();
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
},{"components/velo-number-input":5,"components/velo-slider-input":7,"utils/mediator":12}],5:[function(require,module,exports){
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
},{"./index.less":6,"utils/math":11,"utils/mediator":12}],6:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],7:[function(require,module,exports){
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
},{"./index.less":8,"utils/math":11,"utils/mediator":12}],8:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],9:[function(require,module,exports){
require("./index.less");

var
	StarCanvas = require("./components/star-canvas"),
	ValueSlider = require("./components/velo-control"),
	mediator = require("./utils/mediator").getInstance();

var starCanvas = new StarCanvas();
var valueSldier = new ValueSlider();
var updateInCooldown = false;

var mainNode = document.getElementById("app-container");

starCanvas.setImage("./src/star-with-transparent-bg.png");

mediator.on("velocity:changed", function ( value ) {
	if ( updateInCooldown ) {
		return;
	}

	starCanvas.alertImagePixel(value);
	updateInCooldown = true;

	setTimeout( function(){
		updateInCooldown = false;
	}, 100);	
});

mainNode.appendChild( starCanvas.getDOMNode() );
mainNode.appendChild( valueSldier.getDOMNode() );

},{"./components/star-canvas":2,"./components/velo-control":4,"./index.less":10,"./utils/mediator":12}],10:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],11:[function(require,module,exports){
module.exports = {
	
	Clamp : function ( value, min, max ) {

		if ( min > value ) {
			return min;
		}

		if ( max < value ) {
			return max;
		}

		return value;

	},

	Lerp : function ( a, b, w ) {
		return ( 1-w ) * a + w * b;
	} 
}
},{}],12:[function(require,module,exports){
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
},{"events":1}]},{},[9]);
