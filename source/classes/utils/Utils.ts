import RequestManager from "./RequestManager";
export const requestManager = new RequestManager();

declare const window: {
    [key: string]: any; // missing index definition
    prototype: Window;
    new(): Window;
    requestAnimationFrame(callback: FrameRequestCallback): number;
    cancelAnimationFrame(handle: number): void;
};

//export function requestFile(url : string, callback : Callback) {
//	var request = new XMLHttpRequest();
//
//	request.open('get', url, true);
//	request.onreadystatechange = this.bind(this.requestResult, this, request, url, callback);
//	request.send(null);
//}
//
//export function requestResult(event : Event,
//															request : XMLHttpRequest,
//															url : string,
//															callback : Callback) {
//	// If the request is "DONE" (completed or failed)
//	if (request.readyState === 4) {
//		// If we got HTTP status 200 (OK)
//		if (request.status !== 200) {
//			console.log('Can\'t download file: ' + url);
//			//callback.apply('');
//			// TODO : remove hack and create request manager
//			this.requestFile(url, callback);
//		}
//		else {
//			callback.apply(request.responseText);
//		}
//	}
//}

export function getFileNameFromPath(path: string) {
    let nodes = path.split(/[/\\]/g);
    return nodes[nodes.length - 1];
}

(function () {
    let lastTime = 0;
    const vendors = ['ms', 'moz', 'webkit', 'o'];
    for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
        || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    window.requestAnimationFrame = window.requestAnimationFrame ||
        function (callback: FrameRequestCallback) {
            const currTime = new Date().getTime();
            const timeToCall = Math.max(0, 16 - (currTime - lastTime));
            lastTime = currTime + timeToCall;

            return setTimeout(callback.bind(this, lastTime), timeToCall);
        };

    window.cancelAnimationFrame = window.cancelAnimationFrame ||
        function (id) {
            clearTimeout(id);
        };
}());