module WebGLEngine.Types {

	export class Light {

		private _type : number;
		private _enabled : boolean;
		private _distance : number;
		private _color : Vector3;
		private _position : Vector3;


		constructor(type : number, color : number[], param : number[], distance : number) {

			this._type = 0;

			this._enabled = true;

			this._distance = typeof distance === 'number' ? distance : 10;

			/** @private
			 * @type {Vector3} */
			this._color = new Vector3();

			/** @private
			 * @type {Vector3} */
			this._position = new Vector3();

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
		}

		public turnOn() : void {
			this._enabled = true;
		}

		public turnOff() : void {
			this._enabled = false;
		}

		/** @public */
		public isEnabled() : boolean {
			return this._enabled;
		}

		get color() : Vector3 {
			return this._color;
		}

		get position() : Vector3 {
			return this._position;
		}

		get distance() : number {
			return this._distance;
		}

		set color(color) {
		}

		set position(position) {
		}

		set distance(distance) {
		}
	}
}