//
// Utility for testing validation and validator modules
//

import _ from 'lodash-es';
import { types } from '../../src/lib/types';
import { qualifiers, DEFAULT_QUALIFIER } from '../../src/lib/qualifiers';
import * as util from '../../src/lib/util';
import { RtvSuccess } from '../../src/lib/RtvSuccess';
import { RtvError } from '../../src/lib/RtvError';

/* eslint-disable no-new-wrappers, no-console */

/**
 * Get a fresh copy of the valid values type map, or just one valid value type array.
 * @param {string} [type] The valid value type array to get.
 * @returns {(Object|Array|undefined)} If `type` is specified and a known type,
 *  returns an array of valid values for that type. If `type` is unknown, returns
 *  `undefined`. If `type` is not specified, returns a map of type to array of
 *  valid values for each type.
 */
export const getValidValues = function (type) {
  // map of type to _valid_ values for that type
  const validValues = {
    //
    // primitives
    //

    // NOTE: we purposely __omit__ the following types and associated values because
    //  they would cause a lot of issues with testOtherValues() due to overlap with
    //  many types:
    //  - types.ANY: [undefined, null]
    //  - types.NULL: [null]
    //  - types.JSON: [null, 'string', '', true, false, 1, [], {}] -- see
    //    getJsonValues() and getInvalidJsonValues()

    [types.STRING]: ['literal-string'],
    [types.BOOLEAN]: [true, false],
    [types.SYMBOL]: [
      Symbol(),
      Symbol('symbol'),
      Symbol(1),
      Symbol.for('other'),
    ],

    [types.NUMBER]: [
      -1.1,
      -1,
      -0,
      0,
      1,
      1.1,
      Number.EPSILON,
      Number.MIN_VALUE, // float, number closest to zero
      Number.MAX_VALUE, // int, unsafe
      Infinity,
      Number.POSITIVE_INFINITY,
      -Infinity,
      Number.NEGATIVE_INFINITY,
      Number.MIN_SAFE_INTEGER - 1, // int, unsafe
      Number.MIN_SAFE_INTEGER, // largest negative safe int
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER + 1, // int, unsafe
    ],
    [types.FINITE]: [
      -1.1,
      -1,
      -0,
      0,
      1,
      1.1,
      Number.EPSILON,
      Number.MIN_VALUE, // float, number closest to zero
      Number.MAX_VALUE, // int, unsafe
      Number.MIN_SAFE_INTEGER - 1, // int, unsafe
      Number.MIN_SAFE_INTEGER, // largest negative safe int
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER + 1, // int, unsafe
    ],
    [types.INT]: [
      -1,
      -0,
      0,
      1,
      Number.MAX_VALUE, // int, unsafe
      Number.MIN_SAFE_INTEGER - 1, // int, unsafe
      Number.MIN_SAFE_INTEGER, // largest negative safe int
      Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER + 1, // int, unsafe
    ],
    [types.SAFE_INT]: [
      -1,
      -0,
      0,
      1,
      Number.MIN_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
    ],
    [types.FLOAT]: [
      -1.1,
      -0,
      0,
      1.1,
      Number.EPSILON,
      Number.MIN_VALUE, // float, number closest to zero
    ],

    //
    // non-primitives
    //

    [types.ARRAY]: [[], [1], [false], [{}], ['foo'], [function () {}]],
    [types.MAP]: [
      new Map(),
      new Map([
        [1, 'one'],
        [2, 'two'],
      ]),
    ],
    [types.WEAK_MAP]: (function () {
      const pairs = [
        [{}, 'one'],
        [{}, 'two'],
      ]; // hold refs so objects don't get GC'ed during tests
      return [new WeakMap(), new WeakMap(pairs)]; // keys must be objects
    })(),
    [types.SET]: [
      new Set(),
      new Set([
        undefined,
        null,
        1,
        false,
        'foo',
        {},
        [],
        function () {},
        /regex/,
      ]),
    ],
    [types.WEAK_SET]: (function () {
      // NOTE: weak sets can only contain objects
      const values = [{}, [], function () {}, /regex/]; // hold refs so objects don't get GC'ed during tests
      return [new WeakSet(), new WeakSet(values)];
    })(),
    [types.REGEXP]: [/regexp/, new RegExp('regexp')],
    [types.DATE]: [new Date()],
    [types.ERROR]: [
      new Error(),
      new TypeError(),
      new URIError(),
      new ReferenceError(),
      new RangeError(),
      new EvalError(),
      new SyntaxError(),
    ],
    [types.PROMISE]: [new Promise(function () {})],
    [types.FUNCTION]: [function () {}, new Function('a', 'b', 'return a + b;')], // eslint-disable-line no-new-func

    // while the JS type is objects, it's not an object type in this library
    [types.HASH_MAP]: [new Object(), {}, new (class {})()],

    //
    // object types
    //

    [types.ANY_OBJECT]: [
      new String('new-string'),
      new Boolean(true),
      new Boolean(false),
      new Number(1),
      new Object(),
      Object.create(null),
      {},
      new (class {})(),
    ],
    [types.OBJECT]: [new Object(), Object.create(null), {}, new (class {})()],
    [types.PLAIN_OBJECT]: [new Object(), Object.create(null), {}],
    [types.CLASS_OBJECT]: [new (class {})()],
  };

  return type ? validValues[type] : validValues;
};

