module WebGLEngine.Utils {

	export class Console {

		private _consoleView : HTMLDivElement;
		private _isCreated : boolean;
		private _freeLinesLeft : number;
		private _maxHeight : number;
		private static _colors = {
			ERROR  : 'red',
			WARNING: 'orange',
			INFO   : 'white'
		};
		private static _config = {
			zIndex        : 9999,
			consolePadding: 8,
			consoleColor  : 'rgba(0, 0, 0, 0.6)',
			lineMargin    : 4,
			linePadding   : 4,
			lineColor     : 'rgba(32, 32, 32, 0.5)',
			lineIndent    : 16,
			fontSize      : 14
		};

		constructor() {
			this._isCreated = false;
		}

		/** creates console and show on screen */
		public create(x : number, y : number, maxWidth : number, maxHeight : number, maxLines : number) : void {
			if (!this._isCreated) {
				this._isCreated = true;
				this._freeLinesLeft = maxLines;
				this._createView.apply(this, arguments);
				this.log('console created');
			}
		}

		public log(msg : string) : void {
			if (this._isCreated) {
				this._addLine(msg, Console._colors.INFO);
			}
		}

		public warning(msg : string) : void {
			if (this._isCreated) {
				this._addLine(msg, Console._colors.WARNING);
			}
		}

		public error(msg : string) : void {
			if (this._isCreated) {
				this._addLine(msg, Console._colors.ERROR);
			}
		}

		/** creates console view */
		private _createView(x : number, y : number, maxWidth : number, maxHeight : number) : void {
			var consoleDiv = document.createElement('div');
			this._maxHeight = typeof maxHeight === 'number' ? maxHeight : 100000;
			this._consoleView = consoleDiv;
			consoleDiv.style.position = 'fixed';
			consoleDiv.style.overflowX = 'hidden';
			consoleDiv.style.overflowY = 'scroll';
			consoleDiv.style.left = x + 'px';
			consoleDiv.style.top = y + 'px';
			consoleDiv.style.maxWidth = maxWidth + 'px';
			consoleDiv.style.maxHeight = maxHeight + 'px';
			consoleDiv.style.padding = Console._config.consolePadding + 'px 0';
			consoleDiv.style.zIndex = Console._config.zIndex + '';
			consoleDiv.style.backgroundColor = Console._config.consoleColor;
			document.body.appendChild(consoleDiv);
		}

		/** adds line to log */
		private _addLine(msg : string, color : string) : void {
			var lineDiv = document.createElement('div');
			lineDiv.style.color = color;
			lineDiv.style.fontSize = Console._config.fontSize + 'px';
			lineDiv.style.margin = Console._config.lineMargin + 'px';
			lineDiv.style.marginLeft = Console._config.lineMargin +
				(Console._config.lineIndent * (msg.split('\t').length - 1)) +
				'px';
			lineDiv.style.padding = Console._config.linePadding + 'px';
			lineDiv.style.backgroundColor = Console._config.lineColor;
			lineDiv.innerText = msg;
			this._consoleView.appendChild(lineDiv);
			this._consoleView.scrollTop = this._maxHeight;

			if (this._freeLinesLeft - 1 < 0) {
				this._consoleView.removeChild(this._consoleView.firstChild);
			}
			else {
				this._freeLinesLeft--;
			}
		}
	}
}