////// valFloat validator

import { type, check as isFloat } from '../validation/isFloat';

import { check as isArray } from '../validation/isArray';

import { qualifiers, valuePermitted } from '../qualifiers';
import { RtvSuccess } from '../RtvSuccess';
import { RtvError } from '../RtvError';

/**
 * Validator Module: valFloat
 * @typedef {Module} rtvref.validator.valFloat
 */

const { REQUIRED } = qualifiers;
let impl; // @type {rtvref.impl}

/**
 * [Internal] __FOR UNIT TESTING ONLY:__ The {@link rtvref.impl} instance
 *  configured on this validator.
 * @private
 * @name rtvref.validator.valFloat._impl
 * @type {rtvref.impl}
 */
export { impl as _impl };

/**
 * Type: {@link rtvref.types.FLOAT FLOAT}
 * @const {string} rtvref.validator.valFloat.type
 */
export { type };

/**
 * {@link rtvref.validator.validator_config Configuration Function}
 * @function rtvref.validator.valFloat.config
 * @param {rtvref.validator.validator_config_settings} settings Configuration settings.
 */
export const config = function (settings) {
  impl = settings.impl;
};

/**
 * {@link rtvref.validator.type_validator Validator} for the
 *  {@link rtvref.types.FLOAT FLOAT} type.
 *
 * Determines if a value is a number literal __only__ (i.e. a
 *  {@link rtvref.types.primitives primitive}). It does not validate
 *  `new Number(1.5)`, which is an object that is a number.
 *
 * @function rtvref.validator.valFloat.validate
 * @param {*} v Value to validate.
 * @param {string} [q] Validation qualifier. Defaults to
 *  {@link rtvref.qualifiers.REQUIRED REQUIRED}.
 * @param {rtvref.types.numeric_args} [args] Type arguments.
 * @returns {(rtvref.RtvSuccess|rtvref.RtvError)} An `RtvSuccess` if valid; `RtvError` if not.
 */
export const validate = function valFloat(v, q = REQUIRED, args) {
  if (valuePermitted(v, q)) {
    return new RtvSuccess({ mvv: v });
  }

  let valid = isFloat(v);

  if (valid && args) {
    // then check args against normal type range
    if (isFloat(args.oneOf) || (isArray(args.oneOf) && args.oneOf.length > 0)) {
      const possibilities = [].concat(args.oneOf);
      // flip the result so that valid is set to false if no values match
      valid = !possibilities.every(function (possibility) {
        // return false on first match to break the loop
        return !(isFloat(possibility) && v === possibility);
      });
    } else {
      let min;
      if (valid && isFloat(args.min)) {
        min = args.min;
        valid = v >= min;
      }

      if (valid && isFloat(args.max)) {
        if (min === undefined || args.max >= min) {
          valid = v <= args.max;
        } // else, ignore
      }
    }
  }

  if (valid) {
    return new RtvSuccess({ mvv: v });
  }

  return new RtvError(
    v,
    impl.toTypeset(type, q, args),
    [],
    impl.toTypeset(type, q, args, true)
  );
};
