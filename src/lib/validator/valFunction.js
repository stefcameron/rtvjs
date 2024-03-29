////// valFunction validator

import { type, check as isFunction } from '../validation/isFunction';

import { qualifiers, valuePermitted } from '../qualifiers';
import { RtvSuccess } from '../RtvSuccess';
import { RtvError } from '../RtvError';

const { REQUIRED } = qualifiers;
let impl; // @type {rtvref.impl}

/**
 * Validator Module: valFunction
 * @typedef {Module} rtvref.validator.valFunction
 */

/**
 * Type: {@link rtvref.types.FUNCTION FUNCTION}
 * @const {string} rtvref.validator.valFunction.type
 */
export { type };

/**
 * {@link rtvref.validator.validator_config Configuration Function}
 * @function rtvref.validator.valFunction.config
 * @param {rtvref.validator.validator_config_settings} settings Configuration settings.
 */
export const config = function (settings) {
  impl = settings.impl;
};

/**
 * {@link rtvref.validator.type_validator Validator} for the
 *  {@link rtvref.types.FUNCTION FUNCTION} type.
 * @function rtvref.validator.valFunction.validate
 * @param {*} v Value to validate.
 * @param {string} [q] Validation qualifier. Defaults to
 *  {@link rtvref.qualifiers.REQUIRED REQUIRED}.
 * @returns {(rtvref.RtvSuccess|rtvref.RtvError)} An `RtvSuccess` if valid; `RtvError` if not.
 */
export const validate = function valFunction(v, q = REQUIRED) {
  if (valuePermitted(v, q)) {
    return new RtvSuccess({ mvv: v });
  }

  if (isFunction(v)) {
    return new RtvSuccess({ mvv: v });
  }

  return new RtvError(
    v,
    impl.toTypeset(type, q),
    [],
    impl.toTypeset(type, q, true)
  );
};
