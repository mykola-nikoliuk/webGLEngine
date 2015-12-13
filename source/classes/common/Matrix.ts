module WebGLEngine.Types {

	export class Matrix {

		public static transformToMatrixTypes = {
			USUAL        : 1,
			WITHOUT_SCALE: 2
		};

		public static transformationsToMatrix(transformations : Transformations, type = Matrix.transformToMatrixTypes.USUAL) : number[] {
			var matrix = Utils.GLMatrix.mat4.identity(Utils.GLMatrix.mat4.create());
			//noinspection FallThroughInSwitchStatementJS
			switch (type) {
				case Matrix.transformToMatrixTypes.USUAL:
					Utils.GLMatrix.mat4.scale(matrix, transformations.scale.getArray());

				case Matrix.transformToMatrixTypes.WITHOUT_SCALE:
					Utils.GLMatrix.mat4.rotateX(matrix, transformations.rotation.x);
					Utils.GLMatrix.mat4.rotateY(matrix, transformations.rotation.y);
					Utils.GLMatrix.mat4.rotateZ(matrix, transformations.rotation.z);
					Utils.GLMatrix.mat4.translate(matrix, transformations.position.getArray());
					break;
			}
			return matrix;
		}
	}
}