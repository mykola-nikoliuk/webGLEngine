module webGLEngine {

	export module Types {

		export class AnimationTarget {
			private _reservedTransformation : Transformations;
			private _mesh : Transformations;
			private _startTime : number;
			private _frameIndex : number;
			private _callback : Utils.Callback;

			constructor(mesh : Transformations) {
				if (mesh instanceof Transformations) {
					this._mesh = mesh;
					this._frameIndex = 0;
				}
				else {
					console.log('>>> Error: AnimationTarget:constructor() mesh isn\'t instance of Transformations()');
				}
			}

			public start(callback? : Utils.Callback) : void {
				this._startTime = Date.now();
				if (callback instanceof Utils.Callback) {
					this._callback = callback;
				}
				else {
					this._callback = new Utils.Callback(function () {}, {});
				}
			}

			public nextFrame() : number {
				return ++this._frameIndex;
			}

			public shiftStartTime(time : number) : void {
				this._startTime += time;
			}

			public callback() : void {
				this._callback.apply();
			}

			public saveTransformation() : void {
				this._reservedTransformation = this._mesh.cloneTransformations();
			}

			public revertTransformation() : void {
				this._mesh.copyFrom(this._reservedTransformation);
			}

			public getFrameIndex() : number {
				return this._frameIndex;
			}

			public getMesh() : Transformations {
				return this._mesh;
			}

			public getStartTime() : number {
				return this._startTime;
			}
		}
	}
}