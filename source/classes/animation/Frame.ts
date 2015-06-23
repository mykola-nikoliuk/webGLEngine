module webGLEngine {

	export module Types {

		export class Frame {
			private _position : Types.Vector3;
			private _rotation : Types.Vector3;
			private _time : number;

			constructor() {
				this._position = null;
			}

			public setPosition(position : Types.Vector3) : Frame {
				if (position instanceof Types.Vector3) {
					this._position = position;
					console.log('>>> Error: Frame:setPosition() position is not instance of Vector3');
				}
				return this;
			}

			public getPosition() : Types.Vector3 {
				return this._position;
			}

			public setRotation(rotation : Types.Vector3) : Frame {
				if (rotation instanceof Types.Vector3) {
					this._rotation = rotation;
					console.log('>>> Error: Frame:setRotation() rotation is not instance of Vector3');
				}
				return this;
			}

			public getRotation() : Types.Vector3 {
				return this._rotation;
			}

			public setTime(time : number) : Frame {
				if (typeof time === 'number') {
					this._time = time;
				}
				return this;
			}

			public getTime() : number {
				return this._time;
			}
		}
	}
}