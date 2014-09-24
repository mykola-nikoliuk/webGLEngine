/* Simple JavaScript Inheritance by John Resig http://ejohn.org/ MIT Licensed. Inspired by base2 and Prototype */
/* description: http://blog.buymeasoda.com/understanding-john-resigs-simple-javascript-i/ */

/**
 * @version 0.1
 * - original John Resig inheritance
 */

	var initializing = false, fnTest = /xyz/.test((function () { return 'xyz'; }) + '') ? /\b_super\b/ : /.*/;

	/**
	 *  The base Class implementation (does nothing)
	 *  @class Class
	 *  @constructor
	 */
	function Class() {}

	/**
	 * Create a new Class that inherits from this class
	 * @public
	 * @param {object} childPrototype properties of Child Class
	 * @returns {Class} new constructed Class
	 */
	Class.extend = function (childPrototype) {
		var prototype, NewClass, name, _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (name in childPrototype) {
			if (childPrototype.hasOwnProperty(name)) {
				// Check if we're overwriting an existing function
				prototype[name] = typeof childPrototype[name] === "function" &&
					typeof _super[name] === "function" && fnTest.test(childPrototype[name]) ?
					(function (name, fn) {
						return function () {

							//noinspection JSUnresolvedVariable
							var ret, tmp = this._super;

							// Add a new ._super() method that is the same method
							// but on the super-class
							this._super = _super[name];

							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							ret = fn.apply(this, arguments);
							this._super = tmp;

							return ret;
						};
					})(name, childPrototype[name]) :
					childPrototype[name];
			}
		}

		// The dummy class constructor
		NewClass = function () {
			if (!initializing && this.init) {
				// All construction is actually done in the init method
				this.init.apply(this, arguments);
			}
		};

		// Populate our constructed prototype object
		NewClass.prototype = prototype;

		// Enforce the constructor to be what we expect
		NewClass.prototype.constructor = NewClass;

		// And make this class extendable
		NewClass.extend = this.extend;//arguments.callee;

		/** @constructs */
		NewClass.init = childPrototype.init || function () {};

		//noinspection JSValidateTypes
		return NewClass;
	};

module.exports = Class;