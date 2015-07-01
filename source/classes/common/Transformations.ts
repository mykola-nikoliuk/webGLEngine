module webGLEngine.Types {

	export class Transformations {

		public position : Vector3;
		public rotation : Vector3;
		public scale : Vector3;

		constructor() {
			this.position = new Vector3();
			this.rotation = new Vector3(0, 0, 0);
			this.scale = new Vector3(1, 1, 1);
		}

		//public set(position : Vector3, rotation : Vector3, scale : Vector3) : void {
		//	this.position = position;
		//	this.rotation = rotation;
		//	this.scale = scale;
		//}

		public copyFrom(transformation : Transformations) : void {
			this.position.copyFrom(transformation.position);
			this.rotation.copyFrom(transformation.rotation);
			this.scale.copyFrom(transformation.scale);
		}

		public cloneTransformations() : Transformations {
			var transformation = new Transformations();
			transformation.copyFrom(this);
			return transformation;
		}
	}
}