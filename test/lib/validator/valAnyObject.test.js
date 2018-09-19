import {expect} from 'chai';
import sinon from 'sinon';
import _ from 'lodash';

import * as vtu from '../validationTestUtil';
import types from '../../../src/lib/types';
import qualifiers from '../../../src/lib/qualifiers';
import * as val from '../../../src/lib/validator/valAnyObject';

describe('module: lib/validator/valAnyObject', function() {
  describe('validator', function() { // module, and value only
    it('#type', function() {
      expect(val.type).to.equal(types.ANY_OBJECT);
    });

    it('succeeds with an RtvSuccess', function() {
      vtu.expectValidatorSuccess(val, {});
    });

    it('should validate any object', function() {
      const validValues = vtu.getValidValues(); // @type {Object}
      const validTypes = Object.keys(validValues); // @type {Array}

      // remove primitives
      _.pull(validTypes, types.ANY, types.NULL, types.STRING, types.BOOLEAN,
          types.NUMBER, types.FINITE, types.INT, types.SAFE_INT, types.FLOAT,
          types.SYMBOL);

      let values = [];
      _.forEach(validTypes, function(type) {
        values = values.concat(validValues[type]);
      });

      expect(vtu.testValues(val.type, val.default, values).failures).to.eql([]);
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
    let checkStub;

    beforeEach(function() {
      checkStub = sinon.stub(val._impl, 'check');
    });

    afterEach(function() {
      checkStub.restore();
    });

    it('should ignore args if not a shape', function() {
      val.default({foo: 3}, undefined, 3);
      expect(checkStub.called).to.be.false;
    });

    it('should check value against shape', function() {
      checkStub.callThrough();

      vtu.expectValidatorSuccess(val, {foo: 3}, undefined, {foo: types.FINITE});
      expect(checkStub.called).to.be.true;

      checkStub.resetHistory();
      checkStub.callThrough();

      vtu.expectValidatorError(val, {foo: 3}, undefined, {foo: types.STRING}, {
        typeset: {foo: types.STRING},
        cause: [qualifiers.REQUIRED, types.STRING],
        path: ['foo']
      });
      expect(checkStub.called).to.be.true;
    });
  });
});