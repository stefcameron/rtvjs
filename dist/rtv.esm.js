/*!
 * rtv 0.0.1
 * @license MIT, https://gitlab.com/stefcameron/rtvjs/blob/master/LICENSE.md
 * Parts of Lodash used internally: https://github.com/lodash/lodash/
 */
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
}

var version = "0.0.1";

//// Type Definitions \\\\

'use strict';

/**
 * Types
 *
 * <h4>Primitives</h4>
 *
 * In RTV.js, a primitive is considered to be one of the following types:
 *
 * - `string` (note that `new String('s')` does not produce a _primitive_, it
 *   produces an _object_, and should generally be avoided).
 * - `boolean` (note that `new Boolean(true)` does not produce a _primitive_,
 *   it produces an _object_, and should generally be avoided).
 * - `number` (note that `new Number(1)` does not produce a _primitive_,
 *   it produces an _object_, and should generally be avoided).
 * - `Symbol`
 * - `null`
 * - `undefined`
 *
 * <h4>Rules Per Qualifiers</h4>
 *
 * {@link rtv.qualifiers Qualifiers} state basic rules. Unless otherwise stated,
 *  every type herein abides by those basic rules. Each type will also impose
 *  additional rules specific to the type of value it represents.
 *
 * For example, while the {@link rtv.types.FINITE FINITE} type states that the
 *  value must not be `NaN`, `+Infinity`, nor `-Infinity`, it could be `null` if
 *  the qualifier used is `EXPECTED`, and it could be `undefined` if the qualifier
 *  used is `OPTIONAL`.
 *
 * <h4>Arguments</h4>
 *
 * Some types will accept, or may even expect, arguments. An argument immediately
 *  follows the type in the description, such as `PLAIN_OBJECT, {hello: STRING}`.
 *  This would specify that the value must be a {@link rtv.types.PLAIN_OBJECT plain object}
 *  with a shape that includes a property named 'hello', that property being a
 *  {@link rtv.qualifiers.REQUIRED required} {@link rtv.types.STRING string}.
 *
 * Optional and required arguments are specified for each type, where applicable.
 *
 * @namespace rtv.types
 */

/**
 * Collection Descriptor
 *
 * Describes the keys and values in a collection-based object, which is one of
 *  the following types:
 *
 * - {@link rtv.types.MAP_OBJECT MAP_OBJECT}
 * - {@link rtv.types.MAP MAP}
 * - {@link rtv.types.WEAK_MAP WEAK_MAP}
 * - {@link rtv.types.SET SET} (with some exceptions)
 * - {@link rtv.types.WEAK_SET WEAK_SET} (with some exceptions)
 *
 * Note that an {@link rtv.types.ARRAY ARRAY} is __not__ included in this list
 *  because the array type has special syntax for describing the type of its items.
 *
 * For example, the following descriptors both verify a collection of 3-letter
 *  string keys (upper- or lowercase) to finite numbers:
 *
 * - `{keyExp: '[a-z]{3}', keyExpFlags: 'i', values: rtv.types.FINITE}`
 * - `{keyExp: '[a-zA-Z]{3}', values: rtv.types.FINITE}`
 *
 * @typedef {Object} rtv.types.collection_descriptor
 * @property {rtv.types.typeset} [keys] Optional. A typeset describing each key
 *  in the collection.
 *
 * The type of collection being described may restrict the types that this typeset
 *  can include. For example, the {@link rtv.types.MAP_OBJECT MAP_OBJECT} collection
 *  only supports the {@link rtv.types.STRING STRING} type due to the nature of
 *  its JavaScript Object-based implementation.
 *
 * NOTE: This property is ignored when the collection is a {@link rtv.types.SET SET}
 *  or a {@link rtv.types.WEAK_SET WEAK_SET} because sets do not have keys.
 *
 * @property {String} [keyExp] Optional. A string-based regular expression
 *  describing the names of keys (own-enumerable properties) found in the
 *  collection.
 *
 * By default, there are no restrictions on key names. This expression is only
 *  used if the `keys` typeset includes the {@link rtv.types.STRING STRING} type.
 *
 * For example, to require numerical keys, the following expression could be
 *  used: `'^\\d+$'`.
 *
 * NOTE: This property is ignored when the collection is a {@link rtv.types.SET SET}
 *  or a {@link rtv.types.WEAK_SET WEAK_SET} because sets do not have keys.
 *
 * @property {String} [keyExpFlags] Optional. A string specifying any flags to use
 *  with the regular expression specified in `keyExp`. If this property is _falsy_,
 *  default `RegExp` flags will be used. Ignored if `keyExp` is not specified, or
 *  does not apply per the `keys` typeset.
 *
 * NOTE: This property is ignored when the collection is a {@link rtv.types.SET SET}
 *  or a {@link rtv.types.WEAK_SET WEAK_SET} because sets do not have keys.
 *
 * @property {rtv.types.typeset} [values] Optional. A typeset describing each value
 *  in the collection. Defaults to the {@link rtv.types.ANY ANY} type which allows
 *  _anything_. All values must match this typeset (but the collection is not
 *  required to have any entries/properties to be considered valid, unless
 *  `count` is specified).
 *
 * For example, to require arrays of non-empty string values, the following
 *  typeset could be used: `[[types.STRING]]`.
 *
 * @property {number} [count=-1] Optional. The number of entries expected in
 *  the collection. A negative value allows for any number of entries. Zero
 *  requires an empty collection.
 *
 * @see rtv.types.MAP_OBJECT
 * @see rtv.types.MAP
 * @see rtv.types.WEAK_MAP
 * @see rtv.types.SET
 * @see rtv.types.WEAK_SET
 */

