module Utils {

	export class Callback {

		private _func : Function;
		private _thisArg : Object;
		private _args : Object;

		constructor(func : Function = function() {}, thisArg : Object = {}, ...args) {
			this._func = func;
			this._thisArg = thisArg;
			this._args = args;
		}

		public apply(...args) : any {
			return this._func.apply(this._thisArg, args.concat(this._args));
		}
	}
}