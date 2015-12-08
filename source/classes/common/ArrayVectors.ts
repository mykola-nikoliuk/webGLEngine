module WebGLEngine.Types {

	export class ArrayVector {

		private _array : number[];
		private _itemSize : number;

		constructor(array : number[], itemSize : number) {
			this._array = [];
			switch (true) {
				case !(array instanceof Array):
					Console.error('ArrayVector:constructor() : array should be instance of Array');
					break;

				case typeof itemSize !== 'number':
					Console.error('ArrayVector:constructor() : itemSize should be a number');
					break;

				case array.length === 0:
					Console.error('ArrayVector:constructor() : array should not be empty');
					break;

				case !(array.length % itemSize === 0):
					Console.error('ArrayVector:constructor() : array should be multiple of itemSize');
					break;

				default:
					this._array = array;
					this._itemSize = itemSize;
					break;
			}
		}

		//public minus(vector : Vector3) : Vector3 {
		//	this._x -= vector._x;
		//	this._y -= vector._y;
		//	this._z -= vector._z;
		//	return this;
		//}
		//
		//public plus(vector : Vector3) : Vector3 {
		//	this._x += vector._x;
		//	this._y += vector._y;
		//	this._z += vector._z;
		//	return this;
		//}
		//
		//public multiply(multiplier : number) : Vector3 {
		//	this._x *= multiplier;
		//	this._y *= multiplier;
		//	this._z *= multiplier;
		//	return this;
		//}
		//
		//public divide(divider : number) : Vector3 {
		//	this._x /= divider;
		//	this._y /= divider;
		//	this._z /= divider;
		//	return this;
		//}
		//
		//public clone() : Vector3 {
		//	return new Vector3(this._x, this._y, this._z);
		//}
		//
		//public invertSign() : Vector3 {
		//	this._x *= -1;
		//	this._y *= -1;
		//	this._z *= -1;
		//	return this;
		//}
		//
		//public copyFrom(vector : Vector3) : void {
		//	this._x = vector._x;
		//	this._y = vector._y;
		//	this._z = vector._z;
		//}
		//
		//public getArray() : any[] {
		//	return [this._x, this._y, this._z];
		//}
		//
		//public getDistanceTo(point : Vector3) {
		//	return Math.sqrt(Math.abs(
		//		Math.pow(this._x - point._x, 2) +
		//		Math.pow(this._y - point._y, 2) +
		//		Math.pow(this._z - point._z, 2)
		//	));
		//}
		//
		//get x() {
		//	return this._x;
		//}
		//
		//get y() {
		//	return this._y;
		//}
		//
		//get z() {
		//	return this._z;
		//}
		//
		//set x(value) {
		//	if (typeof value === 'number') this._x = value;
		//}
		//
		//set y(value) {
		//	if (typeof value === 'number') this._y = value;
		//}
		//
		//set z(value) {
		//	if (typeof value === 'number') this._z = value;
		//}
		//
		//get r() {
		//	return this._x;
		//}
		//
		//get g() {
		//	return this._y;
		//}
		//
		//get b() {
		//	return this._z;
		//}
		//
		//set r(value) {
		//	if (typeof value === 'number') this._x = value;
		//}
		//
		//set g(value) {
		//	if (typeof value === 'number') this._y = value;
		//}
		//
		//set b(value) {
		//	if (typeof value === 'number') this._z = value;
		//}
	}
}