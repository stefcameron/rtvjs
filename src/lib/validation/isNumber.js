////// isNumber validation

import { default as _isNaN } from 'lodash-es/isNaN.js';

import { types } from '../types';

/**
 * Validation Module: isNumber
 * @typedef {Module} rtvref.validation.isNumber
 */

/**
 * Type: {@link rtvref.types.NUMBER NUMBER}
 * @const {string} rtvref.validation.isNumber.type
 */
export const type = types.NUMBER;

/**
 * {@link rtvref.validation.method Validation} for the
 *  {@link rtvref.types.NUMBER NUMBER} type.
 *
 * Determines if a value is a number literal __only__ (i.e. a
 *  {@link rtvref.types.primitives primitive}). It does not validate
 *  `new Number(1)`, which is an object that is a number, neither does it
 *  validate `NaN`.
 *
 * @function rtvref.validation.isNumber.check
 * @param {*} v Value to validate.
 * @returns {boolean} `true` if validated; `false` otherwise.
 */
export const check = function isNumber(v) {
  return typeof v === 'number' && !_isNaN(v); // allows +/-Infinity
};
