module webGLEngine.Types {

	export class Render extends Subscribe {

		private _engine : Engine;
		private _renderTimer : Utils.Timer = new Utils.Timer();

		constructor(engine : Engine) {
			super();
			this._engine = engine;
			this._renderTimer = new Utils.Timer();
		}

		/** set render frequency per second
		 * @param framePerSecond frames per second
		 * @returns is set successful
		 */
		public setFPS(framePerSecond : number) : boolean {
			if (typeof framePerSecond === 'number') {
				if (this._renderTimer.isTimerEnabled()) {
					this._renderTimer.stop();
				}
				this._renderTimer.start(new Utils.Callback(this._render, this), 1000 / framePerSecond);
				return true;
			}
			return false;
		}

		/** render the scene
		 * if you want to use your own uneven render */
		public render() {
			this._render();
		}

		private _render() {
			var i : number;
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