import _ from 'lodash-es';

import '../../../src/rtv'; // make sure all validators we might use in typesets get configured
import * as vtu from '../validationTestUtil';
import { types } from '../../../src/lib/types';
import { qualifiers } from '../../../src/lib/qualifiers';
import * as val from '../../../src/lib/validator/valString';

describe('module: lib/validator/valString', () => {
  describe('validator', () => {
    // module, and value only
    it('#type', () => {
      expect(val.type).toBe(types.STRING);
    });

    it('succeeds with an RtvSuccess', () => {
      vtu.expectValidatorSuccess(val, 'hello');
    });

    it('valid values', () => {
      expect(vtu.testValues(val.type, val.validate).failures).toEqual([]);
    });

    it('other types/values', () => {
      expect(vtu.testOtherValues(val.type, val.validate)).toEqual([]);
    });
  });

  describe('qualifiers', () => {
    it('allows empty strings if not REQUIRED', () => {
      vtu.expectValidatorError(val, ''); // defaults to REQUIRED

      _.forEach(qualifiers, function (qualifier) {
        // rejects unless not REQUIRED
        if (qualifier === qualifiers.REQUIRED) {
          vtu.expectValidatorError(val, '', qualifier);
        } else {
          vtu.expectValidatorSuccess(val, '', qualifier);
        }
      });
    });

    describe('rules are supported', () => {
      it('REQUIRED (other than values previously tested)', () => {
        // NOTE: empty string is restricted by REQUIRED
        const restrictedValues = vtu.getRestrictedValues(qualifiers.REQUIRED);
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
          .filter((v) => v !== '');
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
        vtu.expectValidatorSuccess(val, '', qualifiers.EXPECTED);
      });

      it('OPTIONAL', () => {
        const restrictedValues = vtu
          .getRestrictedValues(qualifiers.OPTIONAL)
          .filter((v) => v !== '');
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
        vtu.expectValidatorSuccess(val, '', qualifiers.OPTIONAL);
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
        vtu.expectValidatorSuccess(val, '', qualifiers.TRUTHY);
      });
    });

    describe('are used in error typesets', () => {
      it('DEFAULT', () => {
        vtu.expectValidatorError(val, 1); // default should be REQUIRED
      });

      it('REQUIRED', () => {
        vtu.expectValidatorError(val, 1, qualifiers.REQUIRED);
      });

      it('EXPECTED', () => {
        vtu.expectValidatorError(val, 1, qualifiers.EXPECTED);
      });

      it('OPTIONAL', () => {
        vtu.expectValidatorError(val, 1, qualifiers.OPTIONAL);
      });

      it('TRUTHY', () => {
        vtu.expectValidatorError(val, 1, qualifiers.TRUTHY);
      });
    });
  });

  describe('arguments', () => {
    it('checks for an exact value', () => {
      vtu.expectValidatorSuccess(val, 'foo', undefined, { oneOf: 'foo' });
      vtu.expectValidatorError(val, 'bar', undefined, { oneOf: 'foo' });
    });

    it('empty string is OK if oneOf allows it', () => {
      vtu.expectValidatorSuccess(val, '', undefined, { oneOf: '' });
      vtu.expectValidatorSuccess(val, '', qualifiers.EXPECTED, { oneOf: '' });
      vtu.expectValidatorSuccess(val, '', qualifiers.OPTIONAL, { oneOf: '' });
      vtu.expectValidatorSuccess(val, '', qualifiers.TRUTHY, { oneOf: '' });

      // null is not considered empty
      vtu.expectValidatorSuccess(val, null, qualifiers.EXPECTED, { oneOf: '' });

      vtu.expectValidatorSuccess(val, '', undefined, { oneOf: [''] });
      vtu.expectValidatorSuccess(val, '', qualifiers.EXPECTED, { oneOf: [''] });
      vtu.expectValidatorSuccess(val, '', qualifiers.OPTIONAL, { oneOf: [''] });
      vtu.expectValidatorSuccess(val, '', qualifiers.TRUTHY, { oneOf: [''] });
    });

    it('checks for an exact string in a list', () => {
      vtu.expectValidatorSuccess(val, '7', undefined, {
        oneOf: ['6', '7', '8'],
      });
      vtu.expectValidatorError(val, '7', undefined, { oneOf: ['6', '8'] });
      vtu.expectValidatorSuccess(val, '7', undefined, { oneOf: ['7'] });
      vtu.expectValidatorSuccess(val, '7', undefined, { oneOf: [] }); // ignored

      // ignores non-type values in a list
      vtu.expectValidatorError(val, '7', undefined, { oneOf: [null, 7, true] });

      // ignores non-arrays
      vtu.expectValidatorSuccess(val, '7', undefined, {
        oneOf: new Set(['6', '8']),
      });
    });

    it('checks for a partial value if "exact" is not specified', () => {
      vtu.expectValidatorSuccess(val, 'partial', undefined, { partial: 'art' });

      let args = { partial: 'foo' };
      vtu.expectValidatorError(val, 'partial', undefined, args);

      args = { oneOf: 'art', partial: 'art' };
      vtu.expectValidatorError(val, 'partial', undefined, args);
    });

    it('checks for min length if "exact" is not specified', () => {
      vtu.expectValidatorSuccess(val, 'minimum', undefined, { min: 7 });
      vtu.expectValidatorError(val, 'minimum', undefined, { min: 8 });

      vtu.expectValidatorSuccess(val, 'minimum', undefined, { min: -100 });

      // non-finite min values should be ignored
      vtu.expectValidatorSuccess(val, 'minimum', undefined, { min: '100' });
      vtu.expectValidatorSuccess(val, 'minimum', undefined, { min: NaN });
      vtu.expectValidatorSuccess(val, 'minimum', undefined, { min: Infinity });
      vtu.expectValidatorSuccess(val, 'minimum', undefined, { min: -Infinity });
    });

    it('empty string is allowed if min requires it', () => {
      vtu.expectValidatorSuccess(val, '', undefined, { min: 0 });
      vtu.expectValidatorSuccess(val, '', qualifiers.EXPECTED, { min: 0 });
      vtu.expectValidatorSuccess(val, '', qualifiers.OPTIONAL, { min: 0 });

      // null is OK because of EXPECTED
      vtu.expectValidatorSuccess(val, null, qualifiers.EXPECTED, { min: 1 });
    });

    it('empty string is allowed if qualifier=TRUTHY regardless of args', () => {
      vtu.expectValidatorSuccess(val, '', qualifiers.TRUTHY, { oneOf: 'foo' });
      vtu.expectValidatorSuccess(val, '', qualifiers.TRUTHY, { min: 1 });
      vtu.expectValidatorSuccess(val, '', qualifiers.TRUTHY, { exp: '^\\d+$' });
    });

    it('min takes precedence over partial', () => {
      vtu.expectValidatorSuccess(val, 'minimum', undefined, {
        min: 7,
        partial: 'nim',
      });
      vtu.expectValidatorError(val, 'minimum', undefined, {
        min: 8,
        partial: 'nim',
      });

      // min is ignored (less than 0) to partial wins, but there's no match
      vtu.expectValidatorError(val, 'minimum', undefined, {
        min: -100,
        partial: 'foo',
      });
      vtu.expectValidatorSuccess(val, 'minimum', undefined, {
        min: -1,
        partial: 'nim',
      });
    });

    it('checks for max length if "exact" is not specified', () => {
      vtu.expectValidatorSuccess(val, 'maximum', undefined, { max: 7 });
      vtu.expectValidatorError(val, 'maximum', undefined, { max: 6 });

      // non-finite max values should be ignored
      vtu.expectValidatorSuccess(val, 'maximum', undefined, { max: -100 });
      vtu.expectValidatorSuccess(val, 'maximum', undefined, { max: '1' });
      vtu.expectValidatorSuccess(val, 'maximum', undefined, { max: NaN });
      vtu.expectValidatorSuccess(val, 'maximum', undefined, { max: Infinity });
      vtu.expectValidatorSuccess(val, 'maximum', undefined, { max: -Infinity });
    });

    it('empty string is allowed if max requires it', () => {
      vtu.expectValidatorSuccess(val, '', undefined, { max: 0 });
      vtu.expectValidatorSuccess(val, '', qualifiers.EXPECTED, { max: 0 });
      vtu.expectValidatorSuccess(val, '', qualifiers.OPTIONAL, { max: 0 });
      vtu.expectValidatorSuccess(val, '', qualifiers.TRUTHY, { max: 0 });

      // null is OK because of EXPECTED
      vtu.expectValidatorSuccess(val, null, qualifiers.EXPECTED, { max: 0 });
    });

    it('max takes precedence over partial', () => {
      vtu.expectValidatorSuccess(val, 'maximum', undefined, {
        max: 7,
        partial: 'xim',
      });

      vtu.expectValidatorError(val, 'maximum', undefined, {
        max: 6,
        partial: 'xim',
      });
      vtu.expectValidatorError(val, 'maximum', undefined, {
        max: -100,
        partial: 'foo',
      });

      vtu.expectValidatorSuccess(val, 'maximum', undefined, {
        max: -1,
        partial: 'xim',
      });
    });

    it('checks for min/max length if "exact" is not specified', () => {
      vtu.expectValidatorSuccess(val, 'minandmax', undefined, {
        min: 9,
        max: 100,
      });
      vtu.expectValidatorSuccess(val, 'minandmax', undefined, {
        min: 9,
        max: 1,
      }); // max ignored
      vtu.expectValidatorSuccess(val, 'minandmax', undefined, {
        min: 9,
        max: 9,
      });

      vtu.expectValidatorError(val, 'minandmax', undefined, {
        min: 10,
        max: 100,
      });

      vtu.expectValidatorSuccess(val, 'minandmax', undefined, {
        min: -1,
        max: 100,
      });
      vtu.expectValidatorSuccess(val, 'minandmax', undefined, {
        min: -1,
        max: -1,
      });
    });

    it('min/max take precedence over partial', () => {
      vtu.expectValidatorSuccess(val, 'minandmax', undefined, {
        min: 9,
        max: 100,
        partial: 'and',
      });
      vtu.expectValidatorSuccess(val, 'minandmax', undefined, {
        min: 9,
        max: 9,
        partial: 'and',
      });

      // min takes precedence
      vtu.expectValidatorSuccess(val, 'minandmax', undefined, {
        min: 9,
        max: 1,
        partial: 'and',
      });

      vtu.expectValidatorSuccess(val, 'minandmax', undefined, {
        min: -1,
        max: 100,
        partial: 'and',
      });
      vtu.expectValidatorSuccess(val, 'minandmax', undefined, {
        min: -1,
        max: -1,
        partial: 'and',
      });

      vtu.expectValidatorError(val, 'minandmax', undefined, {
        min: 10,
        max: 100,
        partial: 'and',
      });
      vtu.expectValidatorError(val, 'minandmax', undefined, {
        min: -1,
        max: -1,
        partial: 'foo',
      });
    });

    it('checks for a given regular expression pattern', () => {
      vtu.expectValidatorSuccess(val, '2018-09-30', undefined, {
        exp: '\\d{4}-\\d{2}-\\d{2}',
      });
      vtu.expectValidatorError(val, 'asdf', undefined, { exp: '\\d+' });
      vtu.expectValidatorError(val, 'asdf', undefined, { exp: '[A-Z]+' });
      vtu.expectValidatorSuccess(val, 'asdf', undefined, {
        exp: '[A-Z]+',
        expFlags: 'i',
      });
    });

    it('empty string is allowed if exp requires it', () => {
      vtu.expectValidatorSuccess(val, '', undefined, { exp: '^$' });
      vtu.expectValidatorSuccess(val, '', qualifiers.EXPECTED, { exp: '^$' });
      vtu.expectValidatorSuccess(val, '', qualifiers.OPTIONAL, { exp: '^$' });
      vtu.expectValidatorSuccess(val, '', qualifiers.TRUTHY, { exp: '^$' });

      // null is OK because of EXPECTED
      vtu.expectValidatorSuccess(val, null, qualifiers.EXPECTED, { exp: '^$' });
    });

    it('oneOf, partial, min, max are ignored when exp specified', () => {
      vtu.expectValidatorSuccess(val, 'foo', undefined, {
        exp: 'foo',
        oneOf: 'bar',
        length: 5,
        min: 5,
        max: 1,
      });
    });
  });

  // Minimum Viable Value
  describe('mvv', () => {
    vtu.testMvvVerbatimType(val);
  });
});
