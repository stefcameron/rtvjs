import {expect} from 'chai';

import * as vtu from './validationTestUtil';
import types from '../../../src/lib/types';
import * as val from '../../../src/lib/validation/isRegExp';

describe('module: lib/validation/isRegExp', function() {
  describe('validator', function() {
    it('type', function() {
      expect(val.type).to.equal(types.REGEXP);
    });

    it('valid values', function() {
      expect(vtu.testValues(val.type, val.validator).failures).to.eql([]);
    });

    it('other types/values', function() {
      expect(vtu.testOtherValues(val.type, val.validator)).to.eql([]);
    });
  });
});
