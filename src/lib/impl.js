////// Main Implementation Module

// NOTE: These validators are used for internal purposes. Validation of actual
//  VALUES being checked should always be done via the _validatorMap.
import { check as isArray } from './validation/isArray';
import { check as isObject } from './validation/isObject';
import { check as isString } from './validation/isString';
import { check as isFunction } from './validation/isFunction';
import { check as isBoolean } from './validation/isBoolean';
import { check as isMap } from './validation/isMap';
import { check as isSet } from './validation/isSet';

import { check as isTypeset } from './validation/isTypeset';
import { check as isShape } from './validation/isShape';
import { check as isTypeArgs } from './validation/isTypeArgs';
import { check as isCustomValidator } from './validation/isCustomValidator';

import { DEFAULT_OBJECT_TYPE, argTypes, types } from './types';
import { DEFAULT_QUALIFIER, qualifiers } from './qualifiers';
import { print, hasOwnProp } from './util';
import { RtvSuccess } from './RtvSuccess';
import { RtvError } from './RtvError';

/**
 * <h3>RTV.js Implementation</h3>
 *
 * Provides the internal implementation for the externally-facing {@link rtv RTV}
 *  API, as well as utilities for {@link rtvref.validator type validators}.
 *
 * @namespace rtvref.impl
 */

/**
 * [Internal] Map of validator type (string) to validator function.
 * @private
 * @name rtvref.impl._validatorMap
 * @type {Object.<string,rtvref.validator.type_validator>}
 */
export const _validatorMap = {};

/**
 * Get the qualifier given any kind of typeset.
 *
 * The typeset's validity is __not__ checked. The function attempts to get a
 *  qualifier, and defaults to the {@link qualifiers.DEFAULT_QUALIFIER default qualifier}
 *  if it cannot.
 *
 * @function rtvref.impl.getQualifier
 * @param {rtvref.types.typeset} typeset The typeset in question.
 * @returns {string} The applicable {@link rtvref.qualifiers qualifier} for the
 *  specified typeset, which is assumed to be valid.
 */
export const getQualifier = function (typeset) {
  let qualifier = DEFAULT_QUALIFIER;

  if (isArray(typeset)) {
    // if there's a qualifier, it must be the first element, and since it's a
    //  valid typeset, it cannot be an empty array
    if (isString(typeset[0]) && qualifiers.check(typeset[0])) {
      qualifier = typeset[0];
    }
  }
  // else, it's either an object, function, or string, which implies the default
  //  qualifier

  return qualifier;
};

/**
 * Convert a type, qualifier, and args into a typeset.
 *
 * While the `qualifier`, `args`, and `fullyQualified` parameters are all
 *  optional and may be omitted, their order must be maintained: If needed,
 *  the `qualifier` must always be before `args`, and `args` before
 *  `fullyQualified`. Parameters with `undefined` values will be ignored.
 *
 * @function rtvref.impl.toTypeset
 * @param {string} type A single type from {@link rtvref.types.types}.
 * @param {(string|Object|boolean)} [qualifier=rtvref.qualifiers.DEFAULT_QUALIFIER]
 *  Optional qualifier from {@link rtvref.qualifiers.qualifiers}. Can also be
 *  either the `args` parameter, or the `fullyQualified` parameter if the
 *  default qualifier is being used.
 * @param {(Object|boolean)} [args] Optional
 *  {@link rtvref.types.type_arguments type arguments}. If specified, this
 *  parameter must be an {@link rtvref.types.OBJECT object}, however the
 *  properties of the object are not validated against the specified `type`
 *  (i.e. they are not guaranteed to be valid for that type). Can also be
 *  the `fullyQualified` parameter if type arguments aren't applicable.
 * @param {boolean} [fullyQualified=false] If _truthy_, the generated typeset
 *  will always be {@link rtvref.types.fully_qualified_typeset fully-qualified}.
 *  Otherwise, it'll be the simplest typeset possible.
 * @returns {rtvref.types.typeset} The simplest typeset that represents the
 *  combination of the specified type, qualifier, and args, unless `fullyQualified`
 *  was set to `true`, in which case it'll always be an array typeset and
 *  fully-qualified.
 * @throws {Error} If `type`, `qualifier`, or `args` is invalid.
 */
