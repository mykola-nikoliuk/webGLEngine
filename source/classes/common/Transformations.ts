///<reference path="Vector3.ts"/>

module webGLEngine {

	export module Types {

		export class Transformations {

			public position : Vector3;
			public rotation : Vector3;
			public scale : Vector3;

			private _parent : Transformations;

			constructor() {
				this._parent = null;
				this.position = new Vector3();
				this.rotation = new Vector3(0, 0, 0);
				this.scale = new Vector3(1, 1, 1);
			}

			//public set(position : Vector3, rotation : Vector3, scale : Vector3) : void {
			//	this.position = position;
			//	this.rotation = rotation;
			//	this.scale = scale;
			//}

			public setParent(parent : Transformations) : boolean {
				if (parent instanceof  Transformations) {
					this._parent = parent;
					return true;
				}
				else {
					Console.warning('Transformations.setParent() : parent isn\'t instance of Transformations\n' +
						'parent isn\'t added');
				}
				return false;
			}

			public clearParent() {
				this._parent = null;
			}

			public getParent() : Transformations {
				return this._parent;
			}

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
}