/**
 * Get all values for all types in one single list.
 * @returns {Array} All types in a single, flat list.
 */
export const getAllValues = function () {
  const validValues = getValidValues();
  const values = [];

  _.forEach(validValues, function (typeValues) {
    values.concat(typeValues);
  });

  return values;
};

/**
 * Get valid JSON values.
 * @returns {Array} Valid JSON values for testing.
 */
export const getJsonValues = function () {
  return [
    null,
    'string',
    '',
    true,
    false,
    1,
    [],
    {},
    Object.create(null),
    new Object(),
  ];
};

/**
 * Get invalid JSON values.
 * @returns {Array} Invalid JSON values for testing.
 */
export const getInvalidJsonValues = function () {
  const validTypeValues = getValidValues();

  let invalidValues = [
    undefined,
    NaN,
    Infinity,
    Number.POSITIVE_INFINITY,
    -Infinity,
    Number.NEGATIVE_INFINITY,
    new String('new-string'),
    new Boolean(true),
    new Boolean(false),
    new Number(1),
    new (class {})(),
  ];

  invalidValues = invalidValues.concat(
    validTypeValues[types.SYMBOL],
    validTypeValues[types.MAP],
    validTypeValues[types.WEAK_MAP],
    validTypeValues[types.SET],
    validTypeValues[types.WEAK_SET],
    validTypeValues[types.DATE],
    validTypeValues[types.FUNCTION],
    validTypeValues[types.REGEXP],
    validTypeValues[types.ERROR],
    validTypeValues[types.PROMISE]
  );

  return invalidValues;
};

/**
 * Get all JavaScript falsy values.
 * @returns {Array} Falsy values.
 */
export const getFalsyValues = function () {
  return [undefined, null, false, 0, '', NaN];
};

/**
 * Get all values that a qualifier imposes restrictions on.
 * @param {(string|undefined)} [q] Optional {@link rtvref.qualifiers.qualifiers qualifier}
 *  to filter the list of returned values to only those which the qualifier does
 *  not permit. Defaults to {@link rtvref.qualifiers.REQUIRED}, which means ALL possible
 *  restricted values are returned.
 * @returns {Array} Restricted values.
 * @throws {Error} If the qualifier is unknown/invalid.
 */
export const getRestrictedValues = function (q = qualifiers.REQUIRED) {
  const values = getFalsyValues(); // for now, restricted values are same as falsy values

  if (q === qualifiers.REQUIRED) {
    return values; // all restricted
  }

  if (q === qualifiers.EXPECTED) {
    // only null is permitted
    return values.filter((v) => v !== null);
  }

  if (q === qualifiers.OPTIONAL) {
    // undefined and null are permitted
    return values.filter((v) => v !== undefined && v !== null);
  }

  if (q === qualifiers.TRUTHY) {
    return []; // all permitted
  }

  throw new Error(`Invalid qualifier: q="${q}"`);
};

