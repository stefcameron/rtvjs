////// isDate validation

import { default as _isDate } from 'lodash-es/isDate.js';

import { types } from '../types';

/**
 * Validation Module: isDate
 * @typedef {Module} rtvref.validation.isDate
 */

/**
 * Type: {@link rtvref.types.DATE DATE}
 * @const {string} rtvref.validation.isDate.type
 */
export const type = types.DATE;

/**
 * {@link rtvref.validation.method Validation} for the
 *  {@link rtvref.types.DATE DATE} type.
 * @function rtvref.validation.isDate.check
 * @param {*} v Value to validate.
 * @returns {boolean} `true` if validated; `false` otherwise.
 */
export const check = function isDate(v) {
  return _isDate(v);
};
