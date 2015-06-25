///<reference path="common/Vector3.ts"/>

module webGLEngine {

	export module Types {

		export class Subscribe {

			protected _subscribers : Utils.Callback[];

			constructor() {
				this._subscribers = [];
			}

			/** Add subscriber
			 * @param callback
			 * @return is callback Was added
			 */
			public subscribe(callback : Utils.Callback) : boolean {
				if (this._subscribers.indexOf(callback) < 0) {
					this._subscribers.push(callback);
					return true;
				}
				return false;
			}

			/** Removes subscriber
			 * @param callback
			 * @return is callback Was deleted
			 */
			public unsubscribe(callback : Utils.Callback) : boolean {
				var index : number;
				if ((index = this._subscribers.indexOf(callback)) > 0) {
					this._subscribers.splice(index, 1);
					return true;
				}
				return false;
			}
			
		}

	}
}