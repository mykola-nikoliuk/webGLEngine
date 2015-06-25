module webGLEngine {

	export module Types {

		export class Render {

			private _engine : Engine;
			private _subscribers : Utils.Callback[];
			private _renderTimer : Utils.Timer;

			constructor(engine : Engine) {
				this._engine = engine;
				this._subscribers = [];
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

			/** Add render subscriber
			 * @param renderCallback
			 * @return is callback Was added
			 */
			public subscribe(renderCallback : Utils.Callback) : boolean {
				if (this._subscribers.indexOf(renderCallback) < 0) {
					this._subscribers.push(renderCallback);
					return true;
				}
				return false;
			}

			/** Removes render subscriber
			 * @param renderCallback
			 * @return is callback Was deleted
			 */
			public unsubscribe(renderCallback : Utils.Callback) : boolean {
				var index : number;
				if ((index = this._subscribers.indexOf(renderCallback)) > 0) {
					this._subscribers.splice(index, 1);
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
					// TODO : finish render

					// updates before render
					for (i = 0; i < Animation.animations.length; i++) {
						Animation.animations[i].updateBeforeRender();
					}

					// call subscribed functions for render
					for (i = 0; i < this._subscribers.length; i++) {
						this._subscribers[i].apply();
					}

					// update after render
					for (i = 0; i < Animation.animations.length; i++) {
						Animation.animations[i].updateAfterRender();
					}
				}
			}
		}
	}
}