/**
 * Typeset
 *
 * Describes a property found in a {@link rtv.shape_descriptor shape descriptor}.
 *  It can be any one of the following JavaScript values:
 *
 * - `String '<type>'`: For a single type, such as {@link rtv.types.FINITE 'FINITE'}
 *   for a finite number.
 * - `Array []`: For multiple type possibilities, using an OR conjunction, which
 *   means the value of the property being described must be one of the types listed.
 *   Note that when a nested array is encountered (i.e. an array within a typeset),
 *   it is treated as the shortcut {@link rtv.types.ARRAY ARRAY} form, implying an
 *   array of values of some type, e.g. `values: [[STRING, FINITE]]` would describe
 *   a 'values' property that could be an array of non-empty strings or finite numbers.
 * - `Object {}`: For a nested {@link rtv.shape_descriptor shape descriptor} of implied
 *   {@link rtv.types.OBJECT OBJECT} type (unless qualified with a specific object
 *   type like {@link rtv.types.PLAIN_OBJECT PLAIN_OBJECT}, for example).
 * - `Function`: For a {@link rtv.types.property_validator property validator}
 *   that will certify the value of the property using custom code.
 *
 * <h4>Example</h4>
 *
 * <pre><code>
 * const contactShape = {
 *   name: rtv.types.STRING, // required, non-empty, string
 *   tags: [rtv.types.ARRAY, [rtv.types.STRING]], // required array of non-empty strings
 *   tags2: [[rtv.types.STRING]], // same as 'tags' but using shortcut array format
 *   details: { // required nested object of type `rtv.types.OBJECT` (default)
 *     birthday: [rtv.qualifiers.EXPECTED, rtv.types.DATE] // Date (could be null)
 *   },
 *   notes: [rtv.types.STRING, function(value) { // required non-empty string...
 *     return value.length < 500; // ...less than 500 characters long
 *   }]
 * };
 * </code></pre>
 *
 * @typedef {Object} rtv.types.typeset
 */

/**
 * Property Validator
 *
 * // TODO: document rtv.types.property_validator (already referenced)
 *
 * Note one disadvantage: cannot be de/serialized via JSON.
 *
 * @typedef {Function} rtv.types.property_validator
 */

/**
 * The any type is special in that it allows _anything_, which includes `null`
 *  and `undefined` values. Because of this, it's the most liberal in terms of
 *  types as well as qualifiers. A more specific type should be used whenever
 *  possible to ensure a higher degree of confidence in the value being validated.
 *
 * Any rules per qualifiers:
 *
 * - REQUIRED: Property must be defined _somewhere_ in the prototype chain, but
 *   its value can be anything, including `null` and `undefined`.
 * - EXPECTED: Same rules as REQUIRED.
 * - OPTIONAL: Since this qualifier removes the property's need for existence
 *   in the prototype chain, it renders the verification moot (i.e. the property
 *   might as well not be included in the {@link rtv.shape_descriptor shape descriptor}
 *   unless a {@link rtv.types.property_validator property validator} is being
 *   used to do customized verification.
 *
 * @name rtv.types.ANY
 * @const {String}
 * @see {@link rtv.qualifiers}
 */