export const toTypeset = function (type, ...rest) {
  const params = rest.filter((p) => p !== undefined);
  let qualifier = DEFAULT_QUALIFIER;
  let typeArgs;
  let typeArgsGiven = false;
  let fullyQualified = false;

  if (params.length === 1) {
    if (isString(params[0])) {
      qualifier = params[0];
    } else if (!isBoolean(params[0])) {
      typeArgsGiven = true;
      typeArgs = params[0];
    } else {
      fullyQualified = params[0]; // must be boolean
    }
  } else if (params.length === 2) {
    if (isBoolean(params[0])) {
      throw new Error('Expecting qualifier or args as the second parameter');
    }

    if (isString(params[0])) {
      qualifier = params[0];
    } else {
      typeArgsGiven = true;
      typeArgs = params[0]; // must be args
    }

    if (!isBoolean(params[1])) {
      if (typeArgs) {
        throw new Error('args parameter already specified');
      }
      typeArgsGiven = true;
      typeArgs = params[1];
    } else {
      fullyQualified = params[1]; // must be boolean
    }
  } else if (params.length >= 3) {
    qualifier = params[0];
    typeArgsGiven = true;
    typeArgs = params[1];
    fullyQualified = !!params[2]; // cast to boolean
  }

  types.verify(type); // catches the falsy value case too
  qualifiers.verify(qualifier); // catches the falsy value case too

  if (typeArgsGiven) {
    argTypes.verify(type);
    if (!isTypeArgs(typeArgs)) {
      throw new Error(`Invalid type args=${print(typeArgs)}`);
    }
  }

  let typeset;

  if (fullyQualified) {
    typeset = [qualifier, type];
    if (typeArgs) {
      typeset.push(typeArgs);
    }
  } else {
    if (qualifier === DEFAULT_QUALIFIER) {
      if (!typeArgs) {
        typeset = type;
      } else {
        typeset = [type, typeArgs];
      }
    } else {
      typeset = [qualifier, type];
      if (typeArgs) {
        typeset.push(typeArgs);
      }
    }
  }

  return typeset;
};

/**
 * Fully-qualifies a typeset, shallow (i.e. the first level only; nested typesets
 *  are not fully-qualified).
 *
 * This function does not modify the input `typeset`.
 *
 * @function rtvref.impl.fullyQualify
 * @param {rtvref.types.typeset} typeset Typeset to fully-qualify.
 * @param {rtvref.qualifiers} [qualifier] Optional qualifier to be used.
 *
 *  If the typeset is a simple {@link rtvref.types type},
 *   a {@link rtvref.types.shape_descriptor shape}, or
 *   a {@link rtvref.types.custom_validator custom validator} that was
 *   cherry-picked out of a typeset whose qualifier should be used instead of
 *   the {@link rtvref.qualifiers.DEFAULT_QUALIFIER default} one.
 *
 *  If `typeset` is an Array typeset, specifying this parameter will __override__
 *   the typeset's qualifier (otherwise, its own qualifier will be used).
 *
 * @returns {rtvref.types.fully_qualified_typeset} A new, fully-qualified typeset
 *  representing the input `typeset`. Only the first/immediate level of the
 *  input typeset is fully-qualified. The new array returned contains references
 *  to elements within the input typeset.
 * @throws {Error} If `typeset` or `qualifier` is not a valid.
 */
export const fullyQualify = function (typeset, qualifier) {
  if (!isTypeset(typeset)) {
    // start by validating so we can be confident later
    throw new Error(`Invalid typeset=${print(typeset, { isTypeset: true })}`);
  }

  if (qualifier) {
    qualifiers.verify(qualifier);
  }

  // NOTE: from this point on, we ASSUME that the typeset is valid, which lets
  //  us make assumptions about what we find within it; without this knowledge,
  //  the algorithm below would not work

  if (!isArray(typeset)) {
    qualifier = qualifier || DEFAULT_QUALIFIER;

    // must be either a string, shape, or function with an implied qualifier
    if (isShape(typeset)) {
      // must be a nested shape descriptor with default object type: move shape
      //  into args
      return [qualifier, DEFAULT_OBJECT_TYPE, { $: typeset }];
    }

    // if a validator, it has an implied type of ANY
    if (isCustomValidator(typeset)) {
      return [qualifier, types.ANY, typeset];
    }

    // string (basic type)
    return [qualifier, typeset];
  }

  const fqts = []; // ALWAYS a new array
  let hasQualifier = false; // true if a qualifier was found in first position
  let curType; // @type {(string|undefined)} current type in scope or undefined if none

  // typeset is an array: iterate its elements and build fqts iteratively
  typeset.forEach(function (rule, i) {
    // qualifiers are non-empty strings and must appear in the first element, if specified
    if (i === 0) {
      if (isString(rule) && qualifiers.check(rule)) {
        hasQualifier = true;
        fqts.push(qualifier || rule); // qualifier overrides the one in the typeset
        return; // next rule
      }

      // rule isn't a qualifier: use override or the default, and keep processing the rule
      fqts.push(qualifier || DEFAULT_QUALIFIER);
    }

    if (isString(rule)) {
      // must be a type
      curType = rule;
      fqts.push(curType);
    } else if ((i === 0 || (i === 1 && hasQualifier)) && isShape(rule)) {
      // nested shape descriptor using default object type that is either first
      //  in the array (also using default qualifier), or second (because a
      //  qualifier is in the first position): move shape into args
      curType = DEFAULT_OBJECT_TYPE;
      fqts.push(curType, { $: rule });
    } else if (isTypeArgs(rule)) {
      // args for curType since typeset is an array and object is not in first position
      fqts.push(rule);
    } else if (isCustomValidator(rule)) {
      // validator: ANY is implied type if none specified
      if (!curType) {
        curType = types.ANY;
        fqts.push(curType);
      }

      fqts.push(rule);
    } else {
      // must be an array: move Array typeset into args
      curType = types.ARRAY;
      fqts.push(curType, { $: rule });
    }
  });

  return fqts;
};

