module Example {

	export class VehicleAxle {

		public position : WebGLEngine.Types.Vector3;
		public leftWheel : WebGLEngine.Types.Mesh;
		public rightWheel : WebGLEngine.Types.Mesh;
		public width : number;
		public controlCoefficient : number;
		public drive : boolean;
		public control : boolean;

		constructor(position : WebGLEngine.Types.Vector3, width : number, wheel : WebGLEngine.Types.Mesh) {
			this.position = position.clone();
			this.leftWheel = wheel.transformationClone();
			this.rightWheel = wheel.transformationClone();
			this.controlCoefficient = 0;
			this.width = width;
			this.drive = false;
			this.control = false;

			this._setupWheels();
		}

		private _setupWheels() {
			this.leftWheel.position.copyFrom(this.position);
			this.rightWheel.position.copyFrom(this.position);
			this.rightWheel.rotation.y += Math.PI;
			this.leftWheel.position.x -= this.width / 2;
			this.rightWheel.position.x += this.width / 2;
		}

	}
}