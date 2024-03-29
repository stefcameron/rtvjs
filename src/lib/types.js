////// Type Definitions

import { Enumeration } from './Enumeration';
import * as pts from './onlyTypes';

/**
 * <h3>Types</h3>
 * @namespace rtvref.types
 */

/**
 * <h3>Primitives</h3>
 *
 * In RTV.js (as in {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive ECMAScript 2015}),
 *  a _primitive_ is considered one of the following types:
 *
 * - `undefined`
 * - `null`
 * - `string` (note that `new String('s')` does not produce a _primitive_, it
 *   produces an {@link rtvref.types.OBJECT object}, and __should be avoided__).
 * - `boolean` (note that `new Boolean(true)` does not produce a _primitive_,
 *   it produces an {@link rtvref.types.OBJECT object}, and __should be avoided__).
 * - `number` (note that `new Number(1)` does not produce a _primitive_,
 *   it produces an {@link rtvref.types.OBJECT object}, and __should be avoided__).
 * - `Symbol`
 *
 * @typedef {void} rtvref.types.primitives
 * @see {@link rtvref.validation.isPrimitive}
 */

/**
 * <h3>Falsy Values</h3>
 *
 * In JavaScript, a _falsy_ value means any one of these values which, when
 *  tested in a logical operation like `&&`, `||`, or an `IF` statement, evaluates
 *  to `false`:
 *
 * - `undefined`
 * - `null`
 * - `false`
 * - `0`
 * - `""`
 * - `NaN`
 *
 * @typedef {void} rtvref.types.falsy_values
 * @see {@link rtvref.validation.isFalsy}
 */

/**
 * <h3>Rules Per Qualifiers</h3>
 *
 * {@link rtvref.qualifiers Qualifiers} state basic rules. Unless otherwise stated,
 *  every type herein abides by those basic rules. Each type will also impose
 *  additional rules specific to the type of value it represents.
 *
 * For example, while the {@link rtvref.types.FINITE FINITE} type states that the
 *  value must not be `NaN`, `+Infinity`, nor `-Infinity`; it could be `null` if
 *  the qualifier used is `EXPECTED`; and it could be `undefined` if the qualifier
 *  used is `OPTIONAL`.
 *
 * @typedef {void} rtvref.types.qualifier_rules
 */

/**
 * <h3>Shape Descriptor</h3>
 *
 * Describes the shape (i.e. interface) of an object as a map of properties to
 *  {@link rtvref.types.typeset typesets}. Each typeset indicates whether the
 *  property is required, expected, or optional, using {@link rtvref.qualifiers qualifiers},
 *  along with possible types. Only __own-enumerable properties__ of the shape are
 *  considered part of the shape.
 *
 * When a value is {@link rtv.check checked} or {@link rtv.verify verified} against
 *  a given shape, _properties on the value that are not part of the shape are
 *  ignored_ (this is to stay true to the concept of an _interface_ whereby an object
 *  may have other functionality, but remains _compatible_ or _usable_ as long as it
 *  meets the specified contract as a subset of its properties and methods). If
 *  successfully checked/verified, the value is guaranteed to provide the properties
 *  described in the shape, and each property is guaranteed to be assigned to a value
 *  of at least one type described in each property's typeset.
 *
 * The shape descriptor itself must be an {@link rtvref.types.OBJECT OBJECT}. An empty
 *  shape descriptor is valid, but will result in nothing being verified on the value,
 *  other than whether its type is the
 *  {@link rtvref.types.DEFAULT_OBJECT_TYPE default object type}.
 *
 * __NOTE:__ A shape is simply a specific _type_ of typeset since a typeset can come
 *  in the form of multiple value types, including an object which represents a shape.
 *
 * @typedef {Object} rtvref.types.shape_descriptor
 * @see {@link rtvref.validation.isShape}
 * @see {@link rtvref.types.typeset}
 */

/**
 * <h3>Type Arguments</h3>
 *
 * Some types will accept, or may even expect, one or more arguments. Each type
 *  will specify whether it has arguments, and if they're optional or required.
 *  Arguments are specified as a single {@link rtvref.types.OBJECT object}
 *  immediately following a type in an __Array__ {@link rtvref.types.typeset typeset}
 *  (i.e. an Array must be used as the typeset in order to provide arguments for
 *  a type).
 *
 * An arguments object immediately follows its type in a typeset, such as
 *  `[PLAIN_OBJECT, {$: {hello: STRING}}]`. This would specify the value must be a
 *  {@link rtvref.types.PLAIN_OBJECT plain object} with a shape that includes a
 *  property named 'hello', that property being a
 *  {@link rtvref.qualifiers.REQUIRED required} {@link rtvref.types.STRING string}.
 *  Another example would be `[STRING, {min: 5}]`, which would require a string
 *  of at least 5 characters in length.
 *
 * Since {@link rtvref.qualifiers qualifiers} may affect how a value is validated
 *  against a type, {@link rtvref.types.qualifier_rules qualifier rules} will take
 *  precedence over any argument specified, _unless otherwise stated in the type's
 *  qualifier rules_ or arguments spec.
 *
 * @typedef {Object} rtvref.types.type_arguments
 * @see {@link rtvref.validation.isTypeArgs}
 */

