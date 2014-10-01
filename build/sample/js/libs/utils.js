
function InitUtilities() {
}

InitUtilities.prototype = {
	Console : function () {
		var consoleID = 'console-block',
			startTime = new Date().getTime(),
			consoleDiv = document.createElement('div');
		consoleDiv.id = consoleID;

		document.body.appendChild(consoleDiv);
		var console = document.getElementById(consoleID);

		this.log = function (msg) {
			var dt = new Date().getTime() - startTime;
			var time = '+' + dt.toString();
			for (var i = 10000; i > 9; i /= 10)
				if (dt < i) time = '&nbsp;' + time;
			var logDiv = document.createElement('div');
			logDiv.className = 'consoleItem';
			logDiv.innerHTML = time + ' > ' + msg;
			logDiv.style.color = this.getColor(dt);
			document.getElementById('console-block').insertBefore(logDiv,
				document.getElementById('console-block').firstChild);
			startTime += dt;
		};

		this.show = function () {
			var consoleDiv = nickNS.utils.getById('console-block');
			consoleDiv.style.display = 'block';
		};

		/**
		 * return string with color in rgb() format
		 * @param {number} value
		 */
		this.getColor = function (value) {
			if (value > 1000) value = 1000;
			if (value < 500) {
				return 'rgb(' +
					(( value / 500 * 255 ) | 0) + ', ' +
					(( (500 - value) / 500 * 255 ) | 0) + ', 0)';
			} else {
				return 'rgb(' +
					(( (value - 500) / 500 * 255 ) | 0) + ', ' +
					(( (1000 - value) / 500 * 255 ) | 0) + ', 0)';
			}
		};
	},

	/** @public */
	html : {
		/** @public
		 * @param {string} id */
		getById : function (id) {
			return document.getElementById(id);
		},

		/** Create and return HTML element (div as default)
		 * @public
		 * @param {object} parameters - all parameter of object
		 * @param {string} [tag] - HTML tag name
		 * @type {HTMLElement|HTMLCanvasElement|Node} */
		createElement : function (parameters, tag) {
			if (typeof tag !== 'string')
				tag = 'div';
			var element = document.createElement(tag);
			return this.editElement(element, parameters);
		},

		/** @public */
		updateElement : function (elementID, parameters) {
			var element = document.getElementById(elementID);
			return this.editElement(element, parameters);
		},

		/** @public */
		removeElement : function (element) {
			if (typeof element !== 'object')
				element = this.getById(element);
			if (element && element.parentNode)
				element.parentNode.removeChild(element);
		},

		/** @public
		 * @param {object} element - HTML element
		 * @param {object} parameters
		 * @returns {HTMLElement|HTMLCanvasElement|Node} HTML element
		 */
		editElement : function (element, parameters) {
			for (var key in parameters) {
				if (parameters.hasOwnProperty(key) &&
					(typeof element[key] !== 'undefined' || key.substr(0, 5) === 'data-')) {
					if (typeof parameters[key] === 'object') {
						for (var subKey in parameters[key])
							if (parameters[key].hasOwnProperty(subKey) && subKey in element[key])
								element[key][subKey] = parameters[key][subKey];
					}
					else {
						if (key.substr(0, 5) === 'data-')
							element.setAttribute(key, parameters[key]);
						else
							element[key] = parameters[key];
					}
				}
			}
			return element;
		},

		/** @public */
		showElement : function (element, parameter) {
			var node = typeof element === 'string' ?
				document.getElementById(element) : element;
			if (typeof parameter !== 'string')
				parameter = 'block';
			if (node)
				node.style.display = parameter;
		},

		/** @public */
		hideElement : function (element) {
			var node = typeof element === 'string' ?
				document.getElementById(element) : element;
			if (node)
				node.style.display = 'none';
		}
	},

	/** creates function who will called with some this argument
	 * @public
	 * @param {function} callBackFunc
	 * @param {T} thisArg
	 * pram {...*} [args]
	 * @return {function(this:T)}
	 * @template T */
	bind : function (callBackFunc, thisArg) {
		var args = Array.prototype.slice.call(arguments, 2);
		return function () {
			var argv = Array.prototype.slice.call(arguments, 0);
			return callBackFunc.apply(thisArg, argv.concat(args));
		};
	},

	secondsToTime : function (totalSeconds, useZero) {
		var hours, minutes, seconds, time = '';
		if (typeof useZero === 'undefined')
			useZero = false;

		seconds = totalSeconds % 60;
		minutes = ((totalSeconds / 60) | 0);
		hours = ((totalSeconds / 3600) | 0);

		if (hours) {
			if (useZero && hours < 10)
				time += 0;
			time += hours + ':';
			useZero = true;
		}
		if (minutes) {
			if (useZero && minutes < 10)
				time += 0;
			time += minutes + ':';
			useZero = true;
		}
		if (useZero && seconds < 10)
			time += 0;
		time += seconds;

		return time;
	},

	clone : function (obj) {
		if (obj === null || typeof obj !== 'object')
			return obj;
		var temp = new obj.constructor();
		for (var key in obj)
			if (obj.hasOwnProperty(key))
				temp[key] = this.clone(obj[key]);
		return temp;
	},

	onError : function (message, url, lineNumber) {
		this.log('massage: ' + message);
		this.log('url: ' + url);
		this.log('lineNumber: ' + lineNumber);
	},

	toSpecialChars : function (text) {
		if (typeof text === 'string')
			text = text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/ /g, "&nbsp;");
		return text;
	}
};


