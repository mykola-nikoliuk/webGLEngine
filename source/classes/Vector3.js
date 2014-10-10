/** @class Vector3
 * @param x
 * @param y
 * @param z */
var Vector3 = function (x, y, z) {
	this._x = 0;
	this._y = 0;
	this._z = 0;

	this.set.apply(this, arguments);
};


Vector3.prototype = /** @lends Vector3# */ {

	/** @public */
	set : function (x, y, z) {
		this._x = typeof x === 'number' ? x : 0;
		this._y = typeof y === 'number' ? y : 0;
		this._z = typeof z === 'number' ? z : 0;
	},

	/** @public */
	add : function (x, y, z) {
		this._x += typeof x === 'number' ? x : 0;
		this._y += typeof y === 'number' ? y : 0;
		this._z += typeof z === 'number' ? z : 0;
	},

	get x() { return this._x; },
	get y() { return this._y; },
	get z() { return this._z; },

	set x(value) { if (typeof value === 'number') this._x = value; },
	set y(value) { if (typeof value === 'number') this._y = value; },
	set z(value) { if (typeof value === 'number') this._z = value; },

	get r() { return this._x; },
	get g() { return this._y; },
	get b() { return this._z; },

	set r(value) { if (typeof value === 'number') this._x = value; },
	set g(value) { if (typeof value === 'number') this._y = value; },
	set b(value) { if (typeof value === 'number') this._z = value; }
};

module.exports = Vector3;