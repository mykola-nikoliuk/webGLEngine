import Timer from "./Timer";
import Callback from "./Callback";
import Request from "./Request";

export default class RequestManager {

    private _requestQueue: Request[];
    private _queueTimer: Timer;
    private _queueCallback: Callback;
    private static _requestDelay = 10;

    constructor() {
        this._requestQueue = [];
        this._queueTimer = new Timer();
        this._queueCallback = new Callback(this._nextRequest, this);
    }

    public request(url: string, callback: Callback): void {
        this._requestQueue.push(new Request(url, callback));
        if (!this._queueTimer.isTimerEnabled()) {
            this._queueTimer.start(this._queueCallback, RequestManager._requestDelay);
        }
    }

    private _nextRequest(): void {
        if (this._requestQueue.length > 0) {
            this._requestQueue.shift().request();
        }
        else {
            this._queueTimer.stop();
        }
    }
}