/**
 * <h3>String Arguments</h3>
 * @typedef {Object} rtvref.types.STRING_args
 * @property {(string|Array.<string>)} [oneOf] An exact string to match (`===`).
 *  Can also be a list of strings, one of which must be an exact match. An empty
 *  string is allowed, and will override the normal rules of the `REQUIRED`
 *  {@link rtvref.qualifiers qualifier} which would otherwise require a non-empty
 *  string as the value. The list may contain an empty string. __An empty list will
 *  be ignored__. This argument is ignored if `exp` is specified.
 * @property {string} [partial] A partial value to match (must be somewhere
 *  within the string). Ignored if not a string, an empty string, or `oneOf` or
 *  `exp` is specified. `min` and `max` take __precedence__ over this argument
 *  (min/max will be validated first, then a partial match will be attempted).
 * @property {number} [min] Minimum inclusive length. Defaults to 1 for a
 *  `REQUIRED` string, and 0 for an `EXPECTED` or `OPTIONAL` string. Ignored if
 *  `oneOf` or `exp` is specified, or `min` is not a {@link rtvref.types.FINITE FINITE}
 *  number >= 0.
 * @property {number} [max] Maximum inclusive length. Negative means no maximum.
 *  Ignored if `oneOf` or `exp` is specified, `max` is not a
 *  {@link rtvref.types.FINITE FINITE} number, or `max` is less than `min`. Defaults
 *  to -1 (unlimited length). Can be set to zero to require a zero-length string.
 * @property {string} [exp] A string-based regular expression describing the
 *  string. For example, to require a string of numbers with a minimum length of 1,
 *  the following expression could be used: `"^\\d+$"`.
 * @property {string} [expFlags] A string specifying any flags to use with
 *  the regular expression specified in `exp`. Ignored if _falsy_ or if
 *  `exp` is not specified. See the
 *  {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp RegExp#flags}
 *  parameter for more information.
 * @see {@link rtvref.types.STRING}
 */

/**
 * <h3>Symbol Arguments</h3>
 * @typedef {Object} rtvref.types.SYMBOL_args
 * @property {(symbol|Array.<symbol>)} [oneOf] An exact symbol to match (`===`).
 *  Can also be a list of symbols, one of which must be an exact match. Values to
 *  match are ignored if they are not symbols. An empty list will be ignored.
 * @see {@link rtvref.types.SYMBOL}
 */

/**
 * <h3>Numeric Value Arguments</h3>
 *
 * Applicable to all numeric types:
 *
 * - {@link rtvref.types.NUMBER NUMBER}
 * - {@link rtvref.types.FINITE FINITE}
 * - {@link rtvref.types.INT INT}
 * - {@link rtvref.types.SAFE_INT SAFE_INT}
 * - {@link rtvref.types.FLOAT FLOAT}
 *
 * @typedef {Object} rtvref.types.numeric_args
 * @property {(number|Array.<number>)} [oneOf] An exact number to match (`===`).
 *  Can also be a list of numbers, one of which must be an exact match. An empty
 *  list will be ignored.
 *
 *  Values to match are ignored if they are not within normal range of the type
 *   (e.g. for `NUMBER`, could be `+Infinity`, or even `NaN` if the qualifier is
 *   not `REQUIRED`; but these values would be ignored by `FINITE` since they
 *   aren't part of the `FINITE` range), or not numbers at all.
 *
 *  Note that `0` and `NaN` are permitted when the qualifier is `TRUTHY` even if
 *   they aren't part of the list or aren't the single match.
 *
 * @property {number} [min] Minimum inclusive value. Ignored if `oneOf` is
 *  specified, `min` is `NaN`, or `min` is not within normal range of the type.
 *
 *  Note that `0` is permitted when the qualifier is `TRUTHY` even if the minimum
 *   does not permit it.
 *
 * @property {number} [max] Maximum inclusive value. Ignored if `oneOf` is
 *  specified, `max` is `NaN`, `max` is not within normal range of the type,
 *  or `max` is less than `min`.
 *
 *  Note that `0` is permitted when the qualifier is `TRUTHY` even if the minimum
 *   does not permit it.
 *
 * @see {@link rtvref.types.NUMBER}
 * @see {@link rtvref.types.FINITE}
 * @see {@link rtvref.types.INT}
 * @see {@link rtvref.types.SAFE_INT}
 * @see {@link rtvref.types.FLOAT}
 * @see {@link rtvref.qualifiers}
 */

