////// isAny validation

import { types } from '../types';

/**
 * Validation Module: isAny
 * @typedef {Module} rtvref.validation.isAny
 */

/**
 * Type: {@link rtvref.types.ANY ANY}
 * @const {string} rtvref.validation.isAny.type
 */
export const type = types.ANY;

/**
 * {@link rtvref.validation.method Validation} for the
 *  {@link rtvref.types.ANY ANY} type.
 * @function rtvref.validation.isAny.check
 * @param {*} v Value to validate.
 * @returns {boolean} `true` if validated; `false` otherwise.
 */
export const check = function isAny(v) {
  return true; // anything goes, even undefined and null
};
