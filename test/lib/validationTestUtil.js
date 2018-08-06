////// Utility for testing validation modules

import _ from 'lodash';
import {expect} from 'chai';

import types from '../../src/lib/types';
import qualifiers, {DEFAULT_QUALIFIER} from '../../src/lib/qualifiers';
import * as util from '../../src/lib/util';
import RtvSuccess from '../../src/lib/RtvSuccess';
import RtvError from '../../src/lib/RtvError';

/**
 * Get a fresh copy of the valid values type map, or just one valid value type array.
 * @param {string} [type] The valid value type array to get.
 * @returns {(Object|Array|undefined)} If `type` is specified and a known type,
 *  returns an array of valid values for that type. If `type` is unknown, returns
 *  `undefined`. If `type` is not specified, returns a map of type to array of
 *  valid values for each type.
 */
export const getValidValues = function(type) {
  // map of type to _valid_ values for that type
  const validValues = {
    //
    // primitives
    //

    [types.ANY]: [undefined, null],
    [types.STRING]: ['literal-string'],
    [types.BOOLEAN]: [true, false],
    [types.SYMBOL]: [Symbol(), Symbol('symbol'), Symbol(1), Symbol.for('other')],

    [types.NUMBER]: [-1, -0, 0, 1, Number.MIN_VALUE, Number.MIN_SAFE_INTEGER,
      Number.MAX_VALUE, Number.MAX_SAFE_INTEGER, Number.EPSILON,
      7.7, -7.7, Infinity, -Infinity, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [types.FINITE]: [-1, -0, 0, 1, Number.MIN_VALUE, Number.MIN_SAFE_INTEGER,
      Number.MAX_VALUE, Number.MAX_SAFE_INTEGER, Number.EPSILON, 7.7, -7.7],
    [types.INT]: [-1, -0, 0, 1, Number.MIN_VALUE, Number.MIN_SAFE_INTEGER,
      Number.MAX_VALUE, Number.MAX_SAFE_INTEGER, Number.EPSILON],
    [types.FLOAT]: [7.7, -7.7],

    //
    // non-primitives
    //

    [types.ARRAY]: [[], [1], [false], [{}], ['foo'], [function() {}]],
    [types.MAP]: [new Map(), new Map([[1, 'one'], [2, 'two']])],
    [types.WEAK_MAP]: (function() {
      const pairs = [[{}, 'one'], [{}, 'two']]; // hold refs so objects don't get GC'ed during tests
      return [new WeakMap(), new WeakMap(pairs)]; // keys must be objects
    }()),
    [types.SET]: [new Set(), new Set([undefined, null, 1, false, 'foo', {}, [],
      function() {}, /regex/])],
    [types.WEAK_SET]: (function() {
      // NOTE: weak sets can only contain objects
      const values = [{}, [], function() {}, /regex/]; // hold refs so objects don't get GC'ed during tests
      return [new WeakSet(), new WeakSet(values)];
    }()),
    [types.REGEXP]: [/regexp/, new RegExp('regexp')],
    [types.FUNCTION]: [function() {}, new Function('a', 'b', 'return a + b;')],
    [types.OBJECT]: [new String('new-string'), new Boolean(true), new Boolean(false), // eslint-disable-line no-new-wrappers
      new Number(1), new Object(), {}, new (function() {})()] // eslint-disable-line no-new-wrappers
  };

  return type ? validValues[type] : validValues;
};

/**
 * Determines if a test result is a pass.
 * @param {(boolean|rtvref.RtvSuccess)} result Test result.
 * @returns {boolean} True if the result is a pass; false otherwise.
 */
export const passed = function(result) {
  return (result === true || result instanceof RtvSuccess);
};

/**
 * Determines if a test result is a failure.
 * @param {(boolean|rtvref.RtvSuccess)} result Test result.
 * @returns {boolean} True if the result is a failure; false otherwise.
 */
export const failed = function(result) {
  return (result === false || result instanceof RtvError);
};

/**
 * Test valid values against a type's validation/validator function. All of them
 *  should pass.
 * @param {string} type The type being tested. Not validated as a type if
 *  `values` is specified.
 * @param {function} valFn The type's validation function.
 * @param {Array} [values] Optional override list of values to test.
 * @param {*} [rest] Optional parameters to pass to the validation function.
 * @returns {Object} Results:
 *  - {Array.<string>} failures Empty array if all values were validated (good).
 *    Otherwise, messages indicating which values failed (bad).
 *  - {Array.<number>} passes Empty array if all values failed validation (bad).
 *    Otherwise, messages indicating which values passed (good).
 */
export const testValues = function(type, valFn, values, ...rest) {
  values = values || getValidValues(types.verify(type)); // get valid values for the type
  if (!values || values.length === 0) {
    throw new Error(`Missing test values for type=${type}, values=${util.print(values)}`);
  }

  const passes = [];
  const failures = [];
  _.forEach(values, function(v, i) {
    const result = valFn(v, ...rest);
    if (passed(result)) {
      passes.push(`${type}[${i}] passed, v=${util.print(v)}`);
    } else {
      failures.push(`${type}[${i}] failed, v=${util.print(v)}`);
    }
  });

  return {
    passes,
    failures
  };
};

/**
 * Test other values against a type's validation function. _None_ of them should pass.
 * @param {string} type The type being tested. Must be a valid type and be in
 *  `validValues`.
 * @param {function} valFn The type's validation function.
 * @param {boolean} [treatAsValid=false] If truthy, the tests are reversed (treats
 *  all other values as valid instead of invalid).
 * @returns {Array.<string>} Empty array if no other values were validated (good).
 *  Otherwise, messages indicating which other values passed (bad). The opposite
 *  is true if `treatAsValid` is truthy.
 */
export const testOtherValues = function(type, valFn, treatAsValid) {
  types.verify(type);
  const validValues = getValidValues();
  if (!validValues.hasOwnProperty(type) || validValues[type].length === 0) {
    throw new Error(`Missing valid test values for type=${type}`);
  }

  delete validValues[type]; // keep other (invalid) values

  const violations = [];
  _.forEach(validValues, function(otherValues, otherType) {
    _.forEach(otherValues, function(v, i) {
      const result = valFn(v);
      if ((passed(result) && !treatAsValid) || (failed(result) && treatAsValid)) {
        violations.push(
            `${type}: ${otherType}[${i}] passed, v=${util.print(v)}`);
      }
    });
  });

  return violations;
};

/**
 * Expects a validator to __succeed__ with a given value, qualifier, and type args.
 *  The validator must return an {@link rtvref.RtvSuccess RtvSuccess} object.
 * @param {rtvref.validator} validator Validator module to test.
 * @param {*} value The value to check.
 * @param {string} [qualifier] Optional qualifier, one of
 *  {@link rtvref.qualifiers qualifiers}.
 * @param {rtvref.types.type_arguments} [args] Optional type args.
 */
export const expectValidatorSuccess = function(validator, value, qualifier, args) {
  const result = validator.default(value, qualifier, args);

  expect(result).to.be.an.instanceof(RtvSuccess);
  expect(result.valid).to.be.true;
};

/**
 * Expects a validator to __fail__ with a given value, qualifier, and type args.
 *  The validator must return an {@link rtvref.RtvError RtvError} object.
 * @param {rtvref.validator} validator Validator module to test.
 * @param {*} value The value to check.
 * @param {string} [qualifier] Optional qualifier, one of
 *  {@link rtvref.qualifiers qualifiers}.
 * @param {rtvref.types.type_arguments} [args] Optional type args.
 * @param {Object} [expectations] Values to use for expectations for any of the
 *  `RtvError` properties. For example, `{cause: [EXPECTED, FINITE]}` would
 *  alter the expectation for the error's `cause` property to be `eql` to
 *  `[EXPECTED, FINITE]`. All `RtvError` properties are tested using `eql`
 *  except for `value` which is tested using `equal`.
 */
export const expectValidatorError = function(validator, value, qualifier, args, expectations = {}) {
  const result = validator.default(value, qualifier, args);

  expect(result).to.be.an.instanceof(RtvError);
  expect(result.valid).to.be.false;

  // NOTE: Check for the existence of a property on `expectations` rather than
  //  a truthy value since `undefined`, `null`, `0`, `false`, or an empty string
  //  are all possible expectation property values.

  if (expectations.hasOwnProperty('value')) {
    expect(result.value).to.equal(expectations.value);
  } else {
    if (_.isNaN(value)) {
      expect(_.isNaN(result.value)).to.be.true;
    } else {
      expect(result.value).to.equal(value);
    }
  }

  if (args) {
    if (expectations.hasOwnProperty('typeset')) {
      expect(result.typeset).to.eql(expectations.typeset);
    } else {
      if (!qualifier || qualifier === DEFAULT_QUALIFIER) {
        expect(result.typeset).to.eql([validator.type, args]);
      } else {
        expect(result.typeset).to.eql([qualifier, validator.type, args]);
      }
    }

    if (expectations.hasOwnProperty('cause')) {
      expect(result.cause).to.eql(expectations.cause);
    } else {
      expect(result.cause).to.eql(
          [qualifier || DEFAULT_QUALIFIER, validator.type, args]);
    }
  } else {
    if (expectations.hasOwnProperty('typeset')) {
      expect(result.typeset).to.eql(expectations.typeset);
    } else {
      if (!qualifier || qualifier === DEFAULT_QUALIFIER) {
        expect(result.typeset).to.eql(validator.type);
      } else {
        expect(result.typeset).to.eql([qualifier, validator.type]);
      }
    }

    if (expectations.hasOwnProperty('cause')) {
      expect(result.cause).to.eql(expectations.cause);
    } else {
      expect(result.cause).to.eql(
          [qualifier || DEFAULT_QUALIFIER, validator.type]);
    }
  }

  if (expectations.hasOwnProperty('path')) {
    expect(result.path).to.eql(expectations.path);
  } else {
    expect(result.path).to.eql([]);
  }
};
