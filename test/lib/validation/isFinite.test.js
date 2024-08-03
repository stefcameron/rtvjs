import _ from 'lodash-es';

import '../../../src/rtv'; // make sure all validators we might use in typesets get configured
import * as vtu from '../validationTestUtil';
import { types } from '../../../src/lib/types';
import * as val from '../../../src/lib/validation/isFinite';

describe('module: lib/validation/isFinite', () => {
  it('#type', () => {
    expect(val.type).toBe(types.FINITE);
  });

  describe('#default', () => {
    it('valid values', () => {
      expect(vtu.testValues(val.type, val.check).failures).toEqual([]);
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
      expect(vtu.testValues(val.type, val.check, invalidValues).passes).toEqual(
        []
      );
    });
  });
});