/**
 * Extracts (modifies) the next complete type from an Array typeset.
 *
 * For example, if the given `typeset` is `[EXPECTED, STRING, {string_args}, FINITE]`,
 *  the returned array would be `[EXPECTED, STRING, {string_args}]` and `typeset`
 *  would then be `[FINITE]`.
 *
 * @function rtvref.impl.extractNextType
 * @param {(rtvref.types.typeset|Array)} typeset An Array typeset from which to
 *  extract the next complete type. __This Array will be modified.__ Can also
 *  be an empty array (which is not a valid typeset, but is tolerated; see the
 *  return value for more information).
 * @param {(rtvref.qualifiers|boolean)} [qualifier] Optional, and can either
 *  be a valid qualifier, `true`, or `false`.
 *
 *  <h4>Parameter is specified, and is a qualifier</h4>
 *
 *  If __a qualifier is not found in `typeset`__, this qualifier will be used to
 *  qualify the returned sub-type Array typeset. If a qualifier is found in `typeset`,
 *  this parameter is ignored. If a qualifier is __not__ found in `typeset` and
 *  this parameter is specified, then this qualifier will be used to qualify the
 *  returned sub-type Array typeset.
 *
 *  __Examples:__
 *  - `typeset = [EXPECTED, STRING, FINITE];`
 *  - `extractNextType(typeset, REQUIRED) === [EXPECTED, STRING]`, `typeset === [FINITE]`
 *  - `extractNextType(typeset) === [FINITE]`, `typeset === []`
 *  - `typeset = [FINITE];`
 *  - `extractNextType(typeset, EXPECTED) === [EXPECTED, FINITE]`
 *
 *  <h4>Parameter is specified, and is a boolean</h4>
 *
 *  If `true`, the qualifier, if any, will be included in the returned sub-type
 *  Array typeset.
 *
 *  If `false`, the qualifier, if any, will be ignored.
 *
 *  __Examples:__
 *  - `extractNextType([STRING], true) === [STRING]`
 *  - `extractNextType([REQUIRED, STRING], true) === [EXPECTED, STRING]`
 *  - `extractNextType([REQUIRED, STRING], false) === [STRING]`
 *
 * @returns {(rtvref.types.typeset|Array)} The extracted __Array typeset__ as a
 *  new Array, which is a sub-type of the given `typeset`. This sub-typeset is
 *  not necessarily fully-qualified. If `typeset` was an empty array, an empty
 *  array is returned (which is the only case where an invalid Array typeset
 *  is tolerated, so that this function is easy to use in loops, checking for
 *  the stopping condition where the returned sub-typeset is empty).
 * @throws {Error} If `typeset` is not empty and not a valid Array typeset.
 * @throws {Error} If `qualifier` is specified but not valid.
 */
