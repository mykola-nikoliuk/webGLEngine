module webGLEngine {

	export module Types {

		export class Vector3 {

			private _x = 0;
			private _y = 0;
			private _z = 0;

			constructor(x?, y?, z?) {
				this.set(x, y, z);
			}

			public set(x, y, z) : void {
				this._x = typeof x === 'number' ? x : 0;
				this._y = typeof y === 'number' ? y : 0;
				this._z = typeof z === 'number' ? z : 0;
			}

			public add(x, y, z) : void {
				this._x += typeof x === 'number' ? x : 0;
				this._y += typeof y === 'number' ? y : 0;
				this._z += typeof z === 'number' ? z : 0;
			}

			public getArray() : any[] {
				return [this._x, this._y, this._z];
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