/**
 * Get all values that a qualifier permits.
 * @param {(string|undefined)} [q] Optional {@link rtvref.qualifiers.qualifiers qualifier}
 *  to filter the list of returned values to only those which the qualifier does
 *  not permit.  Defaults to {@link rtvref.qualifiers.REQUIRED}, which means
 *  NO permitted values are returned.
 * @returns {Array} Permitted values.
 * @throws {Error} If the qualifier is unknown/invalid.
 */
export const getPermittedValues = function (q = qualifiers.REQUIRED) {
  if (q === qualifiers.REQUIRED) {
    return []; // all restricted
  }

  if (q === qualifiers.EXPECTED) {
    // only null is permitted
    return [null];
  }

  if (q === qualifiers.OPTIONAL) {
    // undefined and null are permitted
    return [undefined, null];
  }

  if (q === qualifiers.TRUTHY) {
    return getFalsyValues(); // for now, restricted values are same as falsy values
  }

  throw new Error(`Invalid qualifier: q="${q}"`);
};

/**
 * Determines if a test result is a pass.
 * @param {(boolean|rtvref.RtvSuccess)} result Test result.
 * @returns {boolean} True if the result is a pass; false otherwise.
 */
export const passed = function (result) {
  return result === true || result instanceof RtvSuccess;
};

/**
 * Determines if a test result is a failure.
 * @param {(boolean|rtvref.RtvSuccess)} result Test result.
 * @returns {boolean} True if the result is a failure; false otherwise.
 */
export const failed = function (result) {
  return result === false || result instanceof RtvError;
};

/**
 * Test valid values against a type's validation/validator function. All of them
 *  should pass.
 * @param {string} type The type being tested. Not validated as a type if
 *  `values` is specified.
 * @param {function} valFn The type's validation function.
 * @param {Array} [values] Optional override list of values to test. If not
 *  specified, `type` is used to get a list of valid values from `getValidValues()`.
 *
 *  NOTE: If empty, NO VALUES WILL BE TESTED and the test will succeed.
 *
 * @param {*} [rest] Optional parameters to pass to the validation function.
 * @returns {Object} Results:
 *  - {Array.<string>} failures Empty array if all values were validated (good).
 *    Otherwise, messages indicating which values failed (bad).
 *  - {Array.<string>} passes Empty array if all values failed validation (bad).
 *    Otherwise, messages indicating which values passed (good).
 */
export const testValues = function (type, valFn, values, ...rest) {
  if (!values) {
    values = getValidValues(types.verify(type)); // get valid values for the type
    if (values.length === 0) {
      throw new Error(
        `Missing test values for type="${type}", values=${util.print(values)}`
      );
    }
  }

  const passes = [];
  const failures = [];
  _.forEach(values, function (v, i) {
    const result = valFn(v, ...rest);
    if (passed(result)) {
      passes.push(`${type}[${i}] passed, v=${util.print(v)}`);
    } else {
      failures.push(`${type}[${i}] failed, v=${util.print(v)}`);
    }
  });

  return {
    passes,
    failures,
  };
};

/**
 * Test other values against a type's validation function. _None_ of them should pass.
 * @param {(string|Array.<string>)} type The type being tested. Must be a valid
 *  type and be in `validValues`. Can also be a list of types to exclude multiple
 *  types from the test.
 * @param {function} valFn The type's validation function.
 * @param {boolean} [treatAsValid=false] If truthy, the tests are reversed (treats
 *  all other values as valid instead of invalid).
 * @returns {Array.<string>} Empty array if no other values were validated (good).
 *  Otherwise, messages indicating which other values passed (bad). The opposite
 *  is true if `treatAsValid` is truthy.
 */
export const testOtherValues = function (type, valFn, treatAsValid) {
  const excludedTypes = _.isArray(type) ? type : [type];
  const validValues = getValidValues();

  excludedTypes.forEach(function (excludedType) {
    types.verify(excludedType);

    if (
      excludedType !== types.ANY &&
      excludedType !== types.NULL &&
      (!validValues.hasOwnProperty(excludedType) ||
        validValues[excludedType].length === 0)
    ) {
      throw new Error(
        `Missing valid test values for excludedType="${excludedType}"`
      );
    }

    delete validValues[excludedType]; // keep other (invalid) values
  });

  const violations = [];
  _.forEach(validValues, function (otherValues, otherType) {
    _.forEach(otherValues, function (v, i) {
      const result = valFn(v);
      if (
        (passed(result) && !treatAsValid) ||
        (failed(result) && treatAsValid)
      ) {
        violations.push(
          `${type}: ${otherType}[${i}] passed, v=${util.print(v)}`
        );
      }
    });
  });

  return violations;
};

