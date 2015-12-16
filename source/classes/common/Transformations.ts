///<reference path="./Matrix4.ts"/>

module WebGLEngine.Types {

	export class Transformations {

		private _position : Vector3;
		private _rotation : Vector3;
		private _scale : Vector3;

		private _translateMatrix : Matrix4;
		private _rotationMatrix : Matrix4;
		private _scaleMatrix : Matrix4;
		private _localMatrix : Matrix4;
		private _normalMatrix : Matrix4;

		private _isLocalMatrixTouched : boolean;
		private _isNormalMatrixTouched : boolean;

		constructor() {
			this._position = new Vector3(0, 0, 0);
			this._rotation = new Vector3(0, 0, 0);
			this._scale = new Vector3(1, 1, 1);

			this._translateMatrix = new Matrix4();
			this._rotationMatrix = new Matrix4();
			this._scaleMatrix = new Matrix4();
			this._localMatrix = new Matrix4();
			this._normalMatrix = new Matrix4();

			this._isLocalMatrixTouched = true;
			this._isNormalMatrixTouched = true;
		}

		public cloneTransformations() : Transformations {
			var transformation = new Transformations();
			transformation.copyFrom(this);
			return transformation;
		}

		public copyFrom(transformation : Transformations) : void {
			this.position.copyFrom(transformation.position);
			this.rotation.copyFrom(transformation.rotation);
			this.scale.copyFrom(transformation.scale);
		}

		get position() {
			return this._position;
		}

		get rotation() {
			return this._rotation;
		}

		get scale() {
			return this._scale;
		}

		get translateMatrix() : Matrix4 {
			if (this._position.touched) {
				this._translateMatrix = Matrix4.TranslateMatrix(this._position);
				this._isLocalMatrixTouched = true;
				this._isNormalMatrixTouched = true;
				this._position.touched = false;
			}
			return this._translateMatrix;
		}

		get rotationMatrix() : Matrix4 {
			if (this._rotation.touched) {
				this._rotationMatrix = Matrix4.RotationMatrix(this._rotation);
				this._isLocalMatrixTouched = true;
				this._isNormalMatrixTouched = true;
				this._rotation.touched = false;
			}
			return this._rotationMatrix;
		}

		get scaleMatrix() : Matrix4 {
			if (this._scale.touched) {
				this._scaleMatrix = Matrix4.ScaleMatrix(this._scale);
				this._isLocalMatrixTouched = true;
				this._scale.touched = false;
			}
			return this._scaleMatrix;
		}

		get localMatrix() : Matrix4 {
			if (this._isLocalMatrixTouched || this._position.touched || this._rotation.touched || this._scale.touched) {
				this._localMatrix = (new Matrix4())
					.clone(this.translateMatrix)
					.multiply(this.rotationMatrix)
					.multiply(this.scaleMatrix);
				this._isLocalMatrixTouched = false;
			}
			return this._localMatrix;
		}

		get normalMatrix() : Matrix4 {
			if (this._isNormalMatrixTouched || this._position.touched || this._rotation.touched) {
				this._normalMatrix = (new Matrix4())
					.clone(this.translateMatrix)
					.multiply(this.rotationMatrix);
				this._isNormalMatrixTouched = false;
			}
			return this._normalMatrix;
		}
	}
}