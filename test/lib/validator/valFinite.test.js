import _ from 'lodash-es';

import '../../../src/rtv'; // make sure all validators we might use in typesets get configured
import * as vtu from '../validationTestUtil';
import { types } from '../../../src/lib/types';
import { qualifiers } from '../../../src/lib/qualifiers';
import * as val from '../../../src/lib/validator/valFinite';

describe('module: lib/validator/valFinite', () => {
  describe('validator', () => {
    // module, and value only
    it('#type', () => {
      expect(val.type).toBe(types.FINITE);
    });

    it('succeeds with an RtvSuccess', () => {
      vtu.expectValidatorSuccess(val, 1);
    });

    it('valid values', () => {
      expect(vtu.testValues(val.type, val.validate).failures).toEqual([]);
    });

    it('other types/values', () => {
      const validValues = vtu.getValidValues(); // @type {Object}
      const invalidTypes = Object.keys(validValues); // @type {Array}

      // remove subset types
      _.pull(
        invalidTypes,
        types.NUMBER,
        types.FINITE,
        types.INT,
        types.SAFE_INT,
        types.FLOAT
      );

      // build a list of all remaining invalid values
      let invalidValues = [
        // put some NUMBER values back in which aren't overlaps
        NaN,
        Infinity,
        Number.POSITIVE_INFINITY,
        -Infinity,
        Number.NEGATIVE_INFINITY,
      ];
      _.forEach(invalidTypes, function (type) {
        invalidValues = invalidValues.concat(validValues[type]);
      });

      // nothing should pass
      expect(
        vtu.testValues(val.type, val.validate, invalidValues).passes
      ).toEqual([]);
    });
  });

  describe('qualifiers', () => {
    it('only allows NaN if TRUTHY', () => {
      _.forEach(qualifiers, function (qualifier) {
        if (qualifier !== qualifiers.TRUTHY) {
          vtu.expectValidatorError(val, NaN, qualifier);
        } else {
          vtu.expectValidatorSuccess(val, NaN, qualifier);
        }
      });
    });

    describe('rules are supported', () => {
      it('REQUIRED (other than values previously tested)', () => {
        const restrictedValues = vtu
          .getRestrictedValues(qualifiers.REQUIRED)
          .filter((v) => v !== 0);
        vtu.expectAllToFail(
          val.type,
          val.validate,
          restrictedValues,
          qualifiers.REQUIRED
        );

        const permittedValues = vtu.getPermittedValues(qualifiers.REQUIRED);
        vtu.expectAllToPass(
          val.type,
          val.validate,
          permittedValues,
          qualifiers.REQUIRED
        );
      });

      it('EXPECTED', () => {
        const restrictedValues = vtu
          .getRestrictedValues(qualifiers.EXPECTED)
          .filter((v) => v !== 0 && !isNaN(v));
        vtu.expectAllToFail(
          val.type,
          val.validate,
          restrictedValues,
          qualifiers.EXPECTED
        );

        const permittedValues = vtu.getPermittedValues(qualifiers.EXPECTED);
        vtu.expectAllToPass(
          val.type,
          val.validate,
          permittedValues,
          qualifiers.EXPECTED
        );
      });

      it('OPTIONAL', () => {
        const restrictedValues = vtu
          .getRestrictedValues(qualifiers.OPTIONAL)
          .filter((v) => v !== 0 && !isNaN(v));
        vtu.expectAllToFail(
          val.type,
          val.validate,
          restrictedValues,
          qualifiers.OPTIONAL
        );

        const permittedValues = vtu.getPermittedValues(qualifiers.OPTIONAL);
        vtu.expectAllToPass(
          val.type,
          val.validate,
          permittedValues,
          qualifiers.OPTIONAL
        );
      });

      it('TRUTHY', () => {
        const restrictedValues = vtu.getRestrictedValues(qualifiers.TRUTHY);
        vtu.expectAllToFail(
          val.type,
          val.validate,
          restrictedValues,
          qualifiers.TRUTHY
        );

        const permittedValues = vtu.getPermittedValues(qualifiers.TRUTHY);
        vtu.expectAllToPass(
          val.type,
          val.validate,
          permittedValues,
          qualifiers.TRUTHY
        );
      });
    });

    describe('are used in error typesets', () => {
      it('DEFAULT', () => {
        vtu.expectValidatorError(val, /foo/); // default should be REQUIRED
      });

      it('REQUIRED', () => {
        vtu.expectValidatorError(val, /foo/, qualifiers.REQUIRED);
      });

      it('EXPECTED', () => {
        vtu.expectValidatorError(val, /foo/, qualifiers.EXPECTED);
      });

      it('OPTIONAL', () => {
        vtu.expectValidatorError(val, /foo/, qualifiers.OPTIONAL);
      });

      it('TRUTHY', () => {
        vtu.expectValidatorError(val, /foo/, qualifiers.TRUTHY);
      });
    });
  });

  describe('arguments', () => {
    let validTypeValues;

    beforeEach(() => {
      validTypeValues = vtu.getValidValues(val.type);
    });

    it('checks for an exact number', () => {
      validTypeValues.forEach(function (value) {
        vtu.expectValidatorSuccess(val, value, undefined, { oneOf: value });
      });

      // qualifier takes precedence
      vtu.expectValidatorError(val, NaN, undefined, { oneOf: NaN });
      // NaN not permitted
      vtu.expectValidatorError(val, NaN, qualifiers.EXPECTED, { oneOf: NaN });

      // zero is in type range
      vtu.expectValidatorError(val, 7, undefined, { oneOf: 0 });

      // TRUTHY allows NaN even if not allowed for exact
      vtu.expectValidatorSuccess(val, NaN, qualifiers.TRUTHY, { oneOf: 1 });
      // TRUTHY allows 0 even if not allowed for exact
      vtu.expectValidatorSuccess(val, 0, qualifiers.TRUTHY, { oneOf: 1 });

      // ignored: not in type range
      vtu.expectValidatorSuccess(val, 7, undefined, { oneOf: NaN });
      vtu.expectValidatorSuccess(val, 7, undefined, { oneOf: -Infinity });
      vtu.expectValidatorSuccess(val, 7, undefined, {
        oneOf: Number.NEGATIVE_INFINITY,
      });
      vtu.expectValidatorSuccess(val, 7, undefined, { oneOf: Infinity });
      vtu.expectValidatorSuccess(val, 7, undefined, {
        oneOf: Number.POSITIVE_INFINITY,
      });

      // ignored: invalid type
      vtu.expectValidatorSuccess(val, 7, undefined, { oneOf: '6' });
    });

    it('checks for an exact number in a list', () => {
      vtu.expectValidatorSuccess(val, 7, undefined, { oneOf: [6, 7, 8] });
      vtu.expectValidatorError(val, 7, undefined, { oneOf: [6, 8] });
      vtu.expectValidatorSuccess(val, 7, undefined, { oneOf: [7] });
      vtu.expectValidatorSuccess(val, 7, undefined, { oneOf: [] }); // ignored

      // TRUTHY allows NaN even if not allowed for exact
      vtu.expectValidatorSuccess(val, NaN, qualifiers.TRUTHY, { oneOf: [1] });
      // TRUTHY allows 0 even if not allowed for exact
      vtu.expectValidatorSuccess(val, 0, qualifiers.TRUTHY, { oneOf: [1] });

      // ignores non-type values in a list
      vtu.expectValidatorError(val, 7, undefined, { oneOf: [null, '7', true] });

      // ignores non-arrays
      vtu.expectValidatorSuccess(val, 7, undefined, { oneOf: new Set([6, 8]) });
    });

    it('exact takes precedence over min/max', () => {
      vtu.expectValidatorSuccess(val, 7, undefined, { oneOf: 7, min: 8 });
      vtu.expectValidatorSuccess(val, 7, undefined, { oneOf: 7, max: 6 });
      vtu.expectValidatorSuccess(val, 7, undefined, {
        oneOf: 7,
        min: 8,
        max: 6,
      });
      vtu.expectValidatorSuccess(val, 7, undefined, {
        oneOf: [7],
        min: 8,
        max: 6,
      });
    });

    it('checks for a minimum number', () => {
      validTypeValues.forEach(function (value) {
        vtu.expectValidatorSuccess(val, value, undefined, { min: value });
      });

      vtu.expectValidatorError(val, -8, undefined, { min: -7 });
      vtu.expectValidatorSuccess(val, 7, undefined, { min: 6 });

      // zero is in type range
      vtu.expectValidatorError(val, -7, undefined, { min: 0 });

      // TRUTHY allows NaN even if not allowed in range
      vtu.expectValidatorSuccess(val, NaN, qualifiers.TRUTHY, { min: 1 });
      // TRUTHY allows 0 even if not allowed in range
      vtu.expectValidatorSuccess(val, 0, qualifiers.TRUTHY, { min: 1 });

      // these are all ignored min values
      vtu.expectValidatorSuccess(val, 7, undefined, { min: '8' });
      vtu.expectValidatorSuccess(val, 7, undefined, { min: NaN });
      vtu.expectValidatorSuccess(val, 7, undefined, { min: -Infinity });
      vtu.expectValidatorSuccess(val, 7, undefined, {
        min: Number.NEGATIVE_INFINITY,
      });
      vtu.expectValidatorSuccess(val, 7, undefined, { min: Infinity });
      vtu.expectValidatorSuccess(val, 7, undefined, {
        min: Number.POSITIVE_INFINITY,
      });
    });

    it('checks for a maximum number', () => {
      validTypeValues.forEach(function (value) {
        vtu.expectValidatorSuccess(val, value, undefined, { max: value });
      });

      vtu.expectValidatorError(val, -7, undefined, { max: -8 });
      vtu.expectValidatorError(val, 7, undefined, { max: 6 });

      // zero is in type range
      vtu.expectValidatorError(val, 7, undefined, { max: 0 });

      // these are all ignored max values
      vtu.expectValidatorSuccess(val, 7, undefined, { max: '6' });
      vtu.expectValidatorSuccess(val, 7, undefined, { max: NaN });
      vtu.expectValidatorSuccess(val, 7, undefined, { max: Infinity });
      vtu.expectValidatorSuccess(val, 7, undefined, {
        max: Number.POSITIVE_INFINITY,
      });
      vtu.expectValidatorSuccess(val, 7, undefined, { max: -Infinity });
      vtu.expectValidatorSuccess(val, 7, undefined, {
        max: Number.NEGATIVE_INFINITY,
      });

      // TRUTHY allows NaN even if not allowed in range
      vtu.expectValidatorSuccess(val, NaN, qualifiers.TRUTHY, { max: 1 });
      // TRUTHY allows 0 even if not allowed in range
      vtu.expectValidatorSuccess(val, 0, qualifiers.TRUTHY, { max: -1 });
    });

    it('max ignored if less than min', () => {
      vtu.expectValidatorSuccess(val, 7, undefined, { min: 7, max: 6 });
    });

    it('checks for a number in a range', () => {
      vtu.expectValidatorSuccess(val, 5, undefined, { min: 1, max: 10 });
      vtu.expectValidatorError(val, 0, undefined, { min: 1, max: 10 });

      // TRUTHY allows NaN even if not allowed in range
      vtu.expectValidatorSuccess(val, NaN, qualifiers.TRUTHY, {
        min: 1,
        max: 10,
      });
      // TRUTHY allows 0 even if not allowed in range
      vtu.expectValidatorSuccess(val, 0, qualifiers.TRUTHY, {
        min: 1,
        max: 10,
      });
    });
  });

  // Minimum Viable Value
  describe('mvv', () => {
    vtu.testMvvVerbatimType(val);
  });
});
