import '../../../src/rtv'; // make sure all validators we might use in typesets get configured
import * as vtu from '../validationTestUtil';
import { print } from '../../../src/lib/util';
import { types } from '../../../src/lib/types';
import { qualifiers } from '../../../src/lib/qualifiers';
import { check as isMap } from '../../../src/lib/validation/isMap';
import * as val from '../../../src/lib/validator/valMap';

describe('module: lib/validator/valMap', () => {
  describe('validator', () => {
    // module, and value only
    it('#type', () => {
      expect(val.type).toBe(types.MAP);
    });

    it('succeeds with an RtvSuccess', () => {
      vtu.expectValidatorSuccess(val, new Map());
    });

    it('valid values', () => {
      expect(vtu.testValues(val.type, val.validate).failures).toEqual([]);
    });

    it('other types/values', () => {
      expect(vtu.testOtherValues(val.type, val.validate)).toEqual([]);
    });
  });

  describe('qualifiers', () => {
    describe('rules are supported', () => {
      it('REQUIRED (other than values previously tested)', () => {
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
        const restrictedValues = vtu.getRestrictedValues(qualifiers.EXPECTED);
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
        const restrictedValues = vtu.getRestrictedValues(qualifiers.OPTIONAL);
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
    it('checks for an exact length', () => {
      const map = new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]);

      vtu.expectValidatorSuccess(val, new Map(), undefined, { length: 0 });
      vtu.expectValidatorSuccess(val, map, undefined, { length: 3 });

      vtu.expectValidatorError(val, map, undefined, { length: 2 });
      vtu.expectValidatorError(val, map, undefined, { length: 1.1 });
      vtu.expectValidatorError(val, map, undefined, { length: -0 });

      // all these lengths should be ignored
      vtu.expectValidatorSuccess(val, map, undefined, { length: '1' });
      vtu.expectValidatorSuccess(val, map, undefined, { length: -1 });
      vtu.expectValidatorSuccess(val, map, undefined, { length: NaN });
      vtu.expectValidatorSuccess(val, map, undefined, { length: Infinity });
      vtu.expectValidatorSuccess(val, map, undefined, { length: -Infinity });
      vtu.expectValidatorSuccess(val, map, undefined, {
        length: Number.POSITIVE_INFINITY,
      });
      vtu.expectValidatorSuccess(val, map, undefined, {
        length: Number.NEGATIVE_INFINITY,
      });
    });

    it('checks for keys with specified typeset', () => {
      const map = new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]);

      vtu.expectValidatorSuccess(val, map, undefined, { $keys: types.FINITE });

      vtu.expectValidatorError(
        val,
        map,
        undefined,
        { $keys: types.STRING },
        {
          path: ['key=1'],
          mismatch: [qualifiers.REQUIRED, types.STRING],
        }
      );

      vtu.expectValidatorSuccess(val, new Map(), undefined, {
        $keys: types.REGEXP,
      });
    });

    it('checks for string keys that match a pattern', () => {
      let map = new Map([
        [1, 'one'],
        [2, 'two'],
      ]);

      vtu.expectValidatorSuccess(val, map, undefined, {
        $keys: types.FINITE,
        keyExp: 'key', // ignored: keys aren't expected to be strings
      });

      map = new Map([
        ['key1', 1],
        ['key2', 2],
      ]);
      let args = { $keys: types.FINITE };

      vtu.expectValidatorError(val, map, undefined, args, {
        path: ['key="key1"'],
        mismatch: [qualifiers.REQUIRED, types.FINITE],
      }); // keys are not numbers in this map

      vtu.expectValidatorSuccess(val, map, undefined, {
        $keys: types.STRING,
        keyExp: 'key\\d',
      });
      vtu.expectValidatorSuccess(val, map, undefined, {
        $keys: types.STRING,
        keyExp: function () {}, // ignored: not string
      });
      vtu.expectValidatorSuccess(val, map, undefined, {
        $keys: [types.STRING],
        keyExp: 'key\\d',
      });
      vtu.expectValidatorSuccess(val, map, undefined, {
        $keys: [qualifiers.EXPECTED, types.STRING],
        keyExp: 'key\\d',
      });

      args = {
        $keys: [qualifiers.EXPECTED, types.STRING],
        keyExp: 'KEY\\d',
      };
      vtu.expectValidatorError(val, map, undefined, args, {
        path: ['key="key1"'],
        mismatch: [qualifiers.REQUIRED, types.MAP, args],
      }); // case-sensitive by default

      vtu.expectValidatorSuccess(val, map, undefined, {
        $keys: [qualifiers.EXPECTED, types.STRING],
        keyExp: 'KEY\\d',
        keyFlags: 'i', // case-insensitive flag
      });

      args = {
        $keys: [qualifiers.EXPECTED, types.STRING],
        keyExp: 'KEY\\d',
        keyFlags: {}, // ignored: not string (so still case-sensitive)
      };
      vtu.expectValidatorError(val, map, undefined, args, {
        path: ['key="key1"'],
        mismatch: [qualifiers.REQUIRED, types.MAP, args],
      });
    });

    it('checks for values with specified typeset', () => {
      let map = new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]);

      vtu.expectValidatorSuccess(val, map, undefined, {
        $values: types.STRING,
      });

      let args = { $values: types.BOOLEAN };
      vtu.expectValidatorError(val, map, undefined, args, {
        path: ['valueKey=1'],
        mismatch: [qualifiers.REQUIRED, types.BOOLEAN],
      });

      map = new Map([
        [1, 'one'],
        [2, 'two'],
        [3, ''],
      ]);

      args = {
        $values: types.STRING, // required by default, so will fail
      };
      vtu.expectValidatorError(val, map, undefined, args, {
        path: ['valueKey=3'],
        mismatch: [qualifiers.REQUIRED, types.STRING],
      });

      vtu.expectValidatorSuccess(val, map, undefined, {
        $values: [qualifiers.EXPECTED, types.STRING],
      });
    });

    it('checks for keys and values with specified typeset', () => {
      const map = new Map([
        [1, new Map([['a', true]])],
        [2, new Map([['b', false]])],
        [3, new Map([['c', true]])],
      ]);

      vtu.expectValidatorSuccess(val, map, undefined, {
        $keys: types.FINITE,
        $values: [
          types.MAP,
          {
            $keys: types.STRING,
            $values: types.BOOLEAN,
          },
        ],
      });

      // keys in nested maps are not strings of >= 2 chars
      const valuesTypeset = [
        types.MAP,
        {
          $keys: [types.STRING, { min: 2 }],
          $values: types.BOOLEAN,
        },
      ];
      const args = {
        $keys: types.FINITE,
        $values: valuesTypeset,
      };
      vtu.expectValidatorError(val, map, undefined, args, {
        path: ['valueKey=1', 'key="a"'],
        mismatch: [qualifiers.REQUIRED, types.STRING, { min: 2 }],
      });
    });

    vtu.getFalsyValues().forEach((falsyValue) => {
      it(`ignores unspecified $values shape property typesets set to falsy value |${print(
        falsyValue
      )}|`, () => {
        const map = new Map([
          [
            { keyNumber: 1, keyString: true },
            { valueNumber: 1, valueString: true },
          ],
          [
            { keyNumber: 2, keyString: false },
            { valueNumber: 2, valueString: false },
          ],
          [
            { keyNumber: 3, keyString: true },
            { valueNumber: 3, valueString: true },
          ],
        ]);

        const args = {
          $keys: {
            keyNumber: types.NUMBER,
            keyString: falsyValue,
          },
          $values: {
            valueNumber: types.NUMBER,
            valueString: falsyValue,
          },
        };

        vtu.expectValidatorSuccess(val, map, undefined, args);
      });
    });
  });

  describe('context', () => {
    it('should set parent to Map and parentKey to undefined for keys', () => {
      const validator = jest.fn();
      const value = new Map([['key', 'bar']]);
      val.validate(value, undefined, { $keys: validator });

      expect(validator).toHaveBeenCalledTimes(1);
      expect(validator.mock.calls[0]).toEqual([
        'key',
        [qualifiers.REQUIRED, types.ANY],
        validator,
        { originalValue: value, parent: value, parentKey: undefined },
      ]);
    });

    it('should set parent to Map and parentKey to key for values', () => {
      const validator = jest.fn();
      const value = new Map([['key', 'bar']]);
      val.validate(value, undefined, { $values: validator });

      expect(validator).toHaveBeenCalledTimes(1);
      expect(validator.mock.calls[0]).toEqual([
        'bar',
        [qualifiers.REQUIRED, types.ANY],
        validator,
        { originalValue: value, parent: value, parentKey: 'key' },
      ]);
    });
  });

  // Minimum Viable Value
  describe('mvv', () => {
    it('interprets original value as Map', () => {
      const value = new Map([['key', 'value']]);
      const result = val.validate(value);
      expect(result.mvv).not.toBe(value);
      expect(isMap(result.mvv)).toBe(true);
    });

    it('interprets falsy values verbatim', () => {
      vtu.getFalsyValues().forEach((falsyValue) => {
        const result = val.validate(falsyValue, qualifiers.TRUTHY);
        if (isNaN(falsyValue)) {
          // ${print(falsyValue)} verbatim
          expect(isNaN(result.mvv)).toBe(true);
        } else {
          // ${print(falsyValue)} verbatim
          expect(result.mvv).toBe(falsyValue);
        }
      });
    });

    it('reduces the original value', () => {
      const map = new Map([
        [
          { key: 1, foo: 1 },
          { value: 1, foo: 1 },
        ],
        [
          { key: 2, foo: 2 },
          { value: 2, foo: 2 },
        ],
      ]);

      const result = val.validate(map, undefined, {
        $keys: {
          key: types.SAFE_INT,
        },
        $values: {
          value: types.SAFE_INT,
        },
      });

      expect(Array.from(result.mvv.entries())).toEqual([
        [{ key: 1 }, { value: 1 }],
        [{ key: 2 }, { value: 2 }],
      ]);
    });
  });
});
