import Callback from "./Callback";

export default class Request {

    private _url: string;
    private _request: XMLHttpRequest;
    private _callback: Callback;
    private _retryCount: number;

    private static _retryAmount = 3;

    constructor(url: string, callback: Callback) {
        this._url = url;
        this._request = new XMLHttpRequest();
        this._callback = callback;
        this._retryCount = 0;
        this._request.open('get', this._url, true);
        this._request.onreadystatechange = this._requestResult.bind(this);
    }

    public request() {
        this._send();
    }

    private _send(): void {
        if (++this._retryCount > Request._retryAmount) {
            console.error('Can\'t download file: ' + this._url);
            this._callback.apply(null, this._url);
        }
        else {
            this._request.open('get', this._url, true);
            this._request.send(null);
        }
    }

    private _requestResult() {
        // If the request is "DONE" (completed or failed)
        if (this._request.readyState === 4) {
            // If we got HTTP status 200 (OK)
            if (this._request.status !== 200) {
                this._send();
            }
            else {
                this._callback.apply(this._request.responseText, this._url);
            }
        }
    }

}