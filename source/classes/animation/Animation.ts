module webGLEngine {

	export module Types {

		export class Animation {
			private _frames : Frame[];

			constructor(frames : Frame[]) {
				this._frames = [];

				if (frames instanceof Array) {
					for (var i = 0; i < frames.length; i++) {
						if (frames[i] instanceof Frame) {
							this._frames.push(frames[i]);
						}
					}
				}
			}

			public setTimeByDistance(time : number) {
				var length: number,
					totalLength = 0,
					sectorsLength = [],
					i : number;

				if (typeof time === 'number' && time > 0) {
					sectorsLength.push(0);
					// get distance between frames
					for (i = 0; i < this._frames.length - 1; i++) {
						length = this._frames[i].getPosition().getDistanceTo(this._frames[i+1].getPosition());
						totalLength += length;
						sectorsLength.push(length);
					}
					for (i = 0; i < this._frames.length; i++) {
						this._frames[i].setTime(time * (sectorsLength[i] / totalLength));
					}
				}
				else {
					console.log('>>> Error: Animation:setTimeByDistance() time should be a positive number');
				}
			}
		}
	}
}