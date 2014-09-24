
var math = {
	/** @class Vector3
	 * @extends {Class} */
	Vector3 : function (x, y, z) {
		this._x = 0;
		this._y = 0;
		this._z = 0;

		this.set.apply(this, arguments);
	}
};

math.Vector3.prototype = {

	/** @public */
	set : function (x, y, z) {
		this._x = typeof x === 'number' ? x : 0;
		this._y = typeof y === 'number' ? y : 0;
		this._z = typeof z === 'number' ? z : 0;
	},

	/** @public */
	get x() { return this._x; },
	/** @public */
	get y() { return this._y; },
	/** @public */
	get z() { return this._z; },

	/** @public */
	set x(value) { if (typeof value === 'number') this._x = value; },
	/** @public */
	set y(value) { if (typeof value === 'number') this._y = value; },
	/** @public */
	set z(value) { if (typeof value === 'number') this._z = value; }
};

module.exports = math;