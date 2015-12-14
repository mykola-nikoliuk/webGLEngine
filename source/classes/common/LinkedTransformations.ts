///<reference path="./Matrix.ts"/>

module WebGLEngine.Types {

	export class LinkedTransformations extends Transformations {

		private _parent : LinkedTransformations;
		private _children : LinkedTransformations[];

		constructor() {
			super();
			this._parent = null;
			this._children = [];
		}

		/** Sets parent and adds current child to parent */
		public setParent(parent : LinkedTransformations) : boolean {
			if (parent instanceof LinkedTransformations) {
				this._parent.addChild(this);
				return true;
			}
			else {
				Console.warning('LinkedTransformations.setParent() : parent isn\'t instance of LinkedTransformations\n' +
					'parent isn\'t added');
			}
			return false;
		}

		/** Clear parent and current child from it */
		public clearParent() {
			this._parent.removeChild(this);
		}

		/** Returns parent */
		public getParent() : LinkedTransformations {
			return this._parent;
		}

		/** Returns matrix of mesh parent tree */
		public getMatrix(type = Matrix.transformToMatrixTypes.USUAL) : number[] {
			var parent = this,
				transformations = [this],
				matrix = Utils.GLMatrix.mat4.identity(Utils.GLMatrix.mat4.create());

			while (parent = parent.getParent()) {
				transformations.push(parent);
			}

			while (transformations.length) {
				// TODO : check this operation
				Utils.GLMatrix.mat4.multiply(matrix, Matrix.transformationsToMatrix(transformations.pop(), type), matrix);
			}

			return matrix;
		}

		/** Adds dependent child
		 * Returns true if child was added, otherwise false */
		public addChild(child : LinkedTransformations) : boolean {
			if (child instanceof LinkedTransformations) {
				child._parent = this;
				this._children.push(child);
				return true;
			}
			else {
				Console.error('LinkedTransformations.addChild() : parameter should be instance on LinkedTransformations');
				return false;
			}
		}

		/** Removes dependent child
		 * Returns true if child was removed, otherwise false */
		public removeChild(child : LinkedTransformations) : boolean {
			var index : number;
			if (child instanceof LinkedTransformations) {
				if ((index = this._children.indexOf(child)) >= 0) {
					this._children.splice(index, 1);
					child._parent = null;
					return true;
				}
				else {
					Console.warning('LinkedTransformations.removeChild() : child not found');
				}
				this._children.push(child);
			}
			else {
				Console.error('LinkedTransformations.removeChild() : parameter should be instance on LinkedTransformations');
			}
			return false;
		}

		/** Check is child presented
		 * Returns true if child presented, otherwise false */
		public hasChild(child : LinkedTransformations) : boolean {
			if (child instanceof LinkedTransformations) {
				return this._children.indexOf(child) >= 0;
			}
			else {
				Console.error('LinkedTransformations.hasChild() : parameter should be instance on LinkedTransformations');
			}
			return null;
		}
	}
}