/**
 * <h3>Shape Object Arguments</h3>
 *
 * Applicable to all object types that may have a shape:
 *
 * - {@link rtvref.types.ANY_OBJECT ANY_OBJECT}
 * - {@link rtvref.types.OBJECT OBJECT}
 * - {@link rtvref.types.PLAIN_OBJECT PLAIN_OBJECT}
 * - {@link rtvref.types.CLASS_OBJECT CLASS_OBJECT}
 *
 * @typedef {Object} rtvref.types.shape_object_args
 * @property {Object} [$] The {@link rtvref.types.shape_descriptor shape descriptor}
 *  describing the expected interface of the value being verified. If not specified,
 *  none of the value's properties will be verified, and the `exact` flag (as well
 *  as the `exactShapes` verification option) will be ignored.
 *
 *  __NOTE:__ Any properties in the shape itself that are `undefined` will be ignored.
 *   This facilitates merging shapes with destructuring when combining shapes into
 *   larger ones.
 *
 *  Applies to all shape object types.
 *
 * @property {function} [ctor] A reference to a constructor function. If specified,
 *  the class object (instance) must have this class function in its inheritance
 *  chain such that `<class_object> instanceof ctor === true`. Note that this
 *  property is not serializable to JSON. Ignored if not a
 *  {@link rtvref.types.FUNCTION function}.
 *
 *  Applies to: {@link rtvref.types.CLASS_OBJECT CLASS_OBJECT}.
 *
 * @property {boolean} [exact] If `true`, this will restrict the __immediate__ object
 *  being verified to having the exact set of own-properties as those specified on
 *  the shape. By default, _additional_ own-properties on the object are ignored.
 *
 *  In other words, the object must always have all of the shape's properties, but
 *   (by default) it may also have additional properties that are not in the shape.
 *   Setting `exact: true` would cause the verification to fail if the object has
 *   more properties than those specified in the shape.
 *
 *  If specified, whether `true` or `false`, this flag overrides the `exactShapes`
 *   option for the verification __for this shape only__. Nested shapes will not
 *   be affected. The `exactShapes` flag that may be set in the verification's
 *   {@link rtvref.validator.type_validator_context_options context options} via
 *   a call to {@link rtv.check} or {@link rtv.verify}.
 *
 *  __NOTE:__ If this flag is `true` and the shape is __empty__, it
 *   will restrict the object being verified to an empty object (i.e. no
 *   own-properties).
 *
 *  __NOTE:__ If this flag is `true` and the shape is not specified, the flag
 *   will be ignored, not verifying the value being checked has any specific
 *   own-properties.
 *
 *  Applies to all shape object types.
 *
 * @see {@link rtvref.types.ANY_OBJECT}
 * @see {@link rtvref.types.OBJECT}
 * @see {@link rtvref.types.PLAIN_OBJECT}
 * @see {@link rtvref.types.CLASS_OBJECT}
 */

/**
 * <h3>Array Arguments</h3>
 * @typedef {Object} rtvref.types.ARRAY_args
 * @property {rtvref.types.typeset} [$] The typeset which every value in the
 *  array must match. Defaults to {@link rtvref.types.ANY} which means any
 *  value will match.
 * @property {number} [length] Exact length. Ignored if not a
 *  {@link rtvref.types.FINITE FINITE} number >= 0.
 * @property {number} [min] Minimum inclusive length. Ignored if `length` is
 *  specified, or `min` is not a {@link rtvref.types.FINITE FINITE} number >= 0.
 *  Defaults to 0.
 * @property {number} [max] Maximum inclusive length. Negative means no maximum.
 *  Ignored if `length` is specified, `max` is not a
 *  {@link rtvref.types.FINITE FINITE} number, or `max` is less than `min`. Defaults
 *  to -1 (unlimited).
 * @see {@link rtvref.types.ARRAY}
 */