/**
 * Expects all values to __pass__ the type's validation/validator function.
 *
 * This is a convenience function that simply calls `testValues()` and expects
 *  the result's `failures` list to be empty, and the `passes` list to have a
 *  length equal to `values.length`.
 *
 * @param {string} type The type being tested. Not validated as a type if
 *  `values` is specified.
 * @param {function} valFn The type's validation function.
 * @param {Array} [values] Optional override list of values to test.
 * @param {*} [rest] Optional parameters to pass to the validation function.
 * @returns {Object} The results object returned by `testValues()`.
 */
export const expectAllToPass = function (type, valFn, values, ...rest) {
  const results = testValues(type, valFn, values, ...rest);

  expect(results.passes.length).toBe(values.length);

  // print these BEFORE we fail the next expectation otherwise this code wouldn't
  //  get executed
  if (results.failures.length > 0) {
    console.error(
      'Failures that should have PASSED:\n%s',
      results.passes.join('\n')
    );
  }

  expect(results.failures.length).toBe(0);

  return results;
};

/**
 * Expects all values to __fail__ the type's validation/validator function.
 *
 * This is a convenience function that simply calls `testValues()` and expects
 *  the result's `passes` list to be empty, and the `failures` list to have a
 *  length equal to `values.length`.
 *
 * @param {string} type The type being tested. Not validated as a type if
 *  `values` is specified.
 * @param {function} valFn The type's validation function.
 * @param {Array} [values] Optional override list of values to test.
 * @param {*} [rest] Optional parameters to pass to the validation function.
 * @returns {Object} The results object returned by `testValues()`.
 */
export const expectAllToFail = function (type, valFn, values, ...rest) {
  const results = testValues(type, valFn, values, ...rest);

  // print these BEFORE we fail the next expectation otherwise this code wouldn't
  //  get executed
  if (results.passes.length > 0) {
    console.error(
      'Passes that should have FAILED:\n%s',
      results.passes.join('\n')
    );
  }

  expect(results.passes.length).toBe(0);
  expect(results.failures.length).toBe(values.length);

  return results;
};

/**
 * Expects a validator to __succeed__ with a given value, qualifier, and type args.
 *  The validator must return an {@link rtvref.RtvSuccess RtvSuccess} object.
 * @param {rtvref.validator} validator Validator module to test.
 * @param {*} value The value to check.
 * @param {string} [qualifier] Optional qualifier, one of
 *  {@link rtvref.qualifiers qualifiers}.
 * @param {rtvref.types.type_arguments} [args] Optional type args.
 * @param {rtvref.validator.type_validator_context} [context] Optional context.
 * @returns {rtvref.RtvSuccess} The resulting success that has been validated (test
 *  will fail with an exception before the result is returned, if the result
 *  wasn't as expected).
 */
