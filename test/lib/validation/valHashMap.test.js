import {expect} from 'chai';
import _ from 'lodash';

import * as vtu from '../validationTestUtil';
import types from '../../../src/lib/types';
import qualifiers from '../../../src/lib/qualifiers';
import * as val from '../../../src/lib/validator/valHashMap';

/* eslint-disable no-new-wrappers */

describe('module: lib/validator/valHashMap', function() {
  describe('validator', function() { // module, and value only
    it('#type', function() {
      expect(val.type).to.equal(types.HASH_MAP);
    });

    it('succeeds with an RtvSuccess', function() {
      vtu.expectValidatorSuccess(val, {foo: 'bar'});
    });

    it('valid values', function() {
      expect(vtu.testValues(val.type, val.default).failures).to.eql([]);
    });

    it('other types/values', function() {
      const validValues = vtu.getValidValues(); // @type {Object}
      const validTypes = Object.keys(validValues); // @type {Array}
      const overlaps = [
        types.ANY_OBJECT,
        types.OBJECT,
        types.PLAIN_OBJECT,
        types.CLASS_OBJECT,
        types.HASH_MAP
      ];

      // remove overlaps
      _.pullAll(validTypes, overlaps);

      let invalidValues = [];
      _.forEach(validTypes, function(type) {
        invalidValues = invalidValues.concat(validValues[type]);
      });

      // add some non-overlap values back in
      invalidValues = invalidValues.concat([
        new String('new-string'),
        new Boolean(true),
        new Boolean(false),
        new Number(1)
      ]);

      // nothing should pass
      expect(vtu.testValues(val.type, val.default, invalidValues).passes).to.eql([]);
    });
  });

  describe('qualifiers', function() {
    describe('rules are supported', function() {
      it('REQUIRED (other than values previously tested)', function() {
        vtu.expectValidatorError(val, undefined, qualifiers.REQUIRED);
        vtu.expectValidatorError(val, null, qualifiers.REQUIRED);
      });

      it('EXPECTED', function() {
        vtu.expectValidatorError(val, undefined, qualifiers.EXPECTED);
        vtu.expectValidatorSuccess(val, null, qualifiers.EXPECTED);
      });

      it('OPTIONAL', function() {
        vtu.expectValidatorSuccess(val, undefined, qualifiers.OPTIONAL);
        vtu.expectValidatorSuccess(val, null, qualifiers.OPTIONAL);
      });
    });

    describe('are used in error typesets', function() {
      it('DEFAULT', function() {
        vtu.expectValidatorError(val, 1); // default should be REQUIRED
      });

      it('REQUIRED', function() {
        vtu.expectValidatorError(val, 1, qualifiers.REQUIRED);
      });

      it('EXPECTED', function() {
        vtu.expectValidatorError(val, 1, qualifiers.EXPECTED);
      });

      it('OPTIONAL', function() {
        vtu.expectValidatorError(val, 1, qualifiers.OPTIONAL);
      });
    });
  });

  describe('arguments', function() {
    let map;

    beforeEach(function() {
      map = {
        '1': 'one',
        '2': 'two',
        '3': 'three'
      };
    });

    it('checks for an exact length', function() {
      vtu.expectValidatorSuccess(val, {}, undefined, {length: 0});
      vtu.expectValidatorSuccess(val, map, undefined, {length: 3});

      vtu.expectValidatorError(val, map, undefined, {length: 2});
      vtu.expectValidatorError(val, map, undefined, {length: 1.1});
      vtu.expectValidatorError(val, map, undefined, {length: -0});

      // all these lengths should be ignored
      vtu.expectValidatorSuccess(val, map, undefined, {length: '1'});
      vtu.expectValidatorSuccess(val, map, undefined, {length: -1});
      vtu.expectValidatorSuccess(val, map, undefined, {length: NaN});
      vtu.expectValidatorSuccess(val, map, undefined, {length: Infinity});
      vtu.expectValidatorSuccess(val, map, undefined, {length: -Infinity});
      vtu.expectValidatorSuccess(val, map, undefined, {length: Number.POSITIVE_INFINITY});
      vtu.expectValidatorSuccess(val, map, undefined, {length: Number.NEGATIVE_INFINITY});
    });

    it('checks for string keys that match a pattern', function() {
      map = {key1: 1, key2: 2};

      vtu.expectValidatorSuccess(val, map, undefined, {
        keyExp: 'key\\d'
      });
      vtu.expectValidatorSuccess(val, map, undefined, {
        keyExp: function() {} // ignored: not string
      });

      vtu.expectValidatorSuccess(val, map, undefined, {
        keyExp: 'KEY\\d',
        keyFlagSpec: 'i' // case-insensitive flag
      });

      let args = {
        keyExp: 'KEY\\d'
      };
      vtu.expectValidatorError(val, map, undefined, args, {
        path: ['key="key1"'],
        cause: [qualifiers.REQUIRED, types.HASH_MAP, args]
      }); // case-sensitive by default

      args = {
        keyExp: 'KEY\\d',
        keyFlagSpec: {} // ignored: not string (so still case-sensitive)
      };
      vtu.expectValidatorError(val, map, undefined, args, {
        path: ['key="key1"'],
        cause: [qualifiers.REQUIRED, types.HASH_MAP, args]
      });
    });

    it('checks for values with specified typeset', function() {
      vtu.expectValidatorSuccess(val, map, undefined, {
        values: types.STRING
      });

      let args = {values: types.BOOLEAN};
      vtu.expectValidatorError(val, map, undefined, args, {
        path: ['valueKey="1"'],
        cause: [qualifiers.REQUIRED, types.BOOLEAN]
      });

      map[3] = '';

      args = {
        values: types.STRING // required by default, so will fail
      };
      vtu.expectValidatorError(val, map, undefined, args, {
        path: ['valueKey="3"'],
        cause: [qualifiers.REQUIRED, types.STRING]
      });

      vtu.expectValidatorSuccess(val, map, undefined, {
        values: [qualifiers.EXPECTED, types.STRING]
      });
    });

    it('checks for keys and values with specified typeset', function() {
      map[1] = {a: true};
      map[2] = {b: false};
      map[3] = {c: true};

      vtu.expectValidatorSuccess(val, map, undefined, {
        keyExp: '\\d',
        values: [types.HASH_MAP, {
          keyExp: '\\w',
          values: types.BOOLEAN
        }]
      });

      // keys in nested maps are not strings of >= 2 chars
      const valuesTypeset = [types.HASH_MAP, {
        keyExp: '\\w{2,}',
        values: types.BOOLEAN
      }];
      const args = {
        keyExp: '\\d',
        values: valuesTypeset
      };
      vtu.expectValidatorError(val, map, undefined, args, {
        path: ['valueKey="1"'],
        cause: [qualifiers.REQUIRED, types.HASH_MAP, valuesTypeset[1]]
      });
    });
  });
});