export const extractNextType = function (typeset, qualifier) {
  if (qualifier && !isBoolean(qualifier)) {
    qualifiers.verify(qualifier);
  }

  // check for an array first since that's much faster than isTypeset()
  if (!isArray(typeset) || (typeset.length > 0 && !isTypeset(typeset))) {
    throw new Error(
      `Invalid Array typeset=${print(typeset, { isTypeset: true })}`
    );
  }

  if (typeset.length === 0) {
    return [];
  }

  const subtype = []; // subset type of `typeset`
  let type = typeset.shift(); // NOTE: [].shift() === undefined

  // FIRST: check for the qualifier, which must be the first element, if specified
  if (qualifiers.check(type)) {
    if (qualifier !== false) {
      subtype.push(type); // include, and ignore the specified qualifier
    }

    // next type: typeset cannot be empty because it's valid and since
    //  there's a qualifier, there must be at least one type in it too
    type = typeset.shift();
  } else {
    // must be a type or the validator, which we'll check for below
    // use the specified qualifier, if any, and if allowed
    if (qualifier && !isBoolean(qualifier)) {
      subtype.push(qualifier);
    }
  }

  if (isString(type)) {
    // simple type
    subtype.push(type);

    // check for args if applicable to type (as of now, there are no types that
    //  require args)
    if (argTypes.check(type) && typeset.length > 0 && isTypeArgs(typeset[0])) {
      subtype.push(typeset.shift());
    }
  } else {
    // Must be either a shape, an array (nested typeset), or a validator:
    // - Shape: if the given typeset was in its original form (nothing extracted from it)
    //  then the first type could be a shape, in which case it has an implied type of
    //  OBJECT and is itself the args for it
    // - Array: a nested array is an Array typeset with an implied type of ARRAY and no args
    // - Validator: a custom validator has an implied type of ANY and no args
    subtype.push(type);
  }

  return subtype;
};

/**
 * [Internal] Checks for a valid `options` property in a
 *  {@link rtvref.validator.type_validator_context type validator context}.
 * @private
 * @function rtvref.impl._validateContextOptions
 * @param {rtvref.validator.type_validator_context} context Context to validate.
 * @returns {boolean} True if `context.options` is valid; false otherwise.
 */
export const _checkContextOptions = function (context) {
  // NOTE: for now, we would only have `context.options.exactShapes` as truthy/falsy,
  //  defaulting to falsy, so there's no need to check further into `context.options`
  return !!(context && (!context.options || isObject(context.options)));
};

/**
 * [Internal] Validates an object as being a valid
 *  {@link rtvref.validator.type_validator_context type validator context}.
 * @private
 * @function rtvref.impl._validateContext
 * @param {rtvref.validator.type_validator_context} context Context to validate.
 * @param {boolean} [silent=false] If `true` and the context is invalid, `false`
 *  is returned instead of an exception being thrown.
 * @returns {(rtvref.validator.type_validator_context|undefined)} The `context`
 *  that was validated; `undefined` if `silent` is `true` and the `context` is
 *  invalid.
 * @throws {Error} If `context` is invalid and `silent` is `false`.
 */
export const _validateContext = function (context, silent = false) {
  // NOTE: since the original value could be `undefined`, we only test for the
  //  presence of the property, not the value
  // WARNING: to avoid a possible infinite loop, we validate manually instead of
  //  being _smart_ and defining a typeset and using the `check()` function...
  if (
    !isObject(context) ||
    !hasOwnProp(context, 'originalValue') ||
    !hasOwnProp(context, 'parent') ||
    !(
      context.parent === undefined ||
      isObject(context.parent) ||
      isArray(context.parent) ||
      isMap(context.parent) ||
      isSet(context.parent)
    ) ||
    !hasOwnProp(context, 'parentKey') ||
    !_checkContextOptions(context)
  ) {
    if (silent) {
      return undefined;
    }

    // SECURITY: don't print the context since it may contain an original value,
    //  which could be sensitive information
    throw new Error('Invalid type validator context');
  }

  return context;
};

/**
 * [Internal] Creates a new
 *  {@link rtvref.validator.type_validator_context type validator context}.
 * @private
 * @function rtvref.impl._createContext
 * @param {Object} spec Context specification.
 * @param {*} [spec.originalValue] The original value for the context.
 * @param {(Object|Array|Map|Set|undefined)} [spec.parent] The parent reference
 *  for the context.
 * @param {*} [spec.parentKey] The key accessed in the parent.
 * @returns {rtvref.validator.type_validator_context} New context with an empty/root
 *  path.
 */
export const _createContext = function ({ originalValue, parent, parentKey }) {
  return {
    originalValue,
    parent,
    parentKey,
    // options (no defaults at this time)
  };
};

/**
 * [Internal] Checks the given context as being a valid
 *  {@link rtvref.validator.type_validator_context type validator context} and
 *  either creates a new context from it, or returns it as-is.
 * @private
 * @param {rtvref.validator.type_validator_context} givenContext Context to validate
 *  and use, or (if possible) use as the source for a new valid context.
 * @param {Object} spec Specification for a new context, if one needs to be created.
 *  __Ignored if `givenContext` is valid.__
 * @param {*} [spec.originalValue] The original value.
 * @param {(Object|Array|Map|Set|undefined)} [spec.parent] The parent reference.
 * @param {*} [spec.parentKey] The key accessed in the parent.
 * @returns {rtvref.validator.type_validator_context} A valid context. This is
 *  either `givenContext` verbatim, or a new context object based on `spec`. If new,
 *  it may use parts of the `givenContext` if it was usable.
 */
