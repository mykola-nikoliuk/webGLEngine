module Game {

	export module Types {

		export module Car {

			export class Car {

			}

			export module Parts {

				export class Engine {

					private _torque : number[];
					private _power : number[];
					private _RPMStep : number;
					private _backTorque : number;
					private _throttleSaver : number;

					private _idleRPM : number;
					private _RPM : number;

					private static _inertia = 0.99;
					private static _throttleSaverStep = 0.05;

					constructor(torque : number[],
											RPMStep : number,
											idleRPM : number,
											backTorque : number) {

						var i;

						this._torque = torque;
						this._RPMStep = RPMStep;
						this._backTorque = backTorque;
						this._idleRPM = idleRPM;
						this._throttleSaver = 0;
						this._RPM = 800;

						this._power = [];
						for (i = 0; i < torque.length; i++) {
							this._power.push(torque[i] * i * RPMStep / 7000);
						}
					}

					public update(throttle : number, clutch : number) : number {
						var torq,
							additionRPM = 0,
							RPMIndex = this._RPM / this._RPMStep | 0,
							range = RPMIndex < this._torque.length - 1 ?
								this._torque[RPMIndex + 1] - this._torque[RPMIndex] : 0,
							calculatedTorque;

						if (range !== 0) {
							calculatedTorque = (this._RPM % this._RPMStep) / this._RPMStep * range + this._torque[RPMIndex];
						}
						else {
							calculatedTorque = this._torque[RPMIndex];
						}

						if (this._RPM < this._idleRPM) {
							if (throttle + this._throttleSaver < 0.3) {
								this._throttleSaver += Engine._throttleSaverStep;
							}
						}
						else {
							if (this._throttleSaver > 0) {
								this._throttleSaver -= Engine._throttleSaverStep;
							}
						}

						throttle += this._throttleSaver;

						torq = calculatedTorque * throttle;
						additionRPM += torq;
						additionRPM -= this._backTorque * clutch;
						this._RPM += additionRPM;
						this._RPM *= Engine._inertia;

						document.getElementById('rpm').innerHTML = this._RPM | 0;
						document.getElementById('torque').innerHTML = torq | 0 ;
						document.getElementById('throttle').innerHTML = (throttle * 10 | 0) / 10;
					}
				}
			}
		}
	}
}