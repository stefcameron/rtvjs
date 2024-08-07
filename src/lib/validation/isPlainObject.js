////// isPlainObject validation

import { default as _isPlainObject } from 'lodash-es/isPlainObject.js';

import { types } from '../types';

/**
 * Validation Module: isPlainObject
 * @typedef {Module} rtvref.validation.isPlainObject
 */

/**
 * Type: {@link rtvref.types.PLAIN_OBJECT PLAIN_OBJECT}
 * @const {string} rtvref.validation.isPlainObject.type
 */
export const type = types.PLAIN_OBJECT;

/**
 * {@link rtvref.validation.method Validation} for the
 *  {@link rtvref.types.PLAIN_OBJECT PLAIN_OBJECT} type.
 * @function rtvref.validation.isPlainObject.check
 * @param {*} v Value to validate.
 * @returns {boolean} `true` if validated; `false` otherwise.
 */
export const check = function isPlainObject(v) {
  return _isPlainObject(v);
};
