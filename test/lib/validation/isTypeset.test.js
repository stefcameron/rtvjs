import '../../../src/rtv'; // make sure all validators we might use in typesets get configured
import * as vtu from '../validationTestUtil';
import { print } from '../../../src/lib/util';
import { types, DEFAULT_OBJECT_TYPE } from '../../../src/lib/types';
import { qualifiers, DEFAULT_QUALIFIER } from '../../../src/lib/qualifiers';
import * as isShapeMod from '../../../src/lib/validation/isShape';
import {
  check as isTypeset,
  type as isTypesetType,
} from '../../../src/lib/validation/isTypeset';

describe('module: lib/validation/isTypeset', () => {
  it('#type', () => {
    expect(isTypesetType).toBeUndefined();
  });

  describe('#default', () => {
    describe('shallow', () => {
      let goodValues; // @type {Array}
      let badValues; // @type {Array}

      beforeEach(() => {
        goodValues = [
          { foo: null },
          types.STRING,
          [types.ANY],
          [[types.FLOAT]],
          function () {},
          [{ foo: types.STRING }],

          // ANY type is implied since there are no other types before the validator
          [DEFAULT_QUALIFIER, function () {}],

          // OBJECT type is implied since the shape descriptor is first immediately
          //  after the qualifier
          [DEFAULT_QUALIFIER, { foo: types.STRING }],

          // object type specified before shape that is not in first position after qualifier
          [
            DEFAULT_QUALIFIER,
            types.ANY,
            DEFAULT_OBJECT_TYPE,
            { $: { foo: types.STRING } },
          ],

          {}, // empty shapes are OK
          [types.PLAIN_OBJECT, { $: {} }],

          // an array with args
          [types.ARRAY, { min: 1, $: [types.FINITE] }],

          // since we aren't going deep, we should ignore the fact that the shape
          //  of the class object has a property with an invalid typeset
          [types.CLASS_OBJECT, { $: { foo: ['invalid-type'] } }],

          // should be fine as a class object without args (or a shape)
          types.CLASS_OBJECT,
          [types.CLASS_OBJECT],

          [types.HASH_MAP, { count: 2 }],
          [[{ foo: types.STRING }]],
          [[]], // inner array won't be validated since we aren't going deep
          [types.BOOLEAN, [types.FINITE]],

          // duplicate type
          [types.FUNCTION, types.FUNCTION],

          // two ARRAY types (i.e. duplicate types, but not as obvious)
          [types.ARRAY, [types.FINITE]],
          [types.ARRAY, { min: 1 }, [types.FINITE]],
        ];

        badValues = [
          undefined,
          null,
          1,
          /asdf/,
          Symbol('foo'),
          [],
          'invalid-type',
          true,
          false,

          // shape descriptor is not second after qualifier, and ANY does not
          //  take any args
          [DEFAULT_QUALIFIER, types.ANY, { foo: types.FINITE }],

          // invalid value type in typeset
          [Symbol('foo')],

          // invalid/unknown type in array typeset
          ['invalid-type'],

          // qualifier in wrong position
          [types.STRING, DEFAULT_QUALIFIER],

          // second object/shape is un-typed since it's not first in the array typeset
          [types.PLAIN_OBJECT, { $: {} }, { $: {} }],

          // cannot have more than one qualifier
          [qualifiers.REQUIRED, qualifiers.OPTIONAL, types.STRING],
          [qualifiers.REQUIRED, types.STRING, qualifiers.OPTIONAL],

          [DEFAULT_QUALIFIER, 'invalid-type'], // invalid type
          [DEFAULT_QUALIFIER, true], // invalid value type in typeset

          [[types.STRING], { $: types.FINITE }], // missing object type

          // second shape has no type
          [{}, {}],
        ];
      });

      it('should validate shallow typesets', () => {
        let results = vtu.testValues('isTypeset', isTypeset, goodValues);
        expect(results.failures).toEqual([]);

        results = vtu.testValues('isTypeset', isTypeset, badValues);
        expect(results.passes).toEqual([]);
      });

      it('should validate shallow fully-qualified typesets', () => {
        goodValues[0] = [DEFAULT_QUALIFIER, DEFAULT_OBJECT_TYPE, goodValues[0]];
        goodValues[1] = [DEFAULT_QUALIFIER, goodValues[1]];
        goodValues[2].unshift(DEFAULT_QUALIFIER);
        goodValues[3] = [
          DEFAULT_QUALIFIER,
          types.ARRAY,
          { $: goodValues[3][0] },
        ];
        goodValues[4] = [DEFAULT_QUALIFIER, types.ANY, goodValues[4]];

        // result: [DEFAULT_QUALIFIER, DEFAULT_OBJECT_TYPE, {foo: types.STRING}]
        goodValues[5] = [
          DEFAULT_QUALIFIER,
          DEFAULT_OBJECT_TYPE,
          goodValues[5][0],
        ];

        goodValues[6].splice(1, 0, types.STRING);
        goodValues[7].splice(1, 0, types.PLAIN_OBJECT);
        goodValues[9] = [DEFAULT_QUALIFIER, types.HASH_MAP, goodValues[9]];
        goodValues[10].unshift(DEFAULT_QUALIFIER);
        goodValues[11].unshift(DEFAULT_QUALIFIER);
        goodValues[12].unshift(DEFAULT_QUALIFIER);
        goodValues[13] = [DEFAULT_QUALIFIER, goodValues[13]];
        goodValues[14].unshift(DEFAULT_QUALIFIER);
        goodValues[15].unshift(DEFAULT_QUALIFIER);
        goodValues[16] = [
          DEFAULT_QUALIFIER,
          types.ARRAY,
          { $: goodValues[16][0] },
        ];
        goodValues[17] = [
          DEFAULT_QUALIFIER,
          types.ARRAY,
          { $: goodValues[17][0] },
        ];
        goodValues[18] = [
          DEFAULT_QUALIFIER,
          goodValues[18][0],
          types.ARRAY,
          { $: goodValues[18][1] },
        ];
        goodValues[19].unshift(DEFAULT_QUALIFIER);

        goodValues[20] = [
          DEFAULT_QUALIFIER,
          types.ARRAY,
          types.ARRAY,
          { $: [types.FINITE] },
        ];
        goodValues[21] = [
          DEFAULT_QUALIFIER,
          types.ARRAY,
          { min: 1 },
          types.ARRAY,
          {
            $: [types.FINITE],
          },
        ];

        let results = vtu.testValues('isTypeset', isTypeset, goodValues, {
          fullyQualified: true,
        });
        expect(results.failures).toEqual([]);

        badValues.push(
          // qualifier is always first
          [function () {}, DEFAULT_QUALIFIER, types.ANY],

          // only one validator
          [DEFAULT_QUALIFIER, types.ANY, function () {}, function () {}],

          // missing type (when not fully-qualified, then ANY is implied)
          [DEFAULT_QUALIFIER, function () {}],

          // validator must be last element
          [DEFAULT_QUALIFIER, types.STRING, function () {}, types.FINITE],

          // missing ARRAY type and args, and ARRAY shorthand notation is not
          //  supported in fully-qualified typesets
          [DEFAULT_QUALIFIER, [types.STRING]],

          // missing a type
          [DEFAULT_QUALIFIER]
        );

        results = vtu.testValues('isTypeset', isTypeset, badValues, {
          fullyQualified: true,
        });
        expect(results.passes).toEqual([]);
      });

      it('should indicate shape in failure message if failure at index 0', () => {
        const options = {};
        isTypeset([1], options);
        expect(options.rootCause).toContain(
          'Unexpected value at index=0: Expecting object (shape)'
        );
      });

      it('should indicate shape in failure message if failure at index 1 with qualifier', () => {
        const options = {};
        isTypeset([DEFAULT_QUALIFIER, 1], options);
        expect(options.rootCause).toContain(
          'Unexpected value at index=1: Expecting object (shape)'
        );
      });

      // eslint is being ridiculous about the indent here, maybe it's a bug?
      it(
        'should indicate type args in failure message if failure at index >1 or index 1 ' +
          'without qualifier',
        () => {
          let options = {};
          isTypeset([types.CLASS_OBJECT, 1], options);
          expect(options.rootCause).toContain(
            'Unexpected value at index=1: Expecting object (type args)'
          );

          options = {};
          isTypeset([DEFAULT_QUALIFIER, types.PLAIN_OBJECT, 1], options);
          expect(options.rootCause).toContain(
            'Unexpected value at index=2: Expecting object (type args)'
          );
        }
      );
    });

    describe('deep', () => {
      let goodValues; // @type {Array}
      let badValues; // @type {Array}

      beforeEach(() => {
        const shapeWithNonEnumerable = {
          foo: types.FUNCTION,
        };
        Object.defineProperty(shapeWithNonEnumerable, 'invalid', {
          value: null, // invalid typeset, but prop non-enumerable so shouldn't cause failure
        });

        const shapeWithProtoProp = (Object.create({
          invalid: null, // invalid typeset, but on prototype so shouldn't cause failure
        }).foo = types.JSON);

        goodValues = [
          { foo: types.FINITE },
          types.STRING,
          [types.ANY],
          function () {},
          [types.STRING, [types.STRING]],
          { foo: { bar: [types.STRING] } },

          // a shape with property 'foo' that's either an array of strings (maybe empty)
          //  or a finite number that is exactly 7
          { foo: [[types.STRING], types.FINITE, { oneOf: 7 }] },

          shapeWithNonEnumerable,
          shapeWithProtoProp,
          [types.CLASS_OBJECT, { $: { foo: [types.PLAIN_OBJECT] } }],

          // should be fine deep as a class object without args (or a shape)
          types.CLASS_OBJECT,
          [qualifiers.OPTIONAL, types.CLASS_OBJECT],

          [types.HASH_MAP, { count: 2 }],
          [types.ARRAY, { $: types.FINITE }],

          // duplicate type
          [{ foo: [types.FUNCTION, types.FUNCTION] }],
          // STRING type appears more than once in the nested (array) typeset
          [types.STRING, [types.STRING, types.STRING]],

          { foo: null }, // falsy values as shape property typesets are ignored
        ];

        badValues = [
          undefined,
          null,
          1,
          /asdf/,
          Symbol('foo'),
          true,
          false,
          [[]], // outer array typeset is OK, but inner one is not

          // 2 ARRAY types in one, and missing object type since object would
          //  be considered other args, not ARRAY args
          [types.ARRAY, [types.STRING], { $: types.FINITE }],

          // nested shape with an invalid type
          { foo: { bar: ['invalid-type'] } },

          // validator is not last element in deep-nested typeset
          [
            {
              foo: [
                {
                  bar: [{ baz: [types.STRING, function () {}, types.REGEXP] }],
                },
              ],
            },
          ],

          // for class object, we should be going deep into the shape property of
          //  the args object and finding the invalid typeset
          [
            types.CLASS_OBJECT,
            { $: { foo: [types.STRING, DEFAULT_QUALIFIER] } },
          ],

          // nested shape is not a shape
          [types.CLASS_OBJECT, { $: false }],

          // nested typeset has invalid value
          [types.ARRAY, { $: false }],
        ];
      });

      it('should validate deep typesets', () => {
        let results = vtu.testValues('isTypeset', isTypeset, goodValues, {
          deep: true,
        });
        expect(results.failures).toEqual([]);

        results = vtu.testValues('isTypeset', isTypeset, badValues, {
          deep: true,
        });
        expect(results.passes).toEqual([]);
      });

      it('should validate deep fully-qualified typesets', () => {
        goodValues[0].foo = [DEFAULT_QUALIFIER, goodValues[0].foo];
        goodValues[0] = [DEFAULT_QUALIFIER, DEFAULT_OBJECT_TYPE, goodValues[0]];

        goodValues[1] = [DEFAULT_QUALIFIER, goodValues[1]];
        goodValues[2].unshift(DEFAULT_QUALIFIER);
        goodValues[3] = [DEFAULT_QUALIFIER, types.ANY, goodValues[3]];

        goodValues[4][1].unshift(DEFAULT_QUALIFIER);
        goodValues[4][1] = { $: goodValues[4][1] };
        goodValues[4].splice(1, 0, types.ARRAY);
        goodValues[4].unshift(DEFAULT_QUALIFIER);

        goodValues[5].foo.bar.unshift(DEFAULT_QUALIFIER);
        goodValues[5].foo = [
          DEFAULT_QUALIFIER,
          DEFAULT_OBJECT_TYPE,
          goodValues[5].foo,
        ];
        goodValues[5] = [DEFAULT_QUALIFIER, DEFAULT_OBJECT_TYPE, goodValues[5]];

        goodValues[6].foo[0].unshift(DEFAULT_QUALIFIER);
        goodValues[6].foo[0] = { $: goodValues[6].foo[0] };
        goodValues[6].foo.unshift(DEFAULT_QUALIFIER, types.ARRAY);
        goodValues[6] = [DEFAULT_QUALIFIER, DEFAULT_OBJECT_TYPE, goodValues[6]];

        goodValues[7].foo = [DEFAULT_QUALIFIER, types.ANY, goodValues[7].foo];
        goodValues[7] = [DEFAULT_QUALIFIER, DEFAULT_OBJECT_TYPE, goodValues[7]];

        goodValues[8] = [DEFAULT_QUALIFIER, DEFAULT_OBJECT_TYPE, goodValues[8]];

        goodValues[9][1].$.foo.unshift(DEFAULT_QUALIFIER);
        goodValues[9].unshift(DEFAULT_QUALIFIER);

        goodValues[10] = [DEFAULT_QUALIFIER, goodValues[10]];
        // goodValues[11] is already FQ
        goodValues[12].unshift(DEFAULT_QUALIFIER);

        goodValues[13][1].$ = [DEFAULT_QUALIFIER, goodValues[13][1].$];
        goodValues[13].unshift(DEFAULT_QUALIFIER);

        goodValues[14][0].foo.unshift(DEFAULT_QUALIFIER);
        goodValues[14] = [
          DEFAULT_QUALIFIER,
          DEFAULT_OBJECT_TYPE,
          ...goodValues[14],
        ];

        goodValues[15] = [
          DEFAULT_QUALIFIER,
          types.STRING,
          types.ARRAY,
          {
            $: [DEFAULT_QUALIFIER, types.STRING, types.STRING],
          },
        ];

        goodValues[16] = [DEFAULT_QUALIFIER, types.OBJECT, goodValues[16]];

        let results = vtu.testValues('isTypeset', isTypeset, goodValues, {
          deep: true,
          fullyQualified: true,
        });
        expect(results.failures).toEqual([]);

        badValues.push(
          // foo has invalid typeset
          [
            DEFAULT_QUALIFIER,
            types.CLASS_OBJECT,
            {
              $: {
                foo: [types.STRING, DEFAULT_QUALIFIER],
              },
            },
          ],

          [
            DEFAULT_QUALIFIER,
            DEFAULT_OBJECT_TYPE,
            {
              $: {
                foo: [
                  DEFAULT_QUALIFIER,
                  DEFAULT_OBJECT_TYPE,
                  {
                    $: {
                      bar: [
                        DEFAULT_QUALIFIER,
                        DEFAULT_OBJECT_TYPE,
                        {
                          // validator is not last element here
                          $: {
                            baz: [
                              DEFAULT_QUALIFIER,
                              types.STRING,
                              function () {},
                              types.REGEXP,
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],

          [
            DEFAULT_QUALIFIER,
            types.ARRAY,
            { $: [DEFAULT_QUALIFIER, 'invalid-type'] },
          ]
        );

        results = vtu.testValues('isTypeset', isTypeset, badValues, {
          deep: true,
          fullyQualified: true,
        });
        expect(results.passes).toEqual([]);
      });

      it('should fail if the given type args are not a valid shape', () => {
        expect(isTypeset([types.PLAIN_OBJECT, { $: 1 }], { deep: true })).toBe(
          false
        );
      });

      it('should fail without index in failure message when deep-validating a non-qualified shape', () => {
        // NOTE: a little contrived, but the logic in the inner deepVerifyShape()
        //  function should cover the case where the index isn't needed because it
        //  shouldn't depend on the caller having checked that the value is a shape,
        //  but in the case of a shape descriptor typeset, the caller must also
        //  check that it's a shape...
        let count = 0;
        const isShapeStub = jest
          .spyOn(isShapeMod, 'check')
          .mockClear()
          .mockImplementation(function () {
            count++;
            return count < 3;
          });

        const options = { deep: true };
        expect(isTypeset({}, options)).toBe(false);
        expect(options.rootCause).toEqual(
          expect.stringContaining(
            `Expecting a valid shape descriptor for type="${types.OBJECT}"`
          )
        );

        isShapeStub.mockRestore();
      });
    });

    describe('other', () => {
      it('should not allow more than 1 custom validator', () => {
        expect(isTypeset(function () {})).toBe(true);
        expect(isTypeset([function () {}])).toBe(true);
        expect(isTypeset([types.STRING, function () {}])).toBe(true);

        // too many
        expect(isTypeset([function () {}, function () {}])).toBe(false);
        expect(isTypeset([types.STRING, function () {}, function () {}])).toBe(
          false
        );
        expect(
          isTypeset([types.STRING, [function () {}, function () {}]], {
            deep: true,
          })
        ).toBe(false);
        expect(
          isTypeset(
            [
              DEFAULT_QUALIFIER,
              types.STRING,
              [DEFAULT_QUALIFIER, function () {}, function () {}],
            ],
            { deep: true, fullyQualified: true }
          )
        ).toBe(false);
      });

      it('should not validate with only the qualifier', () => {
        expect(isTypeset(DEFAULT_QUALIFIER)).toBe(false);
        expect(isTypeset([])).toBe(false);
        expect(isTypeset([DEFAULT_QUALIFIER])).toBe(false);
      });

      vtu.getFalsyValues().forEach((falsyValue) => {
        it(`should ignore shape property typesets when set to falsy value |${print(
          falsyValue
        )}|`, () => {
          expect(isTypeset({ foo: falsyValue }, { deep: true })).toBe(true);
        });
      });
    });
  });
});
