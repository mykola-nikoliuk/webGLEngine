module webGLEngine {

	export module Types {

		export class Animation {
			private _type : number;
			private _frames : Frame[];
			private _initialFrame : Frame;
			private _targets : AnimationTarget[];

			public static animations : Animation[] = [];
			public static Types = {
				WITH_CHANGES   : 0,
				WITHOUT_CHANGES: 1
			};

			constructor(type : number, initialFrame : Frame, frames : Frame[]) {
				this._type = type;
				this._initialFrame = initialFrame;
				this._frames = [];
				this._targets = [];

				if (frames instanceof Array) {
					for (var i = 0; i < frames.length; i++) {
						if (frames[i] instanceof Frame) {
							this._frames.push(frames[i]);
						}
					}
				}

				Animation.animations.push(this);
			}

			public start(mesh : Transformations, callback? : Utils.Callback) : void {
				var target = new AnimationTarget(mesh),
					i : number;

				target.start(callback);
				for (i = 0; i < this._targets.length; i++) {
					if (this._targets[i].getMesh() === mesh) {
						this._targets.splice(i, 1);
						i--;
					}
				}
				this._targets.push(target);
			}

			/** Do updates before render */
			public updateBeforeRender() {
				this.update();
			}

			/** Do updated after render */
			public updateAfterRender() {

			}

			public update() : void {
				var elapsedTime : number,
					frameIndex : number,
					targetRemoved : boolean,
					target : AnimationTarget,
					i : number;

				for (i = 0; i < this._targets.length; i++) {
					target = this._targets[i];
					frameIndex = target.getFrameIndex();

					// search for current frame
					do {
						elapsedTime = Date.now() - target.getStartTime();
						if (elapsedTime >= this._frames[frameIndex].getTime()) {
							target.shiftStartTime(this._frames[frameIndex].getTime());
							frameIndex = target.nextFrame();
							if (frameIndex >= this._frames.length) {
								// last update
								this._updateTarget(target, frameIndex - 1, 1);
								this._targets.shift();
								target.callback();
								i--;
								break;
							}
						}
						else {
							this._updateTarget(target, frameIndex, elapsedTime / this._frames[frameIndex].getTime());
						}
					}
					while (elapsedTime >= this._frames[frameIndex].getTime());
				}
			}

			public setTimeByDistance(time : number) {
				var length : number,
					totalLength = 0,
					frame : Frame,
					nextFrame : Frame,
					sectorsLength = [],
					i : number;

				if (typeof time === 'number' && time > 0) {
					// get distance between frames
					for (i = 0; i < this._frames.length; i++) {
						frame = i === 0 ? this._initialFrame : this._frames[i - 1];
						nextFrame = this._frames[i];
						length = frame.getPosition().getDistanceTo(nextFrame.getPosition());
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

			/** Removes animation from general animations list */
			public destroy() {
				var index : number;

				if ((index = Animation.animations.indexOf(this)) >= 0) {
					Animation.animations.splice(index, 1);
				}
			}

			private _updateTarget(target : AnimationTarget, frameIndex : number, percents : number) : void {
				var frame : Frame,
					previousFrame : Frame = frameIndex > 0 ? this._frames[frameIndex - 1] : this._initialFrame,
					mesh : Transformations,
					vector : Vector3;

				frame = this._frames[frameIndex];
				mesh = target.getMesh();
				if (frame.getPosition()) {
					vector = frame.getPosition().clone();
					vector.minus(previousFrame.getPosition());
					//- previousFrame.getPosition()
					vector.multiply(percents);
					vector.plus(previousFrame.getPosition());
					mesh.position = vector;
				}
				if (frame.getRotation()) {
					vector = frame.getRotation().clone();
					vector.minus(previousFrame.getRotation());
					//- previousFrame.getPosition()
					vector.multiply(percents);
					vector.plus(previousFrame.getRotation());
					mesh.rotation = vector;
				}
			}
		}
	}
}