module WebGLEngine.Types {

	export class Render extends Subscribe {

		private _engine : Engine;
		private _renderTimer : Utils.Timer = new Utils.Timer();
		private _renderCallback : Function;
		private _lastFPSSecond : number;
		private _FPSCounter : number;

		constructor(engine : Engine) {
			super();
			this._engine = engine;
			this._renderTimer = new Utils.Timer();
			this._renderCallback = Utils.bind(this._render, this);
			this._lastFPSSecond = Date.now() / 1000 | 0;
			this._FPSCounter = 0;
			this._render();
		}

		// TODO : add custom render
		/** render the scene
		 * if you want to use your own uneven render */
		//public render() {
		//	this._render();
		//}

		private _render() {
			var i : number,
				currentFPSSecond = Date.now() / 1000 | 0;

			if (this._lastFPSSecond !== currentFPSSecond) {
				//Console.log('FPS : ' + this._FPSCounter);
				this._lastFPSSecond = currentFPSSecond;
				this._FPSCounter = 0;
			}
			else {
				this._FPSCounter++;
			}

			window.requestAnimationFrame(<FrameRequestCallback>this._renderCallback);
			if (this._engine.isReady()) {

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

				// update after render
				for (i = 0; i < Animation.pool.size(); i++) {
					Animation.pool.get(i).updateAfterRender();
				}
			}
		}
	}
}