var ANY = 'any';

/**
 * String rules per qualifiers:
 *
 * - REQUIRED: Must be a non-empty string.
 * - EXPECTED | OPTIONAL: Can be an empty string.
 *
 * @name rtv.types.STRING
 * @const {String}
 * @see {@link rtv.qualifiers}
 */
var STRING = 'string';

/**
 * Boolean rules per qualifiers: Must be a boolean.
 * @name rtv.types.BOOLEAN
 * @const {String}
 * @see {@link rtv.qualifiers}
 */
var BOOLEAN = 'boolean';

/**
 * Number rules per qualifiers:
 *
 * - REQUIRED: Cannot be `NaN`, but could be `+Infinity`, `-Infinity`.
 * - EXPECTED | OPTIONAL: Could be `NaN`, `+Infinity`, `-Infinity`.
 *
 * @name rtv.types.NUMBER
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.FINITE}
 */
var NUMBER = 'number';

/**
 * Symbol rules per qualifiers: Must be a symbol.
 * @name rtv.types.SYMBOL
 * @const {String}
 * @see {@link rtv.qualifiers}
 */
var SYMBOL = 'symbol';

/**
 * Finite rules per qualifiers: Cannot be `NaN`, `+Infinity`, `-Infinity`. The
 *  value can be either a safe integer or a {@link rtv.types.FLOAT floating point number}.
 * @name rtv.types.FINITE
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.NUMBER}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger Number.isSafeInteger()}
 */
var FINITE = 'finite';

/**
 * Int rules per qualifiers: Must be a {@link rtv.types.FINITE finite} integer,
 *  but is not necessarily _safe_.
 * @name rtv.types.INT
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.FINITE}
 * @see {@link rtv.types.FLOAT}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger Number.isSafeInteger()}
 */
var INT = 'int';

/**
 * Float rules per qualifiers: Must be a finite floating point number.
 * @name rtv.types.FLOAT
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.INT}
 */
var FLOAT = 'float';

/**
 * An _any_ object is anything that is not a {@link rtv.types primitive}, which
 *  means it includes the `Array` type, as well as functions and arguments. To
 *  test for an array, use the {@link rtv.types.ARRAY ARRAY} type. To
 *  test for a function, use the {@link rtv.types.FUNCTION FUNCTION} type.
 *
 * The following values are considered any objects:
 *
 * - `{}`
 * - `new Object()`
 * - `[]`
 * - `new Array()`
 * - `function(){}`
 * - `arguments` (function arguments)
 * - `new String('')`
 * - `new Boolean(true)`
 * - `new Number(1)`
 * - `/re/`
 * - `new RegExp('re')`
 * - `new function() {}` (class instance)
 * - `new Set()`
 * - `new WeakSet()`
 * - `new Map()`
 * - `new WeakMap()`
 *
 * The following values __are not__ considered any objects (because they are
 *  considered to be {@link rtv.types primitives}):
 *
 * - `Symbol('s')`
 * - `true`
 * - `1`
 * - `''`
 * - `null` (NOTE: `typeof null === 'object'` in JavaScript; the `ANY_OBJECT`
 *   type allows testing for this undesirable fact)
 * - `undefined`
 *
 * Any object rules per qualifiers:
 *
 * - REQUIRED: Per the lists above.
 * - EXPECTED: `null` is allowed.
 * - OPTIONAL: `undefined` is allowed.
 *
 * Arguments (optional):
 *
 * - A nested shape description.
 *
 * @name rtv.types.ANY_OBJECT
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.OBJECT}
 * @see {@link rtv.types.PLAIN_OBJECT}
 * @see {@link rtv.types.CLASS_OBJECT}
 * @see {@link rtv.types.MAP_OBJECT}
 */
var ANY_OBJECT = 'anyObject';

