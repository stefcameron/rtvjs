////// isWeakSet validation

import { default as _isWeakSet } from 'lodash-es/isWeakSet.js';

import { types } from '../types';

/**
 * Validation Module: isWeakSet
 * @typedef {Module} rtvref.validation.isWeakSet
 */

/**
 * Type: {@link rtvref.types.WEAK_SET WEAK_SET}
 * @const {string} rtvref.validation.isWeakSet.type
 */
export const type = types.WEAK_SET;

/**
 * {@link rtvref.validation.method Validation} for the
 *  {@link rtvref.types.WEAK_SET WEAK_SET} type.
 * @function rtvref.validation.isWeakSet.check
 * @param {*} v Value to validate.
 * @returns {boolean} `true` if validated; `false` otherwise.
 */
export const check = function isWeakSet(v) {
  return _isWeakSet(v);
};
