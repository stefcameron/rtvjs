////// Utilities

// NOTE: Ideally, this module has no dependencies. If it must, they should be
//  third-party/external dependencies to avoid circular dependencies within
//  this library.

/**
 * <h3>RTV.js Utilities</h3>
 * @namespace rtvref.util
 */

/**
 * Pretty-print a value.
 * @function rtvref.util.print
 * @param {*} printValue Value to print.
 * @param {Object} printOptions Print options.
 * @param {boolean} [printOptions.isTypeset=false] `true` if the value being
 *  printed is a {@link rtvref.types.typeset typeset}; `false` otherwise.
 * @returns {string} Pretty-printed value. It's not perfect and may not catch
 *  all types, but attempts to be good enough.
 */
export const print = function (printValue, printOptions = {}) {
  const { isTypeset = false } = printOptions;

  let stringifying = false;

  // NOTE: key will be undefined when the replacer is called outside of the
  //  JSON.stringify() call, as well as for the first stringify() call
  // NOTE: `this` will be a reference to the object in which the `key` was found
  const replacer = function (key, value) {
    if (value === undefined || value === null) {
      return stringifying ? value : value + '';
    }

    if (typeof value === 'string') {
      return stringifying ? value : `"${value}"`;
    }

    if (typeof value === 'number') {
      // also catches NaN
      return stringifying ? value : `${value}`;
    }

    if (typeof value === 'boolean') {
      return stringifying ? value : `${value}`;
    }

    if (typeof value === 'function') {
      if (isTypeset) {
        if (Array.isArray(this)) {
          return '<validator>';
        }

        if (key === 'ctor') {
          return '<constructor>';
        }
      }

      return '<function>';
    }

    if (typeof value === 'symbol') {
      return value.toString();
    }

    return value; // keep stringifying since we're returning an object
  };

  // first, check to see if we have a simple case that we can immediately
  //  convert to a string without the extra JSON syntax around it
  const result = replacer(undefined, printValue);
  if (typeof result === 'string') {
    return result;
  }

  // since it's not simple, go through the formal stringifying process
  stringifying = true;
  return JSON.stringify(result, replacer); // recursive
};

/**
 * Safely determines if a property is an own-property of an object.
 * @function rtvref.util.hasOwnProp
 * @param {Object} obj Object to check. Can be _falsy_.
 * @param {string} prop Own-property to check.
 * @returns {boolean} `true` if it is; `false` otherwise. Also `false` if `obj`
 *  is _falsy_.
 */
export const hasOwnProp = function (obj, prop) {
  return !!(obj && Object.prototype.hasOwnProperty.call(obj, prop));
};
