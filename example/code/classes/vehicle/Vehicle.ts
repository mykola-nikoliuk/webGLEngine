module Example {

	export class Vehicle extends WebGLEngine.Types.LinkedTransformations {

		private _frontAxles : VehicleAxle[];
		private _rearAxles : VehicleAxle[];
		private _frontFarthestAxle : VehicleAxle;
		private _rearFarthestAxle : VehicleAxle;
		private _frontControlPoint : WebGLEngine.Types.Vector3;
		private _rearControlPoint : WebGLEngine.Types.Vector3;

		private _maxControlWheelAngle : number;
		private _wheelAngleCoefficient : number;
		private _wheelAngleCoefficientPerStep : number;

		//private _configuration : VehicleConfiguration;

		constructor(configuration : VehicleConfiguration) {
			var i : number,
				axle : VehicleAxle,
				wheel : WebGLEngine.Types.Mesh,
				currentDistance : number,
				newDistance : number,
				axleConfig;

			super();

			//this._configuration = configuration;

			this._wheelAngleCoefficient = 0;
			this._wheelAngleCoefficientPerStep = configuration.wheelAngleCoefficientPerStep;
			this._maxControlWheelAngle = configuration.maxControlWheelAngle;

			this._frontAxles = [];
			this._rearAxles = [];
			this._frontFarthestAxle = null;
			this._rearFarthestAxle = null;
			this._frontControlPoint = new WebGLEngine.Types.Vector3(0, 0, 0);
			this._rearControlPoint = new WebGLEngine.Types.Vector3(0, 0, 0);
			for (i = 0; i < configuration.bridges.length; i++) {
				axleConfig = configuration.bridges[i];
				wheel = meshManager.get(axleConfig.wheel);

				axle = new VehicleAxle(axleConfig.position, axleConfig.width, wheel);
				axle.drive = axleConfig.drive;
				axle.control = axleConfig.control;
				axle.leftWheel.setParent(this);
				axle.rightWheel.setParent(this);

				if (axleConfig.position.z < 0) {
					this._frontControlPoint.plus(axleConfig.position);
					this._frontAxles.push(axle);
				}
				else {
					this._rearControlPoint.plus(axleConfig.position);
					this._rearAxles.push(axle);
				}
			}
			this._frontControlPoint.divide(this._frontAxles.length);
			this._rearControlPoint.divide(this._rearAxles.length);

			this._calculateAxleControlCoefficients();
		}

		public draw(engine : WebGLEngine.Engine) : void {
			var i : number,
				bridge : VehicleAxle;

			for (i = 0; i < this._frontAxles.length + this._rearAxles.length; i++) {
				bridge = i < this._frontAxles.length ? this._frontAxles[i] : this._rearAxles[i - this._frontAxles.length];

				// TODO : remove animation
				bridge.leftWheel.rotation.x -= 0.02;
				bridge.rightWheel.rotation.x += 0.02;

				engine.draw(bridge.leftWheel);
				engine.draw(bridge.rightWheel);
			}
		}

		public turnLeft() : void {
			this._wheelAngleCoefficient += this._wheelAngleCoefficientPerStep;
			if (this._wheelAngleCoefficient > 1) {
				this._wheelAngleCoefficient = 1;
			}
			this._setWheelAngle(this._wheelAngleCoefficient);
		}

		public turnRight() : void {
			this._wheelAngleCoefficient -= this._wheelAngleCoefficientPerStep;
			if (this._wheelAngleCoefficient < -1) {
				this._wheelAngleCoefficient = -1;
			}
			this._setWheelAngle(this._wheelAngleCoefficient);
		}

		private _setWheelAngle(coefficient : number) : void {
			var i : number,
				angle : number,
				axle : VehicleAxle;

			if (coefficient < -1 || coefficient > 1) {
				WebGLEngine.Console.warning('Vehicle._setWheelAngle() coefficient is out of range.\n' +
					'Should be from -1 to 1');
			}
			else {
				for (i = 0; i < this._frontAxles.length; i++) {
					axle = this._frontAxles[i];
					if (axle.control) {
						angle = this._maxControlWheelAngle * axle.controlCoefficient * coefficient;
						axle.leftWheel.rotation.y = angle;
						axle.rightWheel.rotation.y = angle + Math.PI;
					}
				}
				for (i = 0; i < this._rearAxles.length; i++) {
					axle = this._rearAxles[i];
					if (axle.control) {
						angle = this._maxControlWheelAngle * axle.controlCoefficient * coefficient;
						axle.leftWheel.rotation.y = -angle;
						axle.rightWheel.rotation.y = -angle + Math.PI;
					}
				}
			}
		}

		private _calculateAxleControlCoefficients() : void {
			var i : number,
				maxFrontDistance = 0,
				maxRearDistance = 0,
				frontDistances = [],
				rearDistances = [],
				currentDistance : number,
				axle : VehicleAxle;

			// search for max front distance
			for (i = 0; i < this._frontAxles.length; i++) {
				axle = this._frontAxles[i];
				currentDistance = axle.position.getDistanceTo(this.position);
				frontDistances.push(currentDistance);
				if (currentDistance > maxFrontDistance) {
					maxFrontDistance = currentDistance;
				}
			}

			// search for max rear distance
			for (i = 0; i < this._rearAxles.length; i++) {
				axle = this._rearAxles[i];
				currentDistance = axle.position.getDistanceTo(this.position);
				rearDistances.push(currentDistance);
				if (currentDistance > maxRearDistance) {
					maxRearDistance = currentDistance;
				}
			}

			// set front coefficients
			for (i = 0; i < this._frontAxles.length; i++) {
				axle = this._frontAxles[i];
				axle.controlCoefficient = frontDistances[i] / maxFrontDistance;
			}

			// set rear coefficients
			for (i = 0; i < this._rearAxles.length; i++) {
				axle = this._rearAxles[i];
				axle.controlCoefficient = rearDistances[i] / maxRearDistance;
			}
		}
	}
}