/**
 * <h3>Collection Arguments</h3>
 *
 * Describes the keys and values in a collection-based object, which is one of
 *  the following types:
 *
 * - {@link rtvref.types.HASH_MAP HASH_MAP} (NOTE: only __own-enumerable
 *   properties__ are considered part of this collection type)
 * - {@link rtvref.types.MAP MAP}
 * - {@link rtvref.types.SET SET} (with some exceptions)
 *
 * For example, the following arguments both verify a collection of 3-letter
 *  string keys (upper- or lowercase) to finite numbers:
 *
 * - `{keyExp: '[a-z]{3}', keyFlags: 'i', $values: FINITE}`
 * - `{keyExp: '[a-zA-Z]{3}', $values: FINITE}`
 *
 * Note that {@link rtvref.types.ARRAY ARRAY} is __not__ included in this list
 *  because the array type has special syntax for describing the type of its items.
 *  See {@link rtvref.types.ARRAY_args ARRAY_args} instead.
 *
 * The {@link rtvref.types.WEAK_MAP WEAK_MAP} and {@link rtvref.types.WEAK_SET WEAK_SET}
 *  types do not apply because, due to their nature, their elements cannot be
 *  iterated.
 *
 * @typedef {Object} rtvref.types.collection_args
 * @property {number} [length] The exact number of elements required in
 *  the collection. A negative value allows for any number of entries. Zero
 *  requires an empty collection. Ignored if not a
 *  {@link rtvref.types.FINITE FINITE} number.
 *
 *  Applies to: All collection types.
 *
 * @property {rtvref.types.typeset} [$keys] A typeset describing each key
 *  in the collection.
 *
 *  If the type is {@link rtvref.types.HASH_MAP HASH_MAP}, this argument is ignored
 *   due to the nature of its JavaScript `Object`-based implementation which
 *   requires that all keys be non-empty {@link rtvref.types.STRING strings}.
 *
 *  Applies to: {@link rtvref.types.MAP MAP}.
 *
 * @property {string} [keyExp] A string-based regular expression describing the
 *  names of keys found in the collection. By default, there are no restrictions
 *  on key names. Ignored if the key type is not {@link rtvref.types.STRING STRING},
 *  as specified in `$keys` (when `$keys` is applicable to the collection type).
 *
 *  For example, to require numerical keys, the following expression could be
 *   used: `"^\\d+$"`.
 *
 *  Applies to: {@link rtvref.types.HASH_MAP HASH_MAP}, {@link rtvref.types.MAP MAP}.
 *
 * @property {string} [keyFlags] A string specifying any flags to use with
 *  the regular expression specified in `keyExp`. Ignored if _falsy_, or if
 *  `keyExp` is not specified or irrelevant. See the
 *  {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp RegExp#flags}
 *  parameter for more information.
 *
 *  Applies to: {@link rtvref.types.HASH_MAP HASH_MAP}, {@link rtvref.types.MAP MAP}.
 *
 * @property {rtvref.types.typeset} [$values] A typeset describing each value in
 *  the collection. If specified, all values must match this typeset (but the
 *  collection is not required to have any elements to be considered valid, unless
 *  `length` is specified). If not specified, no validation is performed on values.
 *
 *  For example, to require arrays of non-empty string values as values in the
 *   collection, the following typeset could be used: `[[types.STRING]]`.
 *
 *  Applies to: All collection types.
 *
 * @property {boolean} [deep] If `true`, the property value being tested does not
 *  match the `$values` typeset, and the property value
 *  {@link rtvref.types.HASH_MAP is a hash map}, then verification will recurse
 *  into the property value and will attempt to verify its properties against
 *  the typeset in `$values`.
 *
 *  If `false` (default), the property value must match the `$values` typeset.
 *
 *  Applies to: {@link rtvref.types.HASH_MAP HASH_MAP}.
 *
 * @see {@link rtvref.types.HASH_MAP}
 * @see {@link rtvref.types.MAP}
 * @see {@link rtvref.types.SET}
 */

