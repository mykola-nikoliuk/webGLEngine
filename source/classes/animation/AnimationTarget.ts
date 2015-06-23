module webGLEngine {

	export module Types {

		export class AnimationTarget {
			private _mesh : Mesh;
			private _startTime : number;
			private _frameIndex : number;

			constructor(mesh : Mesh) {
				if (mesh instanceof Mesh) {
					this._mesh = mesh;
					this._frameIndex = 0;
				}
				else {
					console.log('>>> Error: AnimationTarget:constructor() mesh isn\'t instance of Mesh()');
				}
			}

			public getFrameIndex() : number {
				return this._frameIndex;
			}

			public getMesh() : Mesh {
				return this._mesh;
			}

			public getStartTime() : number {
				return this._startTime;
			}

			public start() : void {
				this._startTime = Date.now();
			}

			public nextFrame() : number {
				return ++this._frameIndex;
			}

			public shiftStartTime(time : number) : void {
				this._startTime += time;
			}
		}
	}
}