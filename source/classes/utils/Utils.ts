///<reference path="Callback.ts"/>
///<reference path="glMatrix.ts"/>
///<reference path="Timer.ts"/>
///<reference path="Console.ts"/>

module webGLEngine {

	export module Utils {

		export function bind(callBackFunc : Function, thisArg, ...arg) {
			var args = Array.prototype.slice.call(arguments, 2);
			return function () {
				var argv = Array.prototype.slice.call(arguments, 0);
				return callBackFunc.apply(thisArg, argv.concat(args));
			};
		}

		export function requestFile(url : string, callback : Callback) {
			var request = new XMLHttpRequest();

			request.open('get', url, true);
			request.onreadystatechange = this.bind(this.requestResult, this, request, url, callback);
			request.send(null);
		}

		export function requestResult(event : Event,
																	request : XMLHttpRequest,
																	url : string,
																	callback : Callback) {
			// If the request is "DONE" (completed or failed)
			if (request.readyState === 4) {
				// If we got HTTP status 200 (OK)
				if (request.status !== 200) {
					console.log('Can\'t download file: ' + url);
					callback.apply('');
				}
				else {
					callback.apply(request.responseText);
				}
			}
		}

		export function getFileNameFromPath(path : string) {
			var nodes = path.split(/\\|\//g);
			return nodes[nodes.length - 1];
		}
	}
}