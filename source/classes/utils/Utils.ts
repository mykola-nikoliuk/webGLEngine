///<reference path="Callback.ts"/>
///<reference path="glMatrix.ts"/>
///<reference path="Timer.ts"/>
///<reference path="Console.ts"/>
///<reference path="RequestManager.ts"/>

module WebGLEngine.Utils {

	export var requestManager = new RequestManager();

	export function bind(callBackFunc : Function, thisArg, ...arg) {
		var args = Array.prototype.slice.call(arguments, 2);
		return function () {
			var argv = Array.prototype.slice.call(arguments, 0);
			return callBackFunc.apply(thisArg, argv.concat(args));
		};
	}

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

	export function getFileNameFromPath(path : string) {
		var nodes = path.split(/\\|\//g);
		return nodes[nodes.length - 1];
	}
}

(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = <Function>(window[vendors[x]+'RequestAnimationFrame']);
		window.cancelAnimationFrame = <Function>(window[vendors[x]+'CancelAnimationFrame']
			|| window[vendors[x]+'CancelRequestAnimationFrame']);
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = <Function>function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); },
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());