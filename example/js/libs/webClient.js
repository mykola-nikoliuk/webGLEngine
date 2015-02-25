/** @class WebClient */
function WebClient() {

	/**@private */
	this._data = {
		id       : '',
		position : [0, 0, 0],
		angles   : [0, 0, 0],
		users    : {}
	};
	/**@private */
	this._isConnected = false;
	/**@private */
	this._isRequestIsBusy = false;

	/** @private */
	this._timeout = null;
	/** @private */
	this._request = null;

	/** @private */
	this._timeoutTime = 5000;

	/** @private */
	this._eventCallback = function () {};
	/** @private */
	this._eventThisArg = {};
}

WebClient.prototype = {

	events : {
		PLAYES_HAS_JOINED : 1,
		PLAYER_LEAVE      : 2,
	},

	/** @public */
	connect : function () {
		this.send();
		this._isConnected = true;
	},

	/** @private */
	disconnect : function () {
		if (this._isConnected) {
			this._request.abort();
			this._isConnected = false;
		}
	},

	/** @public */
	send : function () {
		if (this._isRequestIsBusy) return false;
		this._isRequestIsBusy = true;

		this._request = this.getXmlHttp();
		this._request.open('post', '', true);
		this._request.onreadystatechange = this.bind(this.response, this);
		this._request.send(JSON.stringify(this._data));
		this.turnOnTimeout();

		return true;
	},

	/** @private */
	resend : function () {
		this.disconnect();
		this.connect();
	},

	/** @private */
	turnOnTimeout : function () {
		if (this._timeout === null) {
			this._timeout = setInterval(this.bind(this.resend, this), this._timeoutTime);
		}
	},

	/** @private */
	turnOffTimeout : function () {
		clearTimeout(this._timeout);
		this._timeout = null;
	},

	/** @private */
	response : function () {
		if (this._request.readyState === 4) {
			// If we got HTTP status 200 (OK)
			if (this._request.status === 200) {
				var response = JSON.parse(this._request.responseText);

				//noinspection FallThroughInSwitchStatementJS
				switch (response.type) {
					case 'logged':
						this._data.id = response.id;
				}

				// copy players data
				if (typeof response.users === 'object') {
					for (var user in response.users) {
						if (response.users.hasOwnProperty(user)) {
							if (this._data.users.hasOwnProperty(user)) {
								this._data.users[user].position = response.users[user].position;
								this._data.users[user].angles = response.users[user].angles;
							}
							else {
								// new user
								this.sendEvent(this.events.PLAYES_HAS_JOINED, user);
								console.log(user + ' has joined');
								this._data.users[user] = {
									position : response.users[user].position,
									angles   : response.users[user].angles
								};
							}
						}
					}
					for (user in this._data.users) {
						if (this._data.users.hasOwnProperty(user)) {
							if (!response.users.hasOwnProperty(user)) {
								console.log(user + ' has leave the game');
								this.sendEvent(this.events.PLAYER_LEAVE, user);
								ns.removePlayer(user);
								delete this._data.users[user];
							}
						}
					}
				}

				this.turnOffTimeout();
				this._isRequestIsBusy = false;
				setTimeout(this.bind(this.send, this), 5);
//				this.send();

			}
			else {
				console.log('Can\'t get response');
			}
		}
	},

	/** @public */
	setEventListener : function (callback, thisArg) {
		this._eventCallback = typeof callback === 'function' ? callback : function () {};
		this._eventThisArg = typeof thisArg === 'object' ? thisArg : {};
	},

	/** @private */
	sendEvent : function () {
		this._eventCallback.apply(this._eventThisArg, arguments);
	},

	/** @public */
	isConnected : function () {
		return this._isConnected;
	},

	/** @public */
	getData : function () {
		return this._data;
	},

	/** @private */
	getXmlHttp : function () {
		var xmlhttp;
		try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
				xmlhttp = false;
			}
		}
		if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
			xmlhttp = new XMLHttpRequest();
		}
		return xmlhttp;
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
	}

};
