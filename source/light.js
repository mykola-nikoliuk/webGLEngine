var Class = require('./libs/class'),
	Vector = require('./classes/Vector3');

/** @class Light
 * @param {number} type
 * @param {Array<number>} color
 * @param {Array<number>} param direction or position
 * @param {number} distance */
var Light = function (type, color, param, distance) {

	this._type = 0;

	this._enabled = true;

	this._distance = typeof distance === 'number' ? distance : 10;

	/** @private
	 * @type {Vector3} */
	this._color = new Vector();

	/** @private
	 * @type {Vector3} */
	this._position = new Vector();

	if (typeof color === 'object') {
		this._color.r = typeof color[0] === 'number' ? color[0] : 0;
		this._color.g = typeof color[1] === 'number' ? color[1] : 0;
		this._color.b = typeof color[2] === 'number' ? color[2] : 0;
	}

	if (typeof param === 'object') {
		this._position.r = typeof param[0] === 'number' ? param[0] : 0;
		this._position.g = typeof param[1] === 'number' ? param[1] : 0;
		this._position.b = typeof param[2] === 'number' ? param[2] : 0;
	}
};


Light.prototype = {

	/** @public */
	turnOn : function () {
		this._enabled = true;
	},

	/** @public */
	turnOff : function () {
		this._enabled = false;
	},

	/** @public */
	isEnabled : function () {
		return this._enabled;
	},

	get color () { return this._color; },
	get position () { return this._position; },
	get distance () { return this._distance; },

	set color (color) {},
	set position (position) {},
	set distance (distance) {}
};

module.exports = Light;