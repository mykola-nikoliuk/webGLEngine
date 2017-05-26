export default class Callback {

    private _func: Function;
    private _thisArg: Object;
    private _args: any[];

    constructor(func: Function = function () {
    }, thisArg: Object = {}, ...args: any[]) {
        this._func = func;
        this._thisArg = thisArg;
        this._args = args;
    }

    public apply(...args: any[]): any {
        return this._func.apply(this._thisArg, args.concat(this._args));
    }
}