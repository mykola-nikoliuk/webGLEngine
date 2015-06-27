module webGLEngine {

	export module Types {

		export class Vector3 {

			private _x = 0;
			private _y = 0;
			private _z = 0;

			constructor(x?, y?, z?) {
				this.set(x, y, z);
			}

			public set(x, y, z) : Vector3 {
				this._x = typeof x === 'number' ? x : 0;
				this._y = typeof y === 'number' ? y : 0;
				this._z = typeof z === 'number' ? z : 0;
				return this;
			}

			public add(x, y, z) : void {
				this._x += typeof x === 'number' ? x : 0;
				this._y += typeof y === 'number' ? y : 0;
				this._z += typeof z === 'number' ? z : 0;
			}

			public minus(vector : Vector3) : Vector3 {
				this._x -= vector._x;
				this._y -= vector._y;
				this._z -= vector._z;
				return this;
			}

			public plus(vector : Vector3) : Vector3 {
				this._x += vector._x;
				this._y += vector._y;
				this._z += vector._z;
				return this;
			}

			public multiply(multiplier : number) : Vector3 {
				this._x *= multiplier;
				this._y *= multiplier;
				this._z *= multiplier;
				return this;
			}

			public divide(divider : number) : Vector3 {
				this._x /= divider;
				this._y /= divider;
				this._z /= divider;
				return this;
			}

			public clone() : Vector3 {
				return new Vector3(this._x, this._y, this._z);
			}

			public invertSign() : Vector3 {
				this._x *= -1;
				this._y *= -1;
				this._z *= -1;
				return this;
			}

			public copyFrom(vector : Vector3) : void {
				this._x = vector._x;
				this._y = vector._y;
				this._z = vector._z;
			}

			public getArray() : any[] {
				return [this._x, this._y, this._z];
			}

			public getDistanceTo(point : Vector3) {
				return Math.sqrt(Math.abs(
					Math.pow(this._x - point._x, 2) +
					Math.pow(this._y - point._y, 2) +
					Math.pow(this._z - point._z, 2)
				));
			}

			get x() {
				return this._x;
			}

			get y() {
				return this._y;
			}

			get z() {
				return this._z;
			}

			set x(value) {
				if (typeof value === 'number') this._x = value;
			}

			set y(value) {
				if (typeof value === 'number') this._y = value;
			}

			set z(value) {
				if (typeof value === 'number') this._z = value;
			}

			get r() {
				return this._x;
			}

			get g() {
				return this._y;
			}

			get b() {
				return this._z;
			}

			set r(value) {
				if (typeof value === 'number') this._x = value;
			}

			set g(value) {
				if (typeof value === 'number') this._y = value;
			}

			set b(value) {
				if (typeof value === 'number') this._z = value;
			}
		}
	}
}