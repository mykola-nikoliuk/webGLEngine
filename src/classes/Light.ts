module WebGLEngine.Types {

	export class Light {

		public static Types = {
			DIRECTIONAL: 1,
			POINT: 2,
      AMBIENT: 3,
		};

		private _type : number;
		private _enabled : boolean;
		private _distance : number;
		private _color : Vector3;
		private _position : Vector3;
		private _direction : Vector3;

		constructor(type : number, color : Vector3, positionDirection : Vector3 = new Vector3(), distance? : number) {
			this._enabled = true;
			this._type = type;
			this._color = color;

			switch (type) {
				case Light.Types.DIRECTIONAL:
					this._direction = positionDirection;
					break;

				case Light.Types.POINT:
					this._position = positionDirection;
			}
			this._distance = typeof distance === 'number' ? distance : 0;
		}

		public turnOn() : void {
			this._enabled = true;
		}

		public turnOff() : void {
			this._enabled = false;
		}

		public isEnabled() : boolean {
			return this._enabled;
		}

		get color() : Vector3 {
			return this._color;
		}

		//set color(color) {
		//}

		get position() : Vector3 {
			return this._position;
		}

		//set position(position) {
		//}

		get distance() : number {
			return this._distance;
		}

		//set distance(distance) {
		//}

		get direction() : Vector3 {
			return this._direction;
		}

    get type() {
      return this._type;
    }
	}
}
