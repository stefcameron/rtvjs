////// valArray validator

import { default as _forEach } from 'lodash-es/forEach.js';

import { type, check as isArray } from '../validation/isArray';

import { check as isFinite } from '../validation/isFinite';
import { check as isTypeset } from '../validation/isTypeset';

import { qualifiers, valuePermitted } from '../qualifiers';
import { RtvSuccess } from '../RtvSuccess';
import { RtvError } from '../RtvError';

/**
 * Validator Module: valArray
 * @typedef {Module} rtvref.validator.valArray
 */

const { REQUIRED } = qualifiers;
let impl; // @type {rtvref.impl}

/**
 * [Internal] __FOR UNIT TESTING ONLY:__ The {@link rtvref.impl} instance
 *  configured on this validator.
 * @private
 * @name rtvref.validator.valArray._impl
 * @type {rtvref.impl}
 */
export { impl as _impl };

/**
 * Type: {@link rtvref.types.ARRAY ARRAY}
 * @const {string} rtvref.validator.valArray.type
 */
export { type };

/**
 * {@link rtvref.validator.validator_config Configuration Function}
 * @function rtvref.validator.valArray.config
 * @param {rtvref.validator.validator_config_settings} settings Configuration settings.
 */
export const config = function (settings) {
  impl = settings.impl;
};

/**
 * {@link rtvref.validator.type_validator Validator} for the
 *  {@link rtvref.types.ARRAY ARRAY} type.
 * @function rtvref.validator.valArray.validate
 * @param {*} v Value to validate.
 * @param {string} [q] Validation qualifier. Defaults to
 *  {@link rtvref.qualifiers.REQUIRED REQUIRED}.
 * @param {rtvref.types.ARRAY_args} [args] Type arguments.
 * @param {rtvref.validator.type_validator_context} [context] Validation context.
 * @returns {(rtvref.RtvSuccess|rtvref.RtvError)} An `RtvSuccess` if valid; `RtvError` if not.
 */
export const validate = function valArray(v, q = REQUIRED, args, context) {
  if (valuePermitted(v, q)) {
    return new RtvSuccess({ mvv: v }); // `v` is a falsy value which is the MVV also
  }

  const mvv = []; // interpreted as plain object
  let valid = isArray(v);
  let result; // @type {(rtvref.RtvSuccess|rtvref.RtvError)}

  if (valid && args) {
    // then check args
    if (isFinite(args.length) && args.length >= 0) {
      valid = v.length === args.length;
    } else {
      let min;
      if (valid && isFinite(args.min) && args.min >= 0) {
        min = args.min;
        valid = v.length >= min;
      }

      if (valid && isFinite(args.max) && args.max >= 0) {
        if (min === undefined || args.max >= min) {
          valid = v.length <= args.max;
        } // else, ignore
      }
    }

    if (valid && isTypeset(args.$)) {
      // check each element in `value` against the typeset
      _forEach(v, function (elem, idx) {
        result = impl.check(elem, args.$, {
          originalValue: v, // let this get overwritten if `context` is specified
          ...context,
          parent: v,
          parentKey: idx,
        });
        valid = result.valid;

        if (result.valid) {
          mvv.push(result.mvv); // use downstream MVV from check, not positional value
        } else {
          // create a new error from the original, but with the index (as a string)
          //  prepended to the path
          result = new RtvError(
            v,
            impl.toTypeset(type, q, args),
            [`${idx}`].concat(result.path),
            result.mismatch,
            result.rootCause
          );
        }

        return valid; // break on first invalid element
      });
    }
  }

  if (!result) {
    if (valid) {
      result = new RtvSuccess({ mvv });
    } else {
      result = new RtvError(
        v,
        impl.toTypeset(type, q, args),
        [],
        impl.toTypeset(type, q, args, true)
      );
    }
  } else if (result.valid) {
    // `result` will be the RtvSuccess from the last positional value checked; create
    //  a new one with the appropriate MVV interpreted from what the validator checked
    //  as a whole
    result = new RtvSuccess({ mvv });
  }

  return result;
};
