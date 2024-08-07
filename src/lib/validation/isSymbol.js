////// isSymbol validation

import { default as _isSymbol } from 'lodash-es/isSymbol.js';

import { types } from '../types';

/**
 * Validation Module: isSymbol
 * @typedef {Module} rtvref.validation.isSymbol
 */

/**
 * Type: {@link rtvref.types.SYMBOL SYMBOL}
 * @const {string} rtvref.validation.isSymbol.type
 */
export const type = types.SYMBOL;

/**
 * {@link rtvref.validation.method Validation} for the
 *  {@link rtvref.types.SYMBOL SYMBOL} type.
 * @function rtvref.validation.isSymbol.check
 * @param {*} v Value to validate.
 * @returns {boolean} `true` if validated; `false` otherwise.
 */
export const check = function isSymbol(v) {
  return _isSymbol(v);
};