export const _getContext = function (givenContext, spec) {
  if (_validateContext(givenContext, true)) {
    return givenContext;
  }

  const newContext = _createContext(spec);

  if (_checkContextOptions(givenContext)) {
    // the `givenContext` is invalid as a whole, but we can at least use the options it
    //  has (most likely, only options were given in the context to initiate a `check()`)
    newContext.options = {
      ...newContext.options,
      ...givenContext.options, // override default options, if any
    };
  }

  return newContext;
};

/**
 * [Internal] Invokes a custom validator function found in a typeset.
 * @private
 * @function rtvref.impl._callCustomValidator
 * @param {rtvref.types.custom_validator} validator Custom validator to invoke.
 * @param {*} value Value being verified.
 * @param {rtvref.types.fully_qualified_typeset} match Fully-qualified typeset
 *  for the subtype of `typeset` that matched.
 * @param {rtvref.types.typeset} typeset Typeset used for verification.
 * @param {rtvref.validator.type_validator_context} context Additional context
 *  for the check.
 *
 *  NOTE: A new context will not be generated. An existing context must be given.
 *
 * @returns {(undefined|Error)} `undefined` if the validator succeeded; `Error`
 *  if the validator failed.
 * @throws {Error} If the specified `context` is not valid.
 */
export const _callCustomValidator = function (
  validator,
  value,
  match,
  typeset,
  context
) {
  // NOTE: here, we expect to be given a valid context rather than optionally generating a new one
  _validateContext(context);

  let failure;

  try {
    const result = validator(value, match, typeset, context);

    if (result !== undefined && !result) {
      // undefined === no action === success
      failure = new Error('Verification failed by the custom validator');
    }
  } catch (err) {
    failure = err;
  }

  return failure;
};

/**
 * [Internal] Common options for the various `check*()` functions.
 * @private
 * @typedef {Object} rtvref.impl._checkOptions
 * @property {Array.<string>} path The current path into the original typeset.
 *  Initially empty to signify the root (top-level) value being checked.
 * @property {boolean} isTypeset `true` if the typeset specified in the public
 *  parameters has already been validated and is a valid __shallow__ typeset;
 *  `false` otherwise (which means the typeset should first be validated before
 *  being processed).
 * @property {(string|undefined)} qualifier The {@link rtvref.qualifiers qualifier}
 *  in context; `undefined` if none. This property should be used when calling
 *  a `check*()` function for a typeset subtype where the typeset's qualifier
 *  should be attributed to the subtype rather than the
 *  {@link rtvref.qualifiers.DEFAULT_QUALIFIER default qualifier}.
 * @see {@link rtvref.impl.check}
 * @see {@link rtvref.impl.checkWithType}
 * @see {@link rtvref.impl.checkWithShape}
 * @see {@link rtvref.impl.checkWithArray}
 */

/**
 * [Internal] Gets check options for any of the `check*()` functions.
 * @private
 * @function rtvref.impl._getCheckOptions
 * @param {rtvref.impl._checkOptions} [current] Current options, used as a basis
 *  for new options.
 * @returns {rtvref.impl._checkOptions} A full, new options object, based on
 *  `current` options, if any. The object returned may contain references to objects
 *  in `current` depending on property types.
 * @throws {Error} If `current.path` or `override.path` is specified and not an array.
 * @see {@link rtvref.impl.check}
 * @see {@link rtvref.impl.checkWithType}
 * @see {@link rtvref.impl.checkWithShape}
 * @see {@link rtvref.impl.checkWithArray}
 */
export const _getCheckOptions = function (current = {}) {
  if (current.path && !isArray(current.path)) {
    throw new Error(
      `current.path must be an Array when specified, current.path=${print(
        current.path
      )}`
    );
  }

  const options = {
    path: current.path || [],
    isTypeset: false,
    qualifier: current.qualifier || undefined,
  };

  // careful with isTypeset since it's a boolean: check for property existence
  //  so we don't misinterpret undefined as a falsy value we should use
  if (hasOwnProp(current, 'isTypeset')) {
    options.isTypeset = !!current.isTypeset;
  }

  return options;
};

