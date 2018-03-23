//// Main entry point \\\\

import isString from 'lodash/isString';
import {version as VERSION} from '../package.json';
import * as allTypes from './lib/types';
import * as allQualifiers from './lib/qualiiers';
import Enumeration from './lib/Enumeration';

/**
 * <h1>RTV.js Reference</h1>
 *
 * Members herein are _indirectly_ exposed through the {@link rtv} object.
 * @namespace rtvref
 */

/**
 * <h2>Shape Descriptor</h2>
 *
 * Describes the shape (i.e. interface) of an object as a map of properties to
 *  {@link rtvref.types.typeset typesets}. Each typeset indicates whether the
 *  property is required, expected, or optional, using {@link rtvref.qualifiers qualifiers},
 *  along with possible types.
 *
 * When a value is {@link rtv.check checked} or {@link rtv.verify verified} against
 *  a given shape, properties that are not part of the shape are ignored. If
 *  successfully checked/verified, the value is guaranteed to provide the properties
 *  described in the shape, and each property is guaranteed to be assigned to a
 *  value of at least one type described in each property's typeset.
 *
 * @typedef {Object} rtvref.shape_descriptor
 */

const types = new Enumeration(allTypes);
const qualifiers = new Enumeration(allQualifiers);

/**
 * <h1>RTV.js</h1>
 *
 * Runtime Verification Library for browsers and Node.js.
 * @namespace rtv
 */
const rtv = {
  /**
   * Enumeration of {@link rtvref.types types}.
   * @name rtv.t
   * @type {rtvref.Enumeration}
   */
  t: types,

  /**
   * Enumeration of {@link rtvref.qualifiers qualifiers}.
   * @name rtv.q
   * @type {rtvref.Enumeration}
   */
  q: qualifiers,

  /**
   * Checks a value against a shape for compliance.
   * @function rtv.check
   * @param {*} value Value to check.
   * @param {rtvref.types.typeset} shape Expected shape of the value.
   * @returns {Boolean} `true` if the `value` is compliant to the `shape`; `false`
   *  otherwise. An exception is __not__ thrown if the `value` is non-compliant.
   * @see rtv.verify
   */
  check(value, shape) {
    // TODO: testing 'check'
    return isString(value) && !!value;
  },

  /**
   * __Requires__ a value to be compliant to a shape.
   * @function rtv.verify
   * @param {*} value Value to check.
   * @param {rtvref.types.typeset} shape Expected shape of the value.
   * @returns {Boolean} `true` if the `value` is compliant to the `shape`; otherwise,
   *  an exception is thrown.
   * @throws {Error} If the `value` is not compliant to the `shape`.
   * @see rtv.verify
   */
  verify(value, shape) {
    // TODO: testing 'verify'
    if (this.config.enabled) {
      if (!this.check(value, shape)) {
        throw new Error('value must be a ' + types.STRING + ': ' + value);
      }
    }
  },

  /**
   * RTV Library Configuration
   * @name rtv.config
   * @type {rtv.config_properties}
   */
  config: Object.defineProperties({}, {

    /**
     * Configuration Properties
     * @typedef {Object} rtv.config_properties
     * @property {Boolean} enabled // TODO[docs]
     */

    enabled: (function() {
      let value = true;
      return {
        enumerable: true,
        configurable: true,
        get() {
          return value;
        },
        set(newValue) {
          rtv.verify(newValue, types.BOOLEAN);
          value = newValue;
        }
      };
    })()
  }),

  /**
   * Contextual RTV Generator // TODO[docs]
   * @function rtv.Context
   * @param {String} context
   */
  Context(context) {
    // TODO: a version with same API (less 'config') that will include 'context' in errors thrown
  }
};

/**
 * [internal] Library version.
 * @name rtv._version
 * @type {String}
 */
Object.defineProperty(rtv, '_version', {
  enumerable: false, // internal
  configurable: true,
  value: VERSION
});

export default rtv;
