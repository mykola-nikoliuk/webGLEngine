import RequestManager from "./RequestManager";

export const requestManager = new RequestManager();

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
    let nodes = path.split(/\\|\//g);
    return nodes[nodes.length - 1];
}

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = <(callback: FrameRequestCallback) => number>(window[vendors[x] + 'RequestAnimationFrame']);
        window.cancelAnimationFrame = <(handle: number) => void>(window[vendors[x] + 'CancelAnimationFrame']
        || window[vendors[x] + 'CancelRequestAnimationFrame']);
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = <(callback: FrameRequestCallback) => number>function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());