/**
 * An object is one that extends from `JavaScript.Object` and is not
 *  a {@link rtv.types.FUNCTION function}, {@link rtv.types.ARRAY array},
 *  {@link rtv.types.REGEXP regular expression}, function arguments object,
 *  {@link rtv.types.MAP map}, {@link rtv.types.WEAK_MAP weak map},
 *  {@link rtv.types.SET set}, {@link rtv.types.WEAK_SET weak set}, nor a
 *  {@link rtv.types primitive}.
 *
 * This is the __default__ (imputed) type for
 *  {@link rtv.shape_descriptor shape descriptors}, which means the object itself
 *  (the value being tested), prior to being checked against its shape, will be
 *  tested according to this type.
 *
 * The following values are considered objects:
 *
 * - `{}`
 * - `new Object()`
 * - `new String('')`
 * - `new Boolean(true)`
 * - `new Number(1)`
 * - `new function() {}` (class instance)
 *
 * The following values __are not__ considered objects:
 *
 * - `[]`
 * - `new Array()`
 * - `/re/`
 * - `new RegExp('re')`
 * - `function(){}`
 * - `arguments` (function arguments)
 * - `new Set()`
 * - `new WeakSet()`
 * - `new Map()`
 * - `new WeakMap()`
 * - `Symbol('s')`
 * - `true`
 * - `1`
 * - `''`
 * - `null`
 * - `undefined`
 *
 * Object rules per qualifiers:
 *
 * - REQUIRED: Per the lists above.
 * - EXPECTED: `null` is allowed.
 * - OPTIONAL: `undefined` is allowed.
 *
 * Arguments (optional):
 *
 * - A nested shape description.
 *
 * @name rtv.types.OBJECT
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.ANY_OBJECT}
 * @see {@link rtv.types.PLAIN_OBJECT}
 * @see {@link rtv.types.CLASS_OBJECT}
 * @see {@link rtv.types.MAP_OBJECT}
 */
var OBJECT = 'object';

/**
 * A _plain_ object is one that is created directly from the `Object` constructor,
 *  whether using `new Object()` or the literal `{}`.
 *
 * The following values are considered plain objects:
 *
 * - `{}`
 * - `new Object()`
 *
 * The following values __are not__ considered plain objects:
 *
 * - `[]`
 * - `new Array()`
 * - `function(){}`
 * - `arguments` (function arguments)
 * - `new String('')`
 * - `new Boolean(true)`
 * - `new Number(1)`
 * - `/re/`
 * - `new RegExp('re')`
 * - `new function() {}` (class instance)
 * - `new Set()`
 * - `new WeakSet()`
 * - `new Map()`
 * - `new WeakMap()`
 * - `Symbol('s')`
 * - `true`
 * - `1`
 * - `''`
 * - `null`
 * - `undefined`
 *
 * Plain object rules per qualifiers:
 *
 * - REQUIRED: Per the lists above.
 * - EXPECTED: `null` is allowed.
 * - OPTIONAL: `undefined` is allowed.
 *
 * Arguments (optional):
 *
 * - A nested shape description.
 *
 * @name rtv.types.PLAIN_OBJECT
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.ANY_OBJECT}
 * @see {@link rtv.types.OBJECT}
 * @see {@link rtv.types.CLASS_OBJECT}
 * @see {@link rtv.types.MAP_OBJECT}
 */
var PLAIN_OBJECT = 'plainObject';

/**
 * A _class_ object is one that is created by invoking the `new` operator on a
 *  function (other than a primitive type function), generating a new object,
 *  commonly referred to as a _class instance_. This object's prototype
 *  (`__proto__`) is a reference to that function's `prototype`.
 *
 * The following values are considered class objects:
 *
 * - `new function() {}`
 *
 * The following values __are not__ considered class objects:
 *
 * - `{}`
 * - `new Object()`
 * - `[]`
 * - `new Array()`
 * - `function(){}`
 * - `arguments` (function arguments)
 * - `new String('')`
 * - `new Boolean(true)`
 * - `new Number(1)`
 * - `/re/`
 * - `new RegExp('re')`
 * - `new Set()`
 * - `new WeakSet()`
 * - `new Map()`
 * - `new WeakMap()`
 * - `Symbol('s')`
 * - `true`
 * - `1`
 * - `''`
 * - `null`
 * - `undefined`
 *
 * Class object rules per qualifiers:
 *
 * - REQUIRED: Per the lists above.
 * - EXPECTED: `null` is allowed.
 * - OPTIONAL: `undefined` is allowed.
 *
 * Arguments (optional, specify one or the other, or both __in order__):
 *
 * - A reference to a constructor function. If specified, the class object
 *   (instance) must have this class function in its inheritance chain such
 *   that `<class_object> instanceof <function> === true`.
 * - A nested shape description.
 *
 * @name rtv.types.CLASS_OBJECT
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.ANY_OBJECT}
 * @see {@link rtv.types.OBJECT}
 * @see {@link rtv.types.PLAIN_OBJECT}
 * @see {@link rtv.types.MAP_OBJECT}
 */