/**
 * <h3>Typeset</h3>
 *
 * Describes the possible types for a given value. It can be any one of the following
 *  JavaScript types:
 *
 * - {@link rtvref.types.OBJECT Object}: For the root or a nested
 *   {@link rtvref.types.shape_descriptor shape descriptor} of _implied_
 *   {@link rtvref.types.OBJECT OBJECT} type (unless paired with a specific object type
 *   like {@link rtvref.types.PLAIN_OBJECT PLAIN_OBJECT}, for example, when using the
 *   Array notation, e.g. `[PLAIN_OBJECT, {...}]`). If the object is empty (has no properties),
 *   nothing will be verified (anything will pass).
 * - {@link rtvref.types.STRING String}: For a single type, such as
 *   {@link rtvref.types.FINITE FINITE} for a finite number. Must be one of the types
 *   defined in {@link rtvref.types}.
 * - {@link rtvref.types.FUNCTION Function}: For a
 *   {@link rtvref.types.custom_validator custom validator} that will verify the value of the
 *   property using custom code. Since the Array form is not being used (only the validator is
 *   being provided), it's always invoked immediately. Since a type is not provided, the
 *   {@link rtvref.types.ANY ANY} type is implied.
 * - {@link rtvref.types.ARRAY Array}: For multiple type possibilities, optionally
 *   {@link rtvref.qualifiers qualified}, using a short-circuit __OR__ conjunction, which means
 *   the value of the property being described must match _at least one_ of the types listed, but
 *   not all. Matching is done in a short-circuit fashion, from the first to the last element in
 *   the typeset. If a simpler type is a more likely match, it's more performant to specify it
 *   first/earlier in the typeset to avoid a match attempt on a nested shape or Array.
 *   - Cannot be an empty Array.
 *   - A given type may be included more than once in the typeset. This allows for greater
 *     composition. The first-matched will win. `[STRING, {oneOf: 'foo'}, STRING]` would
 *     validate both `'foo'` and `'bar'` because the second occurrence of `STRING` is
 *     not restricted to any specific value.
 *   - An Array is necessary to {@link rtvref.qualifiers qualify} the typeset as not
 *     required (see _Typeset Qualifiers_ below).
 *   - An Array is necessary if a type needs or requires
 *     {@link rtvref.types.type_arguments arguments}.
 *   - If the __first__ element is an `Object` (or second, if a
 *     {@link rtvref.types.qualifiers qualifier} is provided, and this, in a typeset that
 *     is _not_ {@link rtvref.types.fully_qualified_typeset fully-qualified}),
 *     it's treated as a nested {@link rtvref.types.shape_descriptor shape descriptor}
 *     describing an object of the {@link rtvref.types.DEFAULT_OBJECT_TYPE default object type}.
 *     To include a shape descriptor at any other position within the array, it
 *     __must__ be preceded by a type, even if the default object type is being
 *     used (i.e. `OBJECT` must be specified as the type). For example, all
 *     these typesets are equivalent (and equivalent to just `{name: STRING}`
 *     as the typeset): `[{name: STRING}]`, `[REQUIRED, {name: STRING}]`, and
 *     `[REQUIRED, OBJECT, {$: {name: STRING}}]`, describing an object that has a name
 *     property which is a non-empty string. Changing it to `[STRING, {$: {name: STRING}}]`,
 *     however, does __not__ mean, "a non-empty string, or an object with a name
 *     property which is a non-empty string". In this case, the
 *     {@link rtvref.types.object_args object arguments} `{$: {name: STRING}}` would
 *     be treated as {@link rtvref.types.STRING_args STRING arguments}, which is
 *     likely not the intent. The arguments would have to be preceded by an
 *     object type (e.g. {@link rtvref.types.OBJECT OBJECT},
 *     {@link rtvref.types.PLAIN_OBJECT PLAIN_OBJECT}, etc.) to have them interpreted
 *     as in the former "OR" case.
 *   - If an element is an `Array` (any position), it's treated as a __nested list__
 *     with an implied {@link rtvref.types.ARRAY ARRAY} type, e.g.
 *     `[BOOLEAN, [STRING, FINITE]]` would describe a property that should be a boolean,
 *     or an array of non-empty strings or finite numbers. See the `ARRAY` type
 *     reference for more information on _shorthand_ and _full_ notations.
 *   - If an element is a `Function`, it must be the __last__ element in the Array
 *     and will be treated as a {@link rtvref.types.custom_validator custom validator}.
 *     Only one validator can be specified for a given typeset (additional validators
 *     may appear in nested typesets).
 *
 * <h4>Typeset Qualifiers</h4>
 *
 * All typesets use an _implied_ {@link rtvref.qualifiers.REQUIRED REQUIRED}
 *  qualifier unless otherwise specified. To qualify a typeset, a
 *  {@link rtvref.qualifiers qualifier} may be specified as the __first__ element
 *  in the `Array` form (if specified, it must be the first element). For example,
 *  `{note: [EXPECTED, STRING]}` would describe an object with a 'note' property
 *  that is an expected, but not required, string, which could therefore be either
 *  empty or even `null`. The `Array` form must be used in order to qualify a
 *  typeset as other than required, and the qualifier applies to all immediate
 *  types in the typeset (which means each nested typeset can have its own qualifier).
 *
 * <h4>JSON Serialization</h4>
 *
 * __ALL__ typesets should be fully JSON-serializable (via `JSON.stringify()` and
 *  `JSON.parse()`) with the following unavoidable exceptions:
 *
 * - {@link rtvref.types.custom_validator Custom validators}
 * - {@link rtvref.types.shape_object_args CLASS_OBJECT arguments} 'ctor' property
 *
 * Those exceptions are due to the fact that these represent functions, and functions
 *  are not serializable to JSON. They will be ignored in the stringification process,
 *  unless a custom _replacer_ is provided which, _somehow_ (up to you), handles them.
 *
 * This could, among other possibilities, enable the transmission of typesets
 *  over network requests, perhaps embedded in JSON payloads, similar to
 *  {@link https://json-ld.org/ JSON-LD} schemas.
 *
 * <h4>Typeset Example: Object</h4>
 *
 * <pre><code>const contactShape = {
 *   name: rtv.STRING, // required, non-empty, string
 *   tags: [rtv.ARRAY, [rtv.STRING]], // required array of non-empty strings
 *   // tags: [[rtv.STRING]], // same as above, but using shortcut array format
 *   details: { // required nested object of type `OBJECT` (default)
 *     birthday: [rtv.EXPECTED, rtv.DATE] // Date (could be null)
 *   },
 *   notes: [rtv.OPTIONAL, rtv.STRING, function(value) { // optional string...
 *     if (value && !value.test(/^[A-Z].+\.$/)) {
 *       throw new Error('Note must start with a capital letter, end with a ' +
 *           period, and have something in between, if specified.');
 *     }
 *   }]
 * };
 *
 * const contact = {
 *   name: 'John Doe',
 *   tags: ['colleagues', 'sports'],
 *   details: {
 *     birthday: null // not specified
 *   }
 * };
 *
 * rtv.verify(contact, contactShape); // OK
 *
 * const walletShape = {
 *   contacts: [[contactShape]], // list of contacts using nested shape
 *   address: {
 *     street: rtv.STRING
 *     // ...
 *   },
 *   money: rtv.FINITE
 * };
 *
 * rtv.verify({
 *   contacts: [contact],
 *   address: {street: '123 Main St'},
 *   money: 100
 * }, walletShape); // OK
 * </code></pre>
 *
 * <h4>Typeset Example: String</h4>
 *
 * <pre><code>rtv.verify('foo', rtv.STRING); // OK
 * rtv.verify('foo', rtv.FINITE); // ERROR
 * </code></pre>
 *
 * <h4>Typeset Example: Array</h4>
 *
 * <pre><code>const typeset = [rtv.STRING, rtv.FINITE]; // non-empty string, or finite number
 * rtv.verify('foo', typeset); // OK
 * rtv.verify(1, typeset); // OK
 * </code></pre>
 *
 * <h4>Typeset Example: Function</h4>
 *
 * <pre><code>const validator = (v) => {
 *   if (v % 10) {
 *     throw new Error('Number must be a factor of 10.');
 *   }
 * };
 *
 * rtv.verify(100, validator); // OK
 * rtv.verify(120, [rtv.INT, validator]); // OK
 * </code></pre>
 *
 * <h4>Typeset Example: Alternate Qualifier</h4>
 *
 * <pre><code>const person = {
 *   name: rtv.STRING, // required, non-empty
 *   age: [rtv.OPTIONAL, rtv.FINITE, (v) => { // 18 or older, if specified
 *     if (v < 18) {
 *       throw new Error('Must be 18 or older.');
 *     }
 *   }]
 * };
 * rtv.verify({name: 'Bob'}, person); // OK
 * rtv.verify({name: ''}, person); // ERROR
 * rtv.verify({name: 'Steve', age: 17}, person); // ERROR
 * rtv.verify({name: 'Steve', age: null}, person); // OK
 * </code></pre>
 *
 * @typedef {(Object|string|Array|Function)} rtvref.types.typeset
 */

