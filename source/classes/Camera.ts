module WebGLEngine.Types {

		export class Camera extends LinkedTransformations {

			private static _pool = new Pool<Camera>();
			private _followTarget : Transformations;
			private _distance : number;

			constructor() {
				super();
				this._followTarget = null;
				this.turnOn();
			}

			public static get pool() : Pool<Camera> {
				return this._pool;
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

			public update(deltaTime : number) {
				var hypotenuse2D : number,
					distance : number,
					ratio : number,
					yAngle : number,
					position : Vector3;

				if (this._followTarget) {
					if (this._distance === 0) {
						this.position.copyFrom(this._followTarget.position);
						this.rotation.y = this._followTarget.rotation.y;
					}
					else {
						position = this._followTarget.position.clone().minus(this.position);
						hypotenuse2D = Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.z, 2));
						yAngle = Math.asin(position.x / hypotenuse2D);

						if (position.z > 0) {
							if (position.x < 0) {
								yAngle = -Math.PI - yAngle;
							}
							else {
								yAngle = Math.PI - yAngle;
							}
						}

						this.rotation.y = -yAngle;
						this.rotation.x = Math.atan(position.y / hypotenuse2D);

						if (this._distance > 0) {
							distance = this.position.getDistanceTo(this._followTarget.position);
							ratio = this._distance / distance;
							position.multiply(ratio);
							this.position.copyFrom(this._followTarget.position.clone().minus(position));
						}
					}
				}
			}

			/** Adds camera to cameras pool
			 * Removes true if animation was added, otherwise false */
			public turnOn() : boolean {
				return Camera.pool.add(this);
			}

			/** Remove camera from cameras pool
			 * Removes true if camera was removed, otherwise false  */
			public turnOff() : boolean {
				return Camera.pool.remove(this);
			}
		}
}