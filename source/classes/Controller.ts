module webGLEngine.Types {

	export class Controller extends Subscribe {

		public static Events = {
			MESH_LOADED: 'mesh_loaded'
		};

		private _engine : Engine;
		private _lastLoadedMesh : Mesh;

		constructor(engine : Engine) {
			super();
			this._engine = engine;
			this._lastLoadedMesh = null;
		}

		public sendEvent(event : string) : void {
			this._handler.call(this, arguments);
			for (var i = 0; i < this._subscribers.length; i++) {
				this._subscribers[i].apply(event);
			}
		}

		public getLastLoadedMesh() : Mesh {
			return this._lastLoadedMesh;
		}

		private _handler(event : string, parameter : any) {
			switch (event) {
				case Controller.Events.MESH_LOADED:
					this._lastLoadedMesh = parameter;
					break;
			}
		}
	}
}