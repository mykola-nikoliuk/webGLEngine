///<reference path="../common/Vector3.ts"/>

module webGLEngine {

	export module Types {

		export class Transformations {

			public position : Vector3;
			public rotation : Vector3;
			public scale : Vector3;

			constructor() {
				this.position = new Vector3();
				this.rotation = new Vector3(0, 0, 0);
				this.scale = new Vector3(1, 1, 1);
			}
		}
	}
}