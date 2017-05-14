import Callback from "./Callback";

export default class Timer {

    private _timerInterval: number;
    private _timerTimeout: number;
    private _timerEnabled: boolean;
    private _callback: Callback;
    private _timeout: number;
    private _pauseTimeout: number;
    private _startTime: number;
    private _isItTimeout: boolean;
    private _isTimeoutMode: boolean;


    constructor() {
        this._timerInterval = null;
        this._timerTimeout = null;
        this._timerEnabled = false;
        this._timeout = 0;
        this._pauseTimeout = 0;
        this._startTime = 0;
        this._isItTimeout = false;
        this._isTimeoutMode = false;
    }

    public start(callback: Callback, timeout: number, callOnce?: boolean): void {
        if (!this._timerInterval) {
            this._callback = callback;

            if (typeof timeout === 'number') {
                this._timeout = timeout;
            }
            else {
                this._timeout = 0;
            }

            this._isItTimeout = typeof callOnce === 'boolean' ? callOnce : false;

            this._createTimer();
            this._timerEnabled = true;
            this._isTimeoutMode = false;
        }
    }

    public pause(): void {
        if (this._timerEnabled && this._timerInterval) {
            if (this._isTimeoutMode)
                clearTimeout(this._timerTimeout);
            else
                clearInterval(this._timerInterval);
            this._isTimeoutMode = true;
            this._timerInterval = null;
            this._pauseTimeout -= Date.now() - this._startTime;
            if (this._pauseTimeout < 0)
                this._pauseTimeout = 0;
        }
    }

    public resume(): void {
        if (this._timerEnabled && !this._timerInterval) {

            var func = function (func, thisArg) {
                return function () {
                    return func.apply(thisArg, arguments);
                };
            }.call(this, this.resumeInterval, this);

            this._startTime = Date.now();
            this._timerInterval = setTimeout(func, this._pauseTimeout);
        }
    }

    public stop(): void {
        if (this._timerEnabled) {
            if (this._timerInterval)
                clearInterval(this._timerInterval);
            this._timerInterval = null;
            this._timerEnabled = false;
        }
    }

    public isTimerEnabled(): boolean {
        return this._timerEnabled;
    }

    private resumeInterval(): void {
        this._isTimeoutMode = false;
        this._createTimer();
    }

    private _createTimer(): void {
        var func = function (func, thisArg) {
            return function () {
                return func.apply(thisArg, arguments);
            };
        }.call(this, this._nativeFunction, this);

        this._startTime = Date.now();
        this._timerInterval = setInterval(func, this._timeout);
    }

    private _nativeFunction() {
        this._callback.apply();
        this._startTime = Date.now();
        if (this._isItTimeout)
            this.stop();
    }
}