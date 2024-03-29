////// valSet validator

import { type, check as isSet } from '../validation/isSet';

import { check as isFinite } from '../validation/isFinite';
import { check as isTypeset } from '../validation/isTypeset';

import { qualifiers, valuePermitted } from '../qualifiers';
import { RtvSuccess } from '../RtvSuccess';
import { RtvError } from '../RtvError';
import { print } from '../util';

/**
 * Validator Module: valSet
 * @typedef {Module} rtvref.validator.valSet
 */

const { REQUIRED } = qualifiers;
let impl; // @type {rtvref.impl}

/**
 * [Internal] __FOR UNIT TESTING ONLY:__ The {@link rtvref.impl} instance
 *  configured on this validator.
 * @private
 * @name rtvref.validator.valSet._impl
 * @type {rtvref.impl}
 */
export { impl as _impl };

/**
 * Type: {@link rtvref.types.SET SET}
 * @const {string} rtvref.validator.valSet.type
 */
export { type };

/**
 * {@link rtvref.validator.validator_config Configuration Function}
 * @function rtvref.validator.valSet.config
 * @param {rtvref.validator.validator_config_settings} settings Configuration settings.
 */
export const config = function (settings) {
  impl = settings.impl;
};

/**
 * {@link rtvref.validator.type_validator Validator} for the
 *  {@link rtvref.types.SET SET} type.
 * @function rtvref.validator.valSet.validate
 * @param {*} v Value to validate.
 * @param {string} [q] Validation qualifier. Defaults to
 *  {@link rtvref.qualifiers.REQUIRED REQUIRED}.
 * @param {rtvref.types.collection_args} [args] Type arguments.
 * @param {rtvref.validator.type_validator_context} [context] Validation context.
 * @returns {(rtvref.RtvSuccess|rtvref.RtvError)} An `RtvSuccess` if valid; `RtvError` if not.
 */
export const validate = function valSet(v, q = REQUIRED, args, context) {
  if (valuePermitted(v, q)) {
    return new RtvSuccess({ mvv: v }); // `v` is a falsy value which is the MVV also
  }

  const mvv = new Set();
  let valid = isSet(v);
  let result; // @type {(rtvref.RtvSuccess|rtvref.RtvError)}

  if (valid && args) {
    // then check args
    // start with the easiest/most efficient test: length
    if (valid && isFinite(args.length) && args.length >= 0) {
      valid = v.size === args.length;
    }

    // remaining args, if specified, require iterating potentially the entire set
    if (valid) {
      // get the typeset for values
      const tsValues = isTypeset(args.$values) ? args.$values : undefined;

      if (tsValues) {
        const it = v.values(); // iterator of straight values

        for (const elem of it) {
          // check VALUE against typeset
          result = impl.check(elem, tsValues, {
            originalValue: v, // let this get overwritten if `context` is specified
            ...context,
            parent: v,
            parentKey: undefined, // Sets don't have keys
          });
          valid = result.valid;

          if (result.valid) {
            mvv.add(result.mvv); // use downstream MVV from check, not positional value
          } else {
            // create a new error from the original, but with the value prepended to
            //  the path (since sets don't have indexes; they just have unique values)
            result = new RtvError(
              v,
              impl.toTypeset(type, q, args),
              [print(elem)].concat(result.path),
              result.mismatch,
              result.rootCause
            );
          }

          if (!valid) {
            // break on first invalid value
            break;
          }
        }
      }
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
    // `result` will be the RtvSuccess from the last element checked; create a new one
    //  with the appropriate MVV interpreted from what the validator checked as a whole
    result = new RtvSuccess({ mvv });
  }

  return result;
};