/** creates managed timeout based on setTimeout
 * @class {Timer} */
InitUtilities.prototype.Timer = function () {

	/** @private */
	this.timerInterval = null;
	/** @private */
	this.timerTimeout = null;
	/** @private */
	this.timerEnable = false;

	/** @private
	 * @type {function} */
	this.func = function () {};
	/** @private
	 * @type {object} */
	this.thisArg = {};
	/** @private
	 * @type {number} */
	this.timeout = 0;
	/** @private
	 * @type {number} */
	this.pauseTimeout = 0;
	/** @private
	 * @type {number} */
	this.startTime = 0;
	/** @private
	 * @type {boolean} */
	this.isItTimeout = false;
	/** @private
	 * @type {boolean} */
	this.isTimeoutMode = false;
};

InitUtilities.prototype.Timer.prototype = {
	/** set function to timeout
	 * @public
	 * @param {function} func
	 * @param {object} thisArg
	 * @param {number} timeout
	 * @param {boolean} callOnce */
	start : function (func, thisArg, timeout, callOnce) {
		if (!this.timerInterval) {
			if (typeof func === 'function')
				this.func = func;
			else
				return;

			if (typeof thisArg === 'object' && thisArg !== null)
				this.thisArg = thisArg;
			else
				this.thisArg = {};

			if (typeof timeout === 'number')
				this.timeout = timeout;
			else
				this.timeout = 0;

			this.isItTimeout = typeof callOnce === 'boolean' ? callOnce : false;

			this.createTimer();
			this.timerEnable = true;
			this.isTimeoutMode = false;
		}
	},

	/** @public */
	pause : function () {
		if (this.timerEnable && this.timerInterval) {
			if (this.isTimeoutMode)
				clearTimeout(this.timerTimeout);
			else
				clearInterval(this.timerInterval);
			this.isTimeoutMode = true;
			this.timerInterval = null;
			this.pauseTimeout -= Date.now() - this.startTime;
			if (this.pauseTimeout < 0)
				this.pauseTimeout = 0;
		}
	},

	/** @public */
	resume : function () {
		if (this.timerEnable && !this.timerInterval) {

			var func = function (func, thisArg) {
				return function () {
					return func.apply(thisArg, arguments);
				};
			}.call(this, this.resumeInterval, this);

			this.startTime = Date.now();
			this.timerInterval = setTimeout(func, this.pauseTimeout);
		}
	},

	/** @public */
	stop : function () {
		if (this.timerEnable) {
			if (this.timerInterval)
				clearInterval(this.timerInterval);
			this.timerInterval = null;
			this.timerEnable = false;
		}
	},

	/** @public */
	isTimerEnabled : function () {
		return this.timerEnable;
	},

	/** @private */
	resumeInterval : function () {
		this.isTimeoutMode = false;
		this.createTimer();
	},

	/** @private */
	createTimer : function () {
		var func = function (func, thisArg) {
			return function () {
				return func.apply(thisArg, arguments);
			};
		}.call(this, this.nativeFunction, this);

		this.startTime = Date.now();
		this.timerInterval = setInterval(func, this.timeout);
	},

	/** @private */
	nativeFunction : function () {
		this.func.apply(this.thisArg);
		this.startTime = Date.now();
		if (this.isItTimeout)
			this.stop();
	}
};