/**
 * <h3>Fully-Qualified Typeset</h3>
 *
 * A {@link rtvref.types.typeset typeset} expressed without any shortcut notations
 *  or implied/default types to make it easier to parse, especially as the `match`
 *  parameter given to a {@link rtvref.types.custom_validator custom validator}.
 *  A fully-qualified typeset always uses the array notation, and has a single
 *  {@link rtvref.qualifiers qualifier} as its first element, followed by
 *  at least one type, and at most one validator.
 *
 * For example:
 *
 * - `STRING` -> `[REQUIRED, STRING]`
 * - `{note: STRING}` -> `[REQUIRED, OBJECT, {$: {note: [REQUIRED, STRING]}}]`
 * - `[[FINITE]]` -> `[REQUIRED, ARRAY, {$: [REQUIRED, FINITE]}]`
 * - `(v) => if (!v) { throw new Error(); }` -> `[REQUIRED, ANY, (v) => if (!v) { throw new Error(); }]`
 *
 * @typedef {Array} rtvref.types.fully_qualified_typeset
 */

/**
 * <h3>Custom Validator</h3>
 *
 * A function used as a {@link rtvref.types.typeset typeset}, or as a subset to
 *  a typeset, to provide custom verification of the value being verified.
 *
 * A typeset may only have one validator, and the validator is _only called if
 *  the value being verified was verified by at least one type in the typeset_.
 *  The validator must be the __last__ element within the typeset (if the typeset
 *  is an array, and a validator is needed). The validator must also be
 *  specified _after_ the {@link rtvref.qualifiers qualifier} in a typeset Array.
 *
 * The validator is invoked immediately after the first type match, but _only if
 *  a type match is made_. If the typeset is not
 *  {@link rtvref.types.fully_qualified_typeset fully-qualified} and does not
 *  explicitly specify a type, the {@link rtvref.types.ANY ANY} type is implied,
 *  which will match _any_ value, which means the validator will always be called.
 *
 * __NOTE about qualifiers:__ Validators will be invoked regardless of the qualifier.
 *  If the typeset's qualifier is `EXPECTED`, the validator __must handle `null` values__.
 *  If the qualifier is `OPTIONAL`, the validator __must handle `undefined` and `null` values__.
 *  Also note that a value of `null` or `undefined`, if permitted by the qualifier,
 *  will always be type-matched to the first type in the typeset because all types
 *  allow these values for their related qualifiers.
 *
 * There is one __disadvantage__ to using a custom validator: It cannot be serialized
 *  via JSON, which means it cannot be easily transmitted or persisted. One option
 *  would be to customize the serialization to JSON by serializing the validator to a
 *  special object with properties that would inform the deserialization process
 *  on how to reconstruct the validator dynamically. There may also be a way to
 *  persist the function's code, but that would require the use of the unsafe
 *  `eval()` function to later reconstitute it as an actual function.
 *
 * @typedef {function} rtvref.types.custom_validator
 * @param {*} value The value being verified.
 *
 *  This value differs from `context.originalValue` in that it is the value currently being verified,
 *   closest to the custom validator itself, e.g. the value of element in an array, as opposed to the
 *   array itself, or the value of a property in an object, as opposed to the object itself.
 *
 * @param {Array} match A {@link rtvref.types.fully_qualified_typeset fully-qualified}
 *  typeset describing the __sub-type within__ the `typeset` parameter that matched, resulting
 *  in the custom validator being called (if no sub-types matched, it would not get called).
 *
 *  For example, if the typeset used for verification was `[PLAIN_OBJECT, {$: {note: STRING}}, validator]`,
 *   this parameter would be a new Array typeset `[REQUIRED, PLAIN_OBJECT, {$: {note: STRING}}]`,
 *   and the `typeset` parameter would be a reference to the original
 *   `[PLAIN_OBJECT, {$: {note: STRING}}, validator]`.
 *
 *  If the verification typeset was `[STRING, FINITE, validator]` and FINITE matched, this parameter
 *   would be `[REQUIRED, FINITE]` and the `typeset` parameter would be a reference to the original
 *  `[STRING, FINITE, validator]`.
 *
 *  If the verification typeset was `[{message: STRING}, validator]` and the shape matched, this
 *   parameter would be `[REQUIRED, OBJECT, {$: {message: STRING}}]` (because of the
 *   {@link rtvref.types.DEFAULT_OBJECT_TYPE default object type}) and the `typeset` parameter
 *   would be a reference to the original `[{message: STRING}, validator]`.
 *
 *  If the verification typeset was simply `validator` (just the validator itself), this parameter
 *   would be `[REQUIRED, ANY]` (because of the implied {@link rtvref.types.ANY ANY} type) and
 *   the `typeset` would be a reference to the original `validator`.
 *
 * @param {rtvref.types.typeset} typeset Reference to the typeset used for
 *  verification. Note the typeset may contain nested typeset(s), and may
 *  be part of a larger parent typeset (though there would be no reference to
 *  the parent typeset, if any).
 * @param {rtvref.validator.type_validator_context} context Additional context
 *  for the validation.
 * @returns {*} Either `undefined` or a _truthy_ value to __pass__ the verification, or a _falsy_
 *  value to fail it. The validator may also throw an `Error` to fail the verification.
 *
 *  If a _falsy_ value (other than `undefined`) is returned, an `Error` will be generated and
 *   included in the resulting `RtvError` as its {@link rtvref.RtvError#failure failure} property,
 *   as well as part of its `message`.
 *
 *  While `undefined` is _falsy_, it's also the result of a function that did not return anything,
 *   which is interpreted as indicating the validator found no fault with the value.
 *
 *  It's recommend to throw an `Error` with a helpful message rather than simply returning a
 *   _falsy_ value to fail the verification.
 *
 * @throws {Error} (Optional) If the validation fails. This error will fail the overall
 *  verification, and will be included in the resulting `RtvError` as its
 *  {@link rtvref.RtvError#failure failure} property, as well as part of its
 *  `message`.
 *
 *   Although not required, it's recommended to throw an error with a message that will
 *    help the developer determine why the custom validation failed, while avoiding exposing
 *    any sensitive information that may be found in the `value` (such as passwords).
 *
 * @see {@link rtvref.validation.isCustomValidator}
 */