export const expectValidatorSuccess = function (
  validator,
  value,
  qualifier,
  args,
  context
) {
  const result = validator.validate(value, qualifier, args, context);

  expect(result).toBeInstanceOf(RtvSuccess);
  expect(result.valid).toBe(true);

  return result;
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
 *  `RtvError` properties. For example, `{mismatch: [EXPECTED, FINITE]}` would
 *  alter the expectation for the error's `cause` property to be `eql` to
 *  `[EXPECTED, FINITE]`. All `RtvError` properties are tested using `eql`
 *  except for `value` which is tested using `equal`.
 * @param {rtvref.validator.type_validator_context} [context] Optional context.
 * @returns {rtvref.RtvError} The resulting error that has been validated (test
 *  will fail with an exception before the result is returned, if the result
 *  wasn't as expected).
 */
export const expectValidatorError = function (
  validator,
  value,
  qualifier,
  args,
  expectations = {},
  context
) {
  const result = validator.validate(value, qualifier, args, context);

  expect(result).toBeInstanceOf(RtvError);
  expect(result.valid).toBe(false);
  expect(result.name).toBe('RtvError');

  // NOTE: Check for the existence of a property on `expectations` rather than
  //  a truthy value since `undefined`, `null`, `0`, `false`, or an empty string
  //  are all possible expectation property values.

  if (expectations.hasOwnProperty('value')) {
    expect(result.value).toBe(expectations.value);
  } else {
    if (_.isNaN(value)) {
      expect(_.isNaN(result.value)).toBe(true);
    } else {
      expect(result.value).toBe(value);
    }
  }

  if (args) {
    if (expectations.hasOwnProperty('typeset')) {
      expect(result.typeset).toEqual(expectations.typeset);
    } else {
      if (!qualifier || qualifier === DEFAULT_QUALIFIER) {
        expect(result.typeset).toEqual([validator.type, args]);
      } else {
        expect(result.typeset).toEqual([qualifier, validator.type, args]);
      }
    }

    if (expectations.hasOwnProperty('mismatch')) {
      expect(result.mismatch).toEqual(expectations.mismatch);
    } else {
      expect(result.mismatch).toEqual([
        qualifier || DEFAULT_QUALIFIER,
        validator.type,
        args,
      ]);
    }
  } else {
    if (expectations.hasOwnProperty('typeset')) {
      expect(result.typeset).toEqual(expectations.typeset);
    } else {
      if (!qualifier || qualifier === DEFAULT_QUALIFIER) {
        expect(result.typeset).toEqual(validator.type);
      } else {
        expect(result.typeset).toEqual([qualifier, validator.type]);
      }
    }

    if (expectations.hasOwnProperty('mismatch')) {
      expect(result.mismatch).toEqual(expectations.mismatch);
    } else {
      expect(result.mismatch).toEqual([
        qualifier || DEFAULT_QUALIFIER,
        validator.type,
      ]);
    }
  }

  if (expectations.hasOwnProperty('path')) {
    expect(result.path).toEqual(expectations.path);
  } else {
    expect(result.path).toEqual([]);
  }

  if (expectations.hasOwnProperty('rootCause')) {
    if (expectations.rootCause instanceof Error) {
      // expect rootCause to match the instance
      expect(result.rootCause).toBe(expectations.rootCause);
    } else if (typeof expectations.rootCause === 'string') {
      // expect rootCause to be an Error with the expectation as the message
      expect(result.rootCause).toBeInstanceOf(Error);
      expect(result.rootCause.message).toBe(expectations.rootCause);
    } else if (!expectations.rootCause) {
      expect(result.rootCause).toBeUndefined();
    }
  }

  return result;
};

/**
 * Tests for a validator that should use the original value verbatim for its Minimum
 *  Viable Value (MVV) result.
 * @param {rtvref.validator} validator Validator module to test.
 */
export const testMvvVerbatimType = function (validator) {
  // these specific types result in interpreted MVVs instead of verbatim the original value
  const interpretedTypes = [
    types.ARRAY,
    types.PLAIN_OBJECT,
    types.OBJECT,
    types.CLASS_OBJECT,
    types.HASH_MAP,
    types.ANY_OBJECT,
    types.MAP,
    types.SET,
  ];

  if (interpretedTypes.includes(validator.type)) {
    throw new Error(
      `validator.type=${util.print(
        validator.type
      )} is interpreted, not verbatim; cannot be tested with testMvvVerbatimType()`
    );
  }

  it('uses original value', () => {
    let validValues;
    if (validator.type === types.NULL) {
      validValues = [null];
    } else if (validator.type === types.JSON) {
      validValues = getJsonValues();
    } else {
      validValues = getValidValues(validator.type);
    }

    validValues.forEach((value, idx) => {
      const result = validator.validate(value, `validValues[${idx}]`);
      expect(result.mvv).toBe(value);
    });
  });

  it('interprets falsy values verbatim', () => {
    getFalsyValues().forEach((falsyValue) => {
      const result = validator.validate(falsyValue, qualifiers.TRUTHY);
      if (isNaN(falsyValue)) {
        // ${util.print(falsyValue)} verbatim
        expect(isNaN(result.mvv)).toBe(true);
      } else {
        // ${util.print(falsyValue)} verbatim
        expect(result.mvv).toBe(falsyValue);
      }
    });
  });
};
