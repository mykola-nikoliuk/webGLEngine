module WebGLEngine.Types {

	export class Pool<T> {

		private _pool : T[];

		constructor() {
			this._pool = [];
		}

		/** Returns pool size */
		public size() : number {
			return this._pool.length;
		}

		/** Returns pool element */
		public get(index : number) : T {
			if (typeof index === 'number') {
				if (index >= 0 && index < this._pool.length) {
					return this._pool[index];
				}
				else {
					Console.error('Pool:get() : index is out of range');
				}
			}
			else {
				Console.error('Pool:get() : parameter should be number');
			}
			return null;
		}

		/** Add element to pool
		 * Returns true if element was added, otherwise false */
		public add(element : T) : boolean {
			if (this._pool.indexOf(element) < 0) {
				this._pool.push(element);
				return true;
			}
			else {
				Console.warning('Pool.add() : element already added. To add element you should remove it first\n' +
					'Please note, constructor() may adding himself to this pool when element created');
			}
			return false;
		}

		/** Removes element from general pool
		 * Returns true if element was removed, otherwise false */
		public remove(element : T) : boolean {
			var index : number;

			if ((index = this._pool.indexOf(element)) >= 0) {
				this._pool.splice(index, 1);
				return true;
			}
			else {
				Console.warning('Pool.remove() : Element not found');
			}
			return false;
		}
	}
}