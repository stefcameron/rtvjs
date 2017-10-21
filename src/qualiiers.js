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
export var REQUIRED = '!';

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
export var EXPECTED = '+';

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
export var OPTIONAL = '?';
