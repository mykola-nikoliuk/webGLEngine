module webGLEngine {

	export module Types {

		export class AnimationTarget {
			private _mesh : Mesh;
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
		}
	}
}