/**
 * Checks a value using a single type.
 * @function rtvref.impl.checkWithType
 * @param {*} value Value to check.
 * @param {(string|Array|Object)} singleType Either a simple type name (one of
 *  {@link rtvref.types.types}), a {@link rtvref.types.shape_descriptor shape descriptor},
 *  or an Array {@link rtvref.types.typeset typeset} which represents a single type.
 *
 *  In the string/simple case, the
 *   {@link rtvref.qualifiers.DEFAULT_QUALIFIER default qualifier} is assumed.
 *
 *  In the shape descriptor case, the
 *   {@link rtvref.types.DEFAULT_OBJECT_TYPE default object type} is assumed.
 *
 *  In the Array case, the qualifier is optional, and a type, along with args,
 *   if any, is expected (e.g. `[type]`, `[qualifier, type]`, `[type, args]`, or
 *   `[qualifier, type, args]`). Note that the type may be implied if the shorthand
 *   notation is being used for an ARRAY, or if the
 *   {@link rtvref.types.DEFAULT_OBJECT_TYPE default object type} is being implied
 *   for a shape, e.g. `[{foo: rtv.STRING}]`.
 *
 *  NOTE: A {@link rtvref.types.custom_validator custom validator} is not considered
 *   a valid single type. It's also considered a __separate type__ if it were passed-in
 *   via an Array, e.g. `[STRING, validator]`, which would violate the fact that
 *   `singleType` should be one type, and therefore cause an exception to be thrown.
 *
 * @param {(rtvref.validator.type_validator_context|undefined)} [context] Additional
 *  context for the check. If _falsy_, a new context will be created for all
 *  downstream checks using `value` as the original value, and `undefined` as
 *  the parent.
 * @returns {(rtvref.RtvSuccess|rtvref.RtvError)} A success indicator if the
 *  `value` is compliant to the type; an error indicator if not.
 * @throws {Error} If `singleType` is not a valid simple type or single type.
 * @throws {Error} If the specified `context` is not valid.
 * @see {@link rtvref.types}
 */
// @param {rtvref.impl._checkOptions} [options] (internal parameter)
export const checkWithType = function (
  value,
  singleType,
  context
  //, options
) {
  context = _getContext(context, { originalValue: value });

  const options = _getCheckOptions(
    arguments.length > 3 ? arguments[3] : undefined
  );

  if (!options.isTypeset && !isTypeset(singleType)) {
    throw new Error(
      `Invalid typeset in singleType=${print(singleType, { isTypeset: true })}`
    );
  }

  options.isTypeset = true;

  const qualifier = options.qualifier || getQualifier(singleType);

  let type; // @type {string}
  let args; // @type {Object}

  if (isString(singleType)) {
    type = singleType;
    // simple type: no args
  } else if (isShape(singleType)) {
    type = DEFAULT_OBJECT_TYPE;
    args = { $: singleType }; // move shape into args.$
  } else if (isArray(singleType)) {
    const singleTypeCopy = fullyQualify(singleType); // make any implied types concrete
    const typeset = extractNextType(singleTypeCopy, false);

    if (singleTypeCopy.length > 0) {
      // if singleType was just one type, copy should be empty now
      throw new Error(
        `Specified singleType=${print(singleType, {
          isTypeset: true,
        })} typeset must represent a single type`
      );
    }

    type = typeset[0];
    args = typeset.length > 1 ? typeset[1] : undefined;
  } else {
    throw new Error(
      `Specified singleType=${print(singleType, {
        isTypeset: true,
      })} must be a string, shape, or Array`
    );
  }

  if (_validatorMap[type]) {
    // call the validator for the specified type
    let result = _validatorMap[type](value, qualifier, args, context);

    if (!result.valid) {
      // create a new error from the original, but with the current path and the
      //  original path combined
      result = new RtvError(
        value,
        singleType,
        options.path.concat(result.path),
        result.mismatch,
        result.rootCause
      );
    }

    return result;
  }

  throw new Error(`Missing validator for type=${print(type)}`);
};

/**
 * Checks a value using a {@link rtvref.types.shape_descriptor shape descriptor} and
 *  ensure the value's type is the default object type.
 * @function rtvref.impl.checkWithShape
 * @param {Object} value Value to check. Must be of the
 *  {@link rtvref.types.DEFAULT_OBJECT_TYPE default} object type.
 * @param {Object} shape Expected shape of the `value`. Must be an
 *  {@link rtvref.types.OBJECT OBJECT}.
 * @param {(rtvref.validator.type_validator_context|undefined)} [context] Additional
 *  context for the check. If _falsy_, a new context will be created for all
 *  downstream checks using `value` as the original value, and an empty/root path.
 * @returns {(rtvref.RtvSuccess|rtvref.RtvError)} A success indicator if the
 *  `value` is compliant to the shape; an error indicator if not.
 * @throws {Error} If `shape` is not an {@link rtvref.types.OBJECT OBJECT}.
 * @throws {Error} If the specified `context` is not valid.
 */
