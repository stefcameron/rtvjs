////// isAny validator

import types from '../types';

/**
 * Type: {@link rtvref.types.ANY ANY}
 * @const {string} rtvref.validator.isAny.type
 */
export const type = types.ANY;

/**
 * {@link rtvref.validator.validator_config Configuration Function}
 * @function rtvref.validator.isAny.config
 * @param {rtvref.validator.validator_config_settings} settings Configuration settings.
 */
export const config = function(settings) {
};

/**
 * {@link rtvref.validator.type_validator Validator} for the
 *  {@link rtvref.types.ANY ANY} type.
 * @function rtvref.validator.isAny
 * @param {*} v Value to validate.
 * @returns {boolean} `true` if validated; `false` otherwise.
 */
export default function isAny(v) {
  return true; // anything goes, even undefined and null
}