var CLASS_OBJECT = 'classObject';

/**
 * A _map_ object is an {@link rtv.types.OBJECT OBJECT} that is treated as a
 *  hash map with an expected set of keys and values. Keys can be described
 *  using a regular expression, and values can be described using a
 *  {@link rtv.types.typeset typeset}. Empty maps are permitted.
 *
 * Map object rules per qualifiers: Same as {@link rtv.types.OBJECT OBJECT} rules.
 *
 * Argument (optional):
 *
 * - A {@link rtv.types.collection_descriptor collection descriptor} specifying
 *   the rules for the keys and/or values found in the map. If not specified,
 *   the default collection descriptor options apply. __NOTE:__ Since a map object
 *   is based on a JavaScript Object (which only supports string-based keys), the
 *   collection descriptor's `keys` type defaults to (and is required to be)
 *   {@link rtv.types.STRING STRING}.
 *
 * @name rtv.types.MAP_OBJECT
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.ANY_OBJECT}
 * @see {@link rtv.types.OBJECT}
 * @see {@link rtv.types.PLAIN_OBJECT}
 * @see {@link rtv.types.CLASS_OBJECT}
 * @see {@link rtv.types.MAP}
 * @see {@link rtv.types.WEAK_MAP}
 */
var MAP_OBJECT = 'mapObject';

// TODO: Is there a way that ARRAY could take a parameter, that being the
//  required length of the array, defaulting to -1 for any length? Perhaps
//  only when using the full form as `[ARRAY, 2, [STRING]]` instead of the
//  short form as `[[STRING]]`? If so, then this would be up to par with
//  the MAP_OBJECT where a count can be specified...
/**
 * Array rules per qualifiers: Must be an `Array`. Empty arrays are permitted.
 * @name rtv.types.ARRAY
 * @const {String}
 * @see {@link rtv.qualifiers}
 */
var ARRAY = 'array';

/**
 * JSON rules per qualifiers: Must be a JSON value:
 *
 * - {@link rtv.types.STRING string}, however __empty strings__ are permitted,
 *   even if the qualifier is `REQUIRED`;
 * - {@link rtv.types.BOOLEAN boolean};
 * - {@link rtv.types.FINITE finite number};
 * - {@link rtv.types.PLAIN_OBJECT plain object};
 * - {@link rtv.types.ARRAY array};
 * - `null`
 *
 * Since this type checks for _any_ valid JSON value, empty string and `null`
 *  values are permitted, even when the typeset is qualified as `REQUIRED`.
 *  Therefore, the `REQUIRED` qualifier has the same effect as the `EXPECTED`
 *  qualifier.
 *
 * @name rtv.types.JSON
 * @const {String}
 * @see {@link rtv.qualifiers}
 */
var JSON = 'json';

/**
 * Function rules per qualifiers: Must be a `function`.
 * @name rtv.types.FUNCTION
 * @const {String}
 * @see {@link rtv.qualifiers}
 */
var FUNCTION = 'function';

/**
 * RegExp rules per qualifiers: Must be a `RegExp` instance.
 * @name rtv.types.REGEXP
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
 */
var REGEXP = 'regexp';

/**
 * Date rules per qualifiers: Must be a `Date` instance.
 * @name rtv.types.DATE
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 */
var DATE = 'date';

/**
 * Error rules per qualifiers: Must be an `Error` instance.
 * @name rtv.types.ERROR
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 */
var ERROR = 'error';

/**
 * Promise rules per qualifiers: Must be a `Promise` instance.
 * @name rtv.types.PROMISE
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */
var PROMISE = 'promise';

