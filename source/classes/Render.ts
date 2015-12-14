module WebGLEngine.Types {

	export class Render extends Subscribe {

		private _engine : Engine;
		private _renderCallback : Function;
		private _lastDrawCallback : Utils.Callback;
		private _lastFPSSecond : number;
		private _FPSCounter : number;
		private _FPS : number;

		constructor(engine : Engine, lastDrawCallback = null) {
			super();
			this._engine = engine;
			this._renderCallback = Utils.bind(this._render, this);
			this._lastDrawCallback = lastDrawCallback;
			this._lastFPSSecond = Date.now() / 1000 | 0;
			this._FPSCounter = 0;
			this._FPS = 0;
			this._render();
		}

		public getFPS() : number {
			return this._FPS;
		}

		// TODO : add custom render

		private _render() {
			window.requestAnimationFrame(<FrameRequestCallback>this._renderCallback);

			var i : number,
				canvas = this._engine.getCanvasInstance(),
				currentFPSSecond = Date.now() / 1000 | 0;

			if (this._lastFPSSecond !== currentFPSSecond) {
				this._FPS = this._FPSCounter;
				this._lastFPSSecond = currentFPSSecond;
				this._FPSCounter = 0;
			}
			else {
				this._FPSCounter++;
			}

			if (this._engine.isReady()) {
				if (canvas) {
					canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
				}

				// updates before render
				for (i = 0; i < Animation.pool.size(); i++) {
					Animation.pool.get(i).updateBeforeRender();
				}

				// updates cameras
				for (i = 0; i < Camera.pool.size(); i++) {
					Camera.pool.get(i).update();
				}

				// call subscribed functions for render
				for (i = 0; i < this._subscribers.length; i++) {
					this._subscribers[i].apply();
				}

				if (this._lastDrawCallback) {
					this._lastDrawCallback.apply();
				}

				// update after render
				for (i = 0; i < Animation.pool.size(); i++) {
					Animation.pool.get(i).updateAfterRender();
				}
			}
		}
	}
}