// @param {rtvref.impl._checkOptions} [options] (internal parameter)
export const checkWithShape = function (value, shape, context /*, options*/) {
  context = _getContext(context, { originalValue: value });

  if (!isShape(shape)) {
    throw new Error(`Invalid shape=${print(shape, { isTypeset: true })}`);
  }

  const options = _getCheckOptions(
    arguments.length > 3 ? arguments[3] : undefined
  );

  // type validators are ultimately responsible for checking values against shapes
  return checkWithType(value, shape, context, options);
};

/**
 * Checks a value using an Array typeset.
 * @function rtvref.impl.checkWithArray
 * @param {*} value Value to check.
 * @param {Array} arrayTs The Array {@link rtvref.types.typeset typeset} to check
 *  against.
 * @param {(rtvref.validator.type_validator_context|undefined)} [context] Additional
 *  context for the check. If _falsy_, a new context will be created for all
 *  downstream checks using `value` as the original value, and an empty/root path.
 * @returns {(rtvref.RtvSuccess|rtvref.RtvError)} Success indicator if the `value`
 *  is compliant to the `typeset`; error indicator otherwise. An exception is
 *  __not__ thrown if the `value` is non-compliant.
 * @throws {Error} If `typeset` is not a valid Array typeset.
 * @throws {Error} If the specified `context` is not valid.
 */
// @param {rtvref.impl._checkOptions} [options] (internal parameter)
export const checkWithArray = function (value, arrayTs, context /*, options*/) {
  context = _getContext(context, { originalValue: value });

  const options = _getCheckOptions(
    arguments.length > 3 ? arguments[3] : undefined
  );

  // check for an array first since that's much faster than isTypeset()
  if (!isArray(arrayTs) || !(options.isTypeset || isTypeset(arrayTs))) {
    throw new Error(
      `Invalid typeset in array=${print(arrayTs, { isTypeset: true })}`
    );
  }

  options.isTypeset = true;

  let match; // @type {(rtvref.types.fully_qualified_typeset|undefined)}
  let err; // @type {(RtvError|undefined)}
  let mvv; // @type {*} Minimum Viable Value
  const qualifier = options.qualifier || getQualifier(arrayTs);

  // consider each type in the typeset until we find one that matches the value
  // NOTE: an Array typeset represents multiple possibilities for a type match
  //  using a short-circuit OR conjunction
  // NOTE: due to the isTypeset check above, we can assume that each 'type' is
  //  a SHALLOW-valid typeset (meaning, if it's an Array typeset, we cannot
  //  assume that itself is valid because the isTypeset check was just shallow)
  const typesetCopy = arrayTs.concat(); // shallow clone so we can modify the array locally
  let subtype = extractNextType(typesetCopy, false); // exclude qualifier we already have
  const isSingleType = typesetCopy.length === 0; // was there just one type in the Array typeset?
  while (subtype.length > 0) {
    // check for the validator, which will always come alone, and since the validator
    //  must be at the end of an Array typeset, it also signals the end of all subtypes
    if (subtype.length === 1 && isCustomValidator(subtype[0])) {
      // if we reach the validator (which must be the very last element) in this
      //  loop, none of the types matched, unless the validator is the only
      //  type in the typeset, at which point it gets an implied type of ANY,
      //  which matches any value
      // NOTE: we have to test the original typeset for the ANY condition
      if (
        arrayTs.length === 1 ||
        (arrayTs.length === 2 && qualifiers.check(arrayTs[0]))
      ) {
        match = fullyQualify(types.ANY, qualifier);
      }

      break; // break (since this must be the last element in typeset)
    } else {
      const result = checkWithType(
        value,
        subtype,
        context,
        _getCheckOptions({
          path: options.path,
          qualifier,
          isTypeset: true, // subtype must be valid per extractNextType()
        })
      );

      if (result.valid) {
        match = fullyQualify(subtype, qualifier);
        mvv = result.mvv;
        break; // break on first match
      } else if (isSingleType) {
        // capture the error since the Array typeset is a single type; this way,
        //  we can provide more helpful error reporting
        err = result;
      }
    }

    // next subtype
    subtype = extractNextType(typesetCopy);
  }

  if (match) {
    // check for a validator at the end of the Array typeset and invoke it
    const lastType = arrayTs[arrayTs.length - 1];
    if (isCustomValidator(lastType)) {
      const failure = _callCustomValidator(
        lastType,
        value,
        match,
        arrayTs,
        context
      );
      if (failure !== undefined) {
        // invalid in spite of the match since the validator said no
        err = new RtvError(
          value,
          arrayTs,
          options.path,
          fullyQualify(arrayTs, qualifier),
          failure
        );
      }
    }
    // else, valid, since we have a match
  } else {
    // no match: if we already have an error, then the Array typeset should have
    //  contained a single type, e.g. `[qualifier, type, args]`, so build a new
    //  error from that one; otherwise, the Array typeset should have contained
    //  multiple types, in which case we can't tailor an error to any one type
    //  since the value failed against all of them
    if (err) {
      err = new RtvError(
        value,
        arrayTs,
        options.path.concat(err.path),
        err.mismatch,
        err.rootCause
      );
    } else {
      // make a generic error for the value not matching any of the multiple types
      //  in the Array typeset
      err = new RtvError(
        value,
        arrayTs,
        options.path,
        fullyQualify(arrayTs, qualifier)
      );
    }
  }

  return err || new RtvSuccess({ mvv });
};

