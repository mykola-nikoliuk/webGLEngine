///<reference path="common/Vector3.ts"/>

module webGLEngine {

	export module Types {

		export class Camera extends Transformations{

			public static cameras : Camera[] = [];

			private _followTarget : Transformations;
			private _distance : number;

			constructor() {
				super();
				this._followTarget = null;
				this.turnOn();
			}

			/** Sets follow state for camera */
			public follow(transformations : Transformations, distance? : number) : void {
				if (transformations instanceof Transformations) {
					this._followTarget = transformations;
					this._distance = typeof distance === 'number' ? distance : -1;
				}
				else {
					Console.error('Camera:follow() : first parameter should be instance of Transformations');
				}
			}

			/** Removes follow state */
			public unfollow() : void {
				this._followTarget = null;
			}

			public update() {
				if (this._followTarget) {
					this.position.copyFrom(this._followTarget.position);
					// TODO : change position by follow rules
				}
			}

			/** Adds camera to engine */
			public turnOn() {
				Camera.cameras.push(this);
			}

			/** Release camera from engine */
			public turnOff() {
				var index : number;
				if ((index = Camera.cameras.indexOf(this)) >= 0) {
					Camera.cameras.splice(index, 1);
				}
			}
		}

	}
}