/**
 * An ES6 map supports any object as its keys, unlike a
 *  {@link rtv.types.MAP_OBJECT MAP_OBJECT} that only supports strings. Keys can
 *  be described using a regular expression (if they are strings), and values can
 *  be described using a {@link rtv.types.typeset typeset}. Empty maps are permitted.
 *
 * Map rules per qualifiers: Must be a `Map` instance.
 *
 * Argument (optional):
 *
 * - A {@link rtv.types.collection_descriptor collection descriptor} specifying
 *   the rules for the keys and/or values found in the map. If not specified,
 *   the default collection descriptor options apply.
 *
 * @name rtv.types.MAP
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.MAP_OBJECT}
 * @see {@link rtv.types.WEAK_MAP}
 */
var MAP = 'map';

/**
 * An ES6 weak map supports any object as its keys, unlike a
 *  {@link rtv.types.MAP_OBJECT MAP_OBJECT} that only supports strings. Keys can
 *  be described using a regular expression (if they are strings), and values can
 *  be described using a {@link rtv.types.typeset typeset}. Empty maps are permitted.
 *
 * Weak map rules per qualifiers: Must be a `WeakMap` instance.
 *
 * Argument (optional):
 *
 * - A {@link rtv.types.collection_descriptor collection descriptor} specifying
 *   the rules for the keys and/or values found in the map. If not specified,
 *   the default collection descriptor options apply.
 *
 * @name rtv.types.WEAK_MAP
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.MAP_OBJECT}
 * @see {@link rtv.types.MAP}
 */
var WEAK_MAP = 'weakMap';

/**
 * An ES6 set is a collection of _unique_ values without associated keys. Values can
 *  be described using a {@link rtv.types.typeset typeset}. Empty sets are permitted.
 *
 * Set rules per qualifiers: Must be a `Set` instance.
 *
 * Argument (optional):
 *
 * - A {@link rtv.types.collection_descriptor collection descriptor} specifying
 *   the rules for the values found in the set (note that key-related rules are
 *   ignored since they are not applicable). If not specified, the default
 *   collection descriptor options apply.
 *
 * @name rtv.types.SET
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.WEAK_SET}
 */
var SET = 'set';

/**
 * An ES6 weak set is a collection of _unique_ values without associated keys. Values can
 *  be described using a {@link rtv.types.typeset typeset}. Empty sets are permitted.
 *
 * Weak set rules per qualifiers: Must be a `WeakSet` instance.
 *
 * Argument (optional):
 *
 * - A {@link rtv.types.collection_descriptor collection descriptor} specifying
 *   the rules for the values found in the set (note that key-related rules are
 *   ignored since they are not applicable). If not specified, the default
 *   collection descriptor options apply.
 *
 * @name rtv.types.WEAK_SET
 * @const {String}
 * @see {@link rtv.qualifiers}
 * @see {@link rtv.types.SET}
 */
var WEAK_SET = 'weakSet';

var typeMap = Object.freeze({
	ANY: ANY,
	STRING: STRING,
	BOOLEAN: BOOLEAN,
	NUMBER: NUMBER,
	SYMBOL: SYMBOL,
	FINITE: FINITE,
	INT: INT,
	FLOAT: FLOAT,
	ANY_OBJECT: ANY_OBJECT,
	OBJECT: OBJECT,
	PLAIN_OBJECT: PLAIN_OBJECT,
	CLASS_OBJECT: CLASS_OBJECT,
	MAP_OBJECT: MAP_OBJECT,
	ARRAY: ARRAY,
	JSON: JSON,
	FUNCTION: FUNCTION,
	REGEXP: REGEXP,
	DATE: DATE,
	ERROR: ERROR,
	PROMISE: PROMISE,
	MAP: MAP,
	WEAK_MAP: WEAK_MAP,
	SET: SET,
	WEAK_SET: WEAK_SET
});

//// Qualifier Definitions \\\\

'use strict';

/**
 * Qualifiers
 * @namespace rtv.qualifiers
 */

/**
 * Required qualifier: Property _must_ exist and be of the expected type.
 *  Depending on the type, additional requirements may be enforced.
 *
 * Unless otherwise stated in type-specific rules, this qualifier _requires_ the
 *  property to be defined _somewhere_ within the prototype chain, and does not
 *  allow its value to be `null` or `undefined`.
 *
 * See specific type for additional rules.
 *
 * @name rtv.qualifiers.REQUIRED
 * @const {String}
 * @see {@link rtv.types}
 */

var REQUIRED = '!';

/**
 * Expected qualifier: Property _should_ exist and be of the expected type.
 *  Depending on the type, some requirements may not be enforced.
 *
 * Unless otherwise stated in type-specific rules, this qualifier _requires_ the
 *  property to be defined _somewhere_ within the prototype chain, does not allow
 *  its value to be `undefined`, but does _allow_ its value to be `null`.
 *
 * See specific type for additional rules.
 *
 * @name rtv.qualifiers.EXPECTED
 * @const {String}
 * @see {@link rtv.types}
 */
var EXPECTED = '+';

/**
 * Optional qualifier: Property _may_ exist and be of the expected type.
 *  Depending on the type, some requirements may not be enforced (i.e. less so
 *  than with the `EXPECTED` qualifier).
 *
 * Unless otherwise stated in type-specific rules, this qualifier _allows_ a
 *  property value to be `null` as well as `undefined`, and does _not_ require
 *  it to be defined anywhere in the prototype chain. If the property is defined,
 *  then it is treated as an `EXPECTED` value.
 *
 * See specific type for additional rules.
 *
 * @name rtv.qualifiers.OPTIONAL
 * @const {String}
 * @see {@link rtv.types}
 */
var OPTIONAL = '?';

var qualifierMap = Object.freeze({
	REQUIRED: REQUIRED,
	EXPECTED: EXPECTED,
	OPTIONAL: OPTIONAL
});

//// Enumeration \\\\

'use strict';

/**
 * Simple enumeration type.
 * @class rtv.Enumeration
 * @param {Object.<String,*>} map Object mapping keys to values. Values cannot
 *  be `undefined`.
 * @throws {Error} If `map` is falsy or empty.
 * @throws {Error} If `map` has a key that maps to `undefined`.
 */

var Enumeration = function Enumeration(map) {
    var _this = this;

    map = map || {};

    var keys = Object.keys(map);
    var values = [];

    if (keys.length === 0) {
        throw new Error('map must contain at least one key');
    }

    // shallow-clone each key in the map into this
    keys.forEach(function (key) {
        if (map[key] === undefined) {
            throw new Error('map[' + key + '] cannot be undefined');
        }

        var value = map[key];
        values.push(value);
        _this[key] = value;
    });

    /**
     * [internal] List of enumeration values.
     * @name rtv.Enumeration#_values
     * @type Array.<String>
     */
    Object.defineProperty(this, '_values', {
        enumerable: false, // internal
        configurable: true,
        value: values
    });
};

/**
 * Validates a value as being in this enumeration. Throws an exception if the value
 *  is not in this enumeration, unless `silent` is true.
 * @method rtv.Enumeration#validate
 * @param {*} value Value to check. Cannot be undefined.
 * @param {Boolean} [silent=false] If truthy, returns `undefined` instead of throwing
 *  an exception if the specified value is not in this enumeration.
 * @returns {*} The specified value if it is in this enumeration, or `undefined` if
 *  `silent` is true and the value is not in this enumeration.
 */
Enumeration.prototype.validate = function (value, silent) {
    if (this._values.indexOf(value) >= 0) {
        return value;
    } else if (silent) {
        return undefined;
    } else {
        throw new Error('invalid value for enum[' + this._values.join(', ') + ']: ' + value);
    }
};

//// Main entry point \\\\

'use strict';

/**
 * RTV.js
 * @namespace rtv
 */

/**
 * Shape Descriptor
 *
 * // TODO: document rtv.shape_descriptor (already referenced)
 *
 * @typedef {Object} rtv.shape_descriptor
 */

var types = new Enumeration(typeMap);
var qualifiers = new Enumeration(qualifierMap);

var rtv = {
  _version: version,

  check: function check(value, shape) {
    return isString(value) && !!value;
  },
  verify: function verify(value, shape) {
    if (this.config.enabled) {
      if (!this.check(value, shape)) {
        throw new Error('value must be a ' + types.STRING + ': ' + value);
      }
    }
  },

  config: {
    enabled: true
  },

  Context: function Context(context) {
    // TODO: a version with same API (less 'config') that will include 'context' in errors thrown
  },

  types: types,
  qualifiers: qualifiers
};

export default rtv;
//# sourceMappingURL=rtv.esm.js.map