/**
 * Checks a value against a typeset.
 * @function rtvref.impl.check
 * @param {*} value Value to check.
 * @param {rtvref.types.typeset} typeset Expected shape/type of the value.
 * @param {(rtvref.validator.type_validator_context|undefined)} [context] Additional
 *  context for the check. If _falsy_, a new context will be created for all
 *  downstream checks using `value` as the original value, and an empty/root path.
 * @returns {(rtvref.RtvSuccess|rtvref.RtvError)} Success indicator if the `value`
 *  is compliant to the `typeset`; error indicator otherwise. An exception is
 *  __not__ thrown if the `value` is non-compliant.
 * @throws {Error} If `typeset` is not a valid typeset.
 * @throws {Error} If the specified `context` is not valid.
 */
// @param {rtvref.impl._checkOptions} [options] (internal parameter)
export const check = function (value, typeset, context /*, options*/) {
  context = _getContext(context, { originalValue: value });

  const options = _getCheckOptions(
    arguments.length > 3 ? arguments[3] : undefined
  );

  if (options.isTypeset || isTypeset(typeset)) {
    options.isTypeset = true;

    if (isString(typeset)) {
      // simple type: check value is of the type
      return checkWithType(value, typeset, context, options);
    }

    if (isCustomValidator(typeset)) {
      // custom validator: bare function implies the ANY type
      const impliedType = types.ANY;

      // value must be ANY type, and custom validator must return true
      const result = checkWithType(value, impliedType, context, options);
      if (!result.valid) {
        return result;
      }

      // the fully-qualified match should NOT include the validator, only
      //  the subtype within the implied typeset that matched
      const match = fullyQualify(impliedType, options.qualifier);

      const failure = _callCustomValidator(
        typeset,
        value,
        match,
        typeset,
        context
      );
      if (failure !== undefined) {
        return new RtvError(
          value,
          typeset,
          options.path,
          fullyQualify(typeset, options.qualifier),
          failure
        );
      }

      return result; // will be RtvSuccess instance based on ANY type check
    }

    if (isShape(typeset)) {
      // shape descriptor: check value against shape
      return checkWithShape(value, typeset, context, options);
    }

    if (isArray(typeset)) {
      // Array typeset: check value against all types in typeset
      return checkWithArray(value, typeset, context, options);
    }

    throw new Error(
      `Invalid JavaScript type for typeset=${print(typeset, {
        isTypeset: true,
      })}`
    );
  }

  throw new Error(`Invalid typeset=${print(typeset, { isTypeset: true })}`);
};

/**
 * [Internal] Registers a validator, adding a new type that can be
 *  {@link rtvref.impl.check checked}.
 *
 * If a validator has already been registered for a particular type, the previous
 *  validator is replaced by the newer one.
 *
 * @private
 * @function rtvref.impl._registerType
 * @param {rtvref.validator} validator The validator representing the type to be
 *  registered.
 * @throws {Error} if `validator` does not have the expected interface.
 */
export const _registerType = function (validator) {
  // NOTE: we can't dogfood and describe a shape to check() because the types
  //  needed may not have been registered yet
  if (
    !isObject(validator) ||
    !types.check(validator.type) ||
    !isFunction(validator.config) ||
    !isFunction(validator.validate)
  ) {
    throw new Error(
      `Cannot register an invalid validator for type=${print(
        validator && validator.type
      )}: missing at least one required property in [type, config, validate]`
    );
  }

  _validatorMap[validator.type] = validator.validate;
};
