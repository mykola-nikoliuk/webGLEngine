module Example {

	export interface VehicleConfiguration {
		size : WebGLEngine.Types.Vector3;
		maxControlWheelAngle: number;
		wheelAngleCoefficientPerStep: number;
		bridges : {
			position : WebGLEngine.Types.Vector3;
			wheel : string;
			width : number;
			drive : boolean;
			control : boolean;
		}[];
	}
}