//
// vvvvvvv INSERT NEW TYPES vvvvvvv BELOW THIS SECTION vvvvvvv
//

// Creates a definition object.
// @param {string} value Type value. Must not be empty.
// @param {boolean} [hasArgs=false] If the type takes arguments.
// @param {boolean} [isObject=false] If the type is an object type, which means
//  it describes a shape (either directly as its args object, e.g. PLAIN_OBJECT,
//  or indirectly as a property inside it's args object, e.g. CLASS_OBJECT).
// @returns {{value: boolean, hasArgs: boolean, isObject: boolean}} Type definition.
const def = function (value, hasArgs, isObject) {
  return {
    value,
    hasArgs: !!hasArgs,
    isObject: !!isObject,
  };
};

// map of type key (string) to type definition (see def() for shape)
const defs = {
  [pts.ANY]: def(pts.ANY),
  [pts.NULL]: def(pts.NULL),
  [pts.STRING]: def(pts.STRING, true),
  [pts.BOOLEAN]: def(pts.BOOLEAN),
  [pts.SYMBOL]: def(pts.SYMBOL, true),
  [pts.NUMBER]: def(pts.NUMBER, true),
  [pts.FINITE]: def(pts.FINITE, true),
  [pts.INT]: def(pts.INT, true),
  [pts.SAFE_INT]: def(pts.SAFE_INT, true),
  [pts.FLOAT]: def(pts.FLOAT, true),
  [pts.FUNCTION]: def(pts.FUNCTION),
  [pts.REGEXP]: def(pts.REGEXP),
  [pts.DATE]: def(pts.DATE),
  [pts.ERROR]: def(pts.ERROR),
  [pts.PROMISE]: def(pts.PROMISE),
  [pts.ARRAY]: def(pts.ARRAY, true),
  [pts.ANY_OBJECT]: def(pts.ANY_OBJECT, true, true),
  [pts.OBJECT]: def(pts.OBJECT, true, true),
  [pts.PLAIN_OBJECT]: def(pts.PLAIN_OBJECT, true, true),
  [pts.CLASS_OBJECT]: def(pts.CLASS_OBJECT, true, true),
  [pts.HASH_MAP]: def(pts.HASH_MAP, true), // NOTE: NOT an object type (unrelated to shapes)
  [pts.MAP]: def(pts.MAP, true),
  [pts.WEAK_MAP]: def(pts.WEAK_MAP), // not iterable, so does not accept any collection args
  [pts.SET]: def(pts.SET, true),
  [pts.WEAK_SET]: def(pts.WEAK_SET), // not iterable, so does not accept any collection args
  [pts.JSON]: def(pts.JSON),
};

