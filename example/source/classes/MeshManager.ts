// TODO : probably better to use this manager in library?
module Example {
	export class MeshManager {

		private _meshPool : {[key:string] : WebGLEngine.Types.Mesh};

		constructor() {
			this._meshPool = {};
		}

		public add(name : string, mesh : WebGLEngine.Types.Mesh) {
			if (this._meshPool.hasOwnProperty(name)) {
				WebGLEngine.Console.error('MeshManager.add() : mesh with this name already exist');
			}
			else {
				this._meshPool[name] = mesh;
			}
		}

		public remove(name : string) {
			if (this._meshPool.hasOwnProperty(name)) {
				delete this._meshPool[name];
			}
			else {
				WebGLEngine.Console.error('MeshManager.remove() : mesh with this name not found');
			}
		}

		public get(name : string) : WebGLEngine.Types.Mesh {
			if (this._meshPool.hasOwnProperty(name)) {
				return this._meshPool[name];
			}
			else {
				WebGLEngine.Console.error('MeshManager.get() : mesh with this name doesn\'t exist');
				return null;
			}
		}
	}
}