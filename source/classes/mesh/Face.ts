module WebGLEngine.Types {

	export class Face {
		public vertexIndex : number;
		public normalIndex : number;
		public textureIndex : number;

		constructor(vertexIndex : number, textureIndex : number, normalIndex : number) {
			this.vertexIndex = typeof vertexIndex === 'number' ? vertexIndex : 0;
			this.textureIndex = typeof textureIndex === 'number' ? textureIndex : 0;
			this.normalIndex = typeof normalIndex === 'number' ? normalIndex : 0;
		}
	}
}