//
// ^^^^^^^ INSERT NEW TYPES ^^^^^^^ ABOVE THIS SECTION ^^^^^^^
//

/**
 * Default object type: {@link rtvref.types.OBJECT}. This type is associated
 *  with an un-qualified {@link rtvref.types.shape_descriptor shape descriptor}.
 * @const {string} rtvref.types.DEFAULT_OBJECT_TYPE
 */
export const DEFAULT_OBJECT_TYPE = defs.OBJECT.value;

/**
 * Enumeration (`string -> string`) of __object__ types:
 *
 * - {@link rtvref.types.ANY_OBJECT ANY_OBJECT}
 * - {@link rtvref.types.OBJECT OBJECT}
 * - {@link rtvref.types.PLAIN_OBJECT PLAIN_OBJECT}
 * - {@link rtvref.types.CLASS_OBJECT CLASS_OBJECT}
 *
 * @name rtvref.types.objTypes
 * @type {rtvref.Enumeration}
 */
export const objTypes = new Enumeration(
  Object.keys(defs)
    .filter((name) => defs[name].isObject)
    .reduce((map, name) => {
      map[name] = defs[name].value;
      return map;
    }, {}),
  'objTypes'
);

/**
 * Enumeration (`string -> string`) of types that accept arguments:
 *
 * - {@link rtvref.types.STRING STRING}
 * - {@link rtvref.types.SYMBOL SYMBOL}
 * - {@link rtvref.types.NUMBER NUMBER}
 * - {@link rtvref.types.FINITE FINITE}
 * - {@link rtvref.types.INT INT}
 * - {@link rtvref.types.SAFE_INT SAFE_INT}
 * - {@link rtvref.types.FLOAT FLOAT}
 * - {@link rtvref.types.ARRAY ARRAY}
 * - {@link rtvref.types.ANY_OBJECT ANY_OBJECT}
 * - {@link rtvref.types.OBJECT OBJECT}
 * - {@link rtvref.types.PLAIN_OBJECT PLAIN_OBJECT}
 * - {@link rtvref.types.CLASS_OBJECT CLASS_OBJECT}
 * - {@link rtvref.types.HASH_MAP HASH_MAP}
 * - {@link rtvref.types.MAP MAP}
 * - {@link rtvref.types.SET SET}
 *
 * @name rtvref.types.argTypes
 * @type {rtvref.Enumeration}
 */
export const argTypes = new Enumeration(
  Object.keys(defs)
    .filter((name) => defs[name].hasArgs)
    .reduce((map, name) => {
      map[name] = defs[name].value;
      return map;
    }, {}),
  'argTypes'
);

/**
 * Enumeration (`string -> string`) of all types:
 *
 * - {@link rtvref.types.ANY ANY}
 * - {@link rtvref.types.NULL NULL}
 * - {@link rtvref.types.STRING STRING}
 * - {@link rtvref.types.BOOLEAN BOOLEAN}
 * - {@link rtvref.types.SYMBOL SYMBOL}
 * - {@link rtvref.types.NUMBER NUMBER}
 * - {@link rtvref.types.FINITE FINITE}
 * - {@link rtvref.types.INT INT}
 * - {@link rtvref.types.SAFE_INT SAFE_INT}
 * - {@link rtvref.types.FLOAT FLOAT}
 * - {@link rtvref.types.FUNCTION FUNCTION}
 * - {@link rtvref.types.REGEXP REGEXP}
 * - {@link rtvref.types.DATE DATE}
 * - {@link rtvref.types.ERROR ERROR}
 * - {@link rtvref.types.PROMISE PROMISE}
 * - {@link rtvref.types.ARRAY ARRAY}
 * - {@link rtvref.types.ANY_OBJECT ANY_OBJECT}
 * - {@link rtvref.types.OBJECT OBJECT}
 * - {@link rtvref.types.PLAIN_OBJECT PLAIN_OBJECT}
 * - {@link rtvref.types.CLASS_OBJECT CLASS_OBJECT}
 * - {@link rtvref.types.HASH_MAP HASH_MAP}
 * - {@link rtvref.types.MAP MAP}
 * - {@link rtvref.types.WEAK_MAP WEAK_MAP}
 * - {@link rtvref.types.SET SET}
 * - {@link rtvref.types.WEAK_SET WEAK_SET}
 * - {@link rtvref.types.JSON JSON}
 *
 * @name rtvref.types.types
 * @type {rtvref.Enumeration}
 */
export const types = new Enumeration(
  Object.keys(defs).reduce((map, name) => {
    map[name] = defs[name].value;
    return map;
  }, {}),
  'types'
);
