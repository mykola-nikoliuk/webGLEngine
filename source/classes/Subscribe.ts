import Callback from "./utils/Callback";

export default class Subscribe {

    protected _subscribers: Callback[];

    constructor() {
        this._subscribers = [];
    }

    /** Add subscriber
     * @param callback
     * @return is callback Was added
     */
    public subscribe(callback: Callback): boolean {
        if (this._subscribers.indexOf(callback) < 0) {
            this._subscribers.push(callback);
            return true;
        }
        return false;
    }

    /** Removes subscriber
     * @param callback
     * @return is callback Was deleted
     */
    public unsubscribe(callback: Callback): boolean {
        var index: number;
        if ((index = this._subscribers.indexOf(callback)) > 0) {
            this._subscribers.splice(index, 1);
            return true;
        }
        return false;
    }

}