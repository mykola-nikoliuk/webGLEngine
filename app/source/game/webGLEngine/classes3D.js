var classes3d = {

	Vector3 : function (x, y, z) {
		this._x = 0;
		this._y = 0;
		this._z = 0;

		this.set.apply(this, arguments);
	},

	Material : function () {
		this.diffuseColor = [0, 0, 0];
		this.imageLink = '';
		this.ready = true;
		this.texture = null;
	},

	Transformations : function () {
		this.position = new classes3d.Vector3();
		this.rotation = new classes3d.Vector3(0, 0, 0);
		this.scale = new classes3d.Vector3(0, 0, 0);
	}
};

classes3d.Vector3.prototype = {

	/** @public */
	set : function (x, y, z) {
		this._x = typeof x === 'number' ? x : 0;
		this._y = typeof y === 'number' ? y : 0;
		this._z = typeof z === 'number' ? z : 0;
	},

	get x () { return this._x; },
	get y () { return this._y; },
	get z () { return this._z; },

	set x (value) { if (typeof value === 'number') this._x = value; },
	set y (value) { if (typeof value === 'number') this._y = value; },
	set z (value) { if (typeof value === 'number') this._z = value; }
};

module.exports = classes3d;
