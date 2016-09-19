module WebGLEngine.Types {

	export class Vector3 {

		private _x : number;
		private _y : number;
		private _z : number;
		private _touched : boolean;

		constructor(x?, y?, z?) {
			this.set(x, y, z);
		}

		public set(x, y, z) : Vector3 {
			this._x = typeof x === 'number' ? x : 0;
			this._y = typeof y === 'number' ? y : 0;
			this._z = typeof z === 'number' ? z : 0;
			this._touched = true;
			return this;
		}

		public add(x, y, z) : Vector3 {
			this._x += typeof x === 'number' ? x : 0;
			this._y += typeof y === 'number' ? y : 0;
			this._z += typeof z === 'number' ? z : 0;
			this._touched = true;
			return this;
		}

		public minus(vector : Vector3) : Vector3 {
			this._x -= vector._x;
			this._y -= vector._y;
			this._z -= vector._z;
			this._touched = true;
			return this;
		}

		public plus(vector : Vector3) : Vector3 {
			this._x += vector._x;
			this._y += vector._y;
			this._z += vector._z;
			this._touched = true;
			return this;
		}

		public multiply(multiplier : number) : Vector3 {
			this._x *= multiplier;
			this._y *= multiplier;
			this._z *= multiplier;
			this._touched = true;
			return this;
		}

		public divide(divider : number) : Vector3 {
			this._x /= divider;
			this._y /= divider;
			this._z /= divider;
			this._touched = true;
			return this;
		}

		public clone() : Vector3 {
			return new Vector3(this._x, this._y, this._z);
		}

		public invertSign() : Vector3 {
			this._x *= -1;
			this._y *= -1;
			this._z *= -1;
			this._touched = true;
			return this;
		}

		public copyFrom(vector : Vector3) : void {
			this._x = vector._x;
			this._y = vector._y;
			this._z = vector._z;
			this._touched = true;
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

		get touched() : boolean {
			return this._touched;
		}

		set touched(value : boolean) {
			if (typeof value === 'boolean') {
				this._touched = value;
			}
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
			if (typeof value === 'number') {
				this._x = value;
				this._touched = true;
			}
		}

		set y(value) {
			if (typeof value === 'number') {
				this._y = value;
				this._touched = true;
			}
		}

		set z(value) {
			if (typeof value === 'number') {
				this._z = value;
				this._touched = true;
			}
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
			this.x = value;
		}

		set g(value) {
			this.y = value;
		}

		set b(value) {
			this.z = value;
		}
	}
}