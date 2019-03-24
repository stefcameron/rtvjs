[![pipeline status](https://gitlab.com/stefcameron/rtvjs/badges/master/pipeline.svg)](https://gitlab.com/stefcameron/rtvjs/commits/master)

# RTV.js

Runtime Verification Library for browsers and Node.js.

This library is isomorphic: It runs equally well in modern browsers and on the server with Node.js.

The latest versions of major browsers, and maintained Node.js releases, are supported.

# Installation

```bash
npm install rtvjs
```

The package's `/dist` directory contains two types of builds:

*   `rtv.umd.js/rtv.umd.min.js`: UMD loader, full and minified.
*   `rtv.esm.js/rtv.esm.min.js`: ES6 Module, full and minified.

## UMD

The UMD build can be used like this:

```javascript
// as a global, when loaded via a <script> tag in HTML
window.rtv;

// as a CommonJS module (e.g. Node.js)
const rtv = require('rtvjs');

// as an AMD module (e.g. RequireJS)
define(['rtvjs'], function(rtv) {
});
```

## ESM

The ES6 module build can be used like this:

```javascript
import rtv from 'rtvjs';
```

# Documentation

[API](API.md)

# Changes

[Changelog](CHANGELOG.md)

# Purpose

To provide an easy, intuitive way to perform validations at __runtime__ on values whenever they cross the boundaries of an API or a function call.

Tools like [TypeScript](http://www.typescriptlang.org/) and [Flow](https://flow.org/) are useful for static analysis (i.e. as code is being written and then transpiled to regular JavaScript), but they don't work at __runtime__.

For example, they can't signal when there are integration issues between frontend and backend systems that are being co-developed. In one conversation, an API may be designed to return an object with certain properties. Later on, an on-the-fly decision to alter the implementation (yes, it happens in spite of the best intentions and processes), or simply a bug in the implementation, may result in an object that is missing an expected property, or has a property with an unexpected value.

Let's consider a case where a "state" property, which is really an enumeration of string values, ends-up set to an unexpected state. What should a client do with an unexpected state when there's no implementation to back it up? Ignoring it could be an option, but perhaps not the best course of action. Even worse, the unexpected state _somehow_ could trickle deep down into code before it finally causes an exception, making it really difficult to find the true source of the problem.

RTV.js can help signal the unexpected state by failing early, right at the API boundary:

```javascript
async function getTodoList() {
  const response = await fetch('/api/todos');
  const json = await response.json();

  // verify (require) that the response be a list of TODO items: this function
  //  will throw if `json` doesn't meet the specified typeset (requirement)
  rtv.verify(json, [[{ // list of objects (could be empty)
    // non-empty string
    title: rtv.t.STRING,
    // 'YYYY-MM-DD', or null
    due: [rtv.q.EXPECTED, rtv.t.STRING, {exp: '\\d{4}-\\d{2}-\\d{2}'}],
    // string (could be empty), null, or not even defined
    note: [rtv.q.OPTIONAL, rtv.t.STRING]
  }]]);

  return json;
}
```

There may also be a need to ensure that a critical function call is being given the parameters it expects. Rather than write a series of `if (!state) { throw new Error('state is required'); }` (which don't tell us much about what "state" is expected to be, other than it's _required_), it would be more helpful to have an easy way to express that "state" should be a non-empty string with a value in a given list (i.e. a value found in an enumeration).

RTV.js can help signal the unexpected state immediately when execution enters the function:

```javascript
function applyState(state) {
  rtv.verify(state, [rtv.t.STRING, {oneOf: ['on', 'off']}]);

  if (state === 'on') {
    // turn the lights on
  } else {
    // turn the lights off
  }
}

applyState('on'); // ok
applyState('dimmed'); // ERROR
```

While tools like TypeScript and Flow have their merits, [they come at a steep price](https://medium.com/javascript-scene/the-typescript-tax-132ff4cb175b), and some JavaScript developers are opposed to using them. Typings or not, integration issues __will__ remain. RTV.js allows you to check for types when it _really_ matters (at runtime), and has a simple API so it's easy to learn.

# Goals

The following statement verifies that the variable "state" is a non-empty string whose value is found in a list of permitted values:

```javascript
rtv.verify(state, [rtv.t.STRING, {oneOf: ['on', 'off']}]);
```

The `[rtv.t.STRING, {oneOf: ['on', 'off']}]` portion of the example above is called a _typeset_. It expresses the expectation for the value of the "state" variable.

[Typesets](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.typeset) must be:

*   Easy to express, using rich [types](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvreftypes-object) and [qualifiers](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvrefqualifiers-object).
*   Composable, whereby complex typesets can be built by combining multiple typesets into larger ones.
*   Easy to customize, using [custom validators](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#typescustom_validator-function) when the existing types and arguments don't provide the exact verification needed on a value.
*   Intuitive, using simple native JavaScript language constructs like strings (for types), inline Arrays `[]` for lists and complex typesets, and inline objects `{}` for [shapes](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.shape_descriptor) (i.e. _interfaces_).
*   [Serializable](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#json-serialization) to JSON via `JSON.stringify()` so they can be easily transferred between systems.
    *   Backend and frontend systems in JavaScript stacks could dynamically inform one another of expectations by sharing typesets.
    *   Similar to the `@context` property of a JavaScript Object for [JSON-LD](https://json-ld.org/), an object's expected [shape](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.shape_descriptor) could be transferred along with the object itself.
    *   With the exceptions of [custom validator](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#typescustom_validator-function) functions and the `ctor` property of [shape object arguments](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.shape_object_args).

# Tutorials

Tutorials and example uses of the RTV.js library.

## Getting Started

### Checks and Verifications

RTV.js provides two functions for verifying values against [typesets](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.typeset). A _typeset_ is simply a set of one or more types that form an expectation about the value:

```javascript
rtv.verify(value, typeset); // will throw an error if verification fails
rtv.check(value, typeset); // returns the error instead of throwing it
```

### Simple Types

Typesets can be strings, objects (shapes), functions (custom validators), or Arrays (multiple possibilities).

At their simplest, typesets are strings that represent type names like `STRING`, `INT`, `DATE`, etc. See the full list of types [here](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.types).

```javascript
rtv.verify('Hello world!', rtv.t.STRING); // ok
rtv.verify('', rtv.t.STRING); // ERROR: a required string cannot be empty
```

### Qualifiers

The first verification succeeds because the value is a non-empty string. The second one fails because the typeset uses the default [qualifier](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.qualifiers.qualifiers), which is `REQUIRED`. A _required_ string cannot be empty (nor can it be `null` or `undefined`).

In some implementations, an empty string is considered a bad value because it's a _falsy_ value in JavaScript, just like `null`, `undefined`, `false`, and `0`.

There are two other qualifiers, `EXPECTED` and `OPTIONAL`. A typeset may only have one qualifier, and it must be specified before any types.

The only way to specify an alternate qualifier is to use an Array to describe the typeset: `[<qualifier>, types...]`

If we wanted to accept an empty string (or `null`) as the value, we could use the `EXPECTED` qualifier:

```javascript
rtv.verify('Hello world!', [rtv.q.EXPECTED, rtv.t.STRING]); // ok
rtv.verify('', [rtv.q.EXPECTED, rtv.t.STRING]); // ok
rtv.verify(null, [rtv.q.EXPECTED, rtv.t.STRING]); // ok
```

### Type Arguments

Some types accept arguments. Arguments are simple objects that map argument names to values, and immediately follow a type in a typeset. Once again, an Array must be used to describe the typeset. Type arguments are optional, unless otherwise stated; some types don't accept arguments.

The `STRING` type accepts [arguments](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.STRING_args), one of which is `min`. It lets us specify the minimum length of the string. By default, when the qualifier is `REQUIRED`, `min` defaults to 1, but we can override that:

```javascript
rtv.verify('Hello world!', [rtv.t.STRING, {min: 0}]); // ok
rtv.verify('', [rtv.t.STRING, {min: 0}]); // ok
rtv.verify(null, [rtv.t.STRING, {min: 0}]); // ERROR
```

This verifies the value cannot be `null` or `undefined` because of the (implied) `REQUIRED` qualifier. However, it could be empty because the `min` argument allows a zero-length string as the value.

### Multiple Types

So far, we've seen simple typesets: either just a string as the type name, or the type name and some arguments, and an optional qualifier that precedes it. There may be cases where a value could be one of multiple types. To verify against additional types, an Array is used to state all the possibilities: `[<qualifier>, <type1>, <type1-args>, <type2>, <type2-args>, ...]`. This is called an "Array typeset", which we've already seen in the two previous sections.

Since a value can only be of a single type at any given time, Array typesets are evaluated using a __short-circuit OR conjunction__, which means the verification will pass as long as at least one type verifies the value (and verification will stop evaluating any other types against the value once a match is made).

For example, we could verify that a value is either a boolean, or a string that looks like a boolean:

```javascript
const typeset = [rtv.t.BOOLEAN, rtv.t.STRING, {
  exp: '^(?:true|false)$',
  expFlags: 'i'
}];
rtv.verify(true, typeset); // ok
rtv.verify('true', typeset); // ok
rtv.verify('True', typeset); // ok
rtv.verify('TRUE', typeset); // ok
rtv.verify(false, typeset); // ok
rtv.verify('false', typeset); // ok
```

> Since the check for the `BOOLEAN` type is faster than evaluating a regular expression against a string, we list the `BOOLEAN` type first in the typeset.

### Shapes

Most of the time, especially when integrating with an API, you'll want to verify what you receive against an expected [shape](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.shape_descriptor). A _shape_ describes the __interface__ an __object__ is expected to have. As the term implies, an interface describes the properties, and types thereof, expected on an object while ignoring any other properties that the object may have (since the code using this object shouldn't care about them anyway).

Plain JavaScript objects are used to describe shapes, where expected property names are own-enumerable properties mapped to typesets. For example, we could describe a simple TODO item like this:

```javascript
{
  title: rtv.t.STRING, // non-empty string
  created: rtv.t.DATE, // Date instance
  priority: rtv.t.INT // some whole number
}
```

Since typesets are fully nestable/composable, we can get a bit more sophisticated by using Array typesets so we can provide arguments and different qualifiers:

```javascript
{
  title: rtv.t.STRING, // required (non-empty) title
  created: [rtv.q.OPTIONAL, rtv.t.DATE], // either a TODO or just a note
  priority: [rtv.t.INT, {oneOf: [0, 1, 2]}] // 0=none, 1=low, 2=high
}
```

Since shapes also represent objects, they have an _implied_ (default) type of [OBJECT](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.OBJECT). When [fully-qualified](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.fully_qualified_typeset) (which means not using any implied typeset elements like the qualifier and type), the shape would __move into the special `$` argument__ of the `OBJECT` type:

```javascript
[rtv.q.REQUIRED, rtv.t.OBJECT, {$: {
    title: rtv.t.STRING,
    created: [rtv.q.OPTIONAL, rtv.t.DATE],
    priority: [rtv.t.INT, {oneOf: [0, 1, 2]}]
  }
}]
```

When the default object type is sufficient, it's really easy to nest shapes. Let's say our TODO item also had a note, which is an object with "text" and "updated" properties:

```javascript
const {STRING, DATE, INT} = rtv.t;
const {EXPECTED, OPTIONAL} = rtv.q;

const item = {
  title: 'Make Christmas Oatmeal',
  due: new Date('12/25/2018'),
  priority: 1,
  note: {
    text: 'Make 4 cups to have enough to share!',
    updated: new Date('09/21/2018')
  }
};

rtv.verify(item, {
  title: STRING,
  created: [OPTIONAL, DATE],
  priority: [INT, {oneOf: [0, 1, 2]}],
  note: {         // <- nested shape
    text: STRING, // <- required contents
    updated: DATE // <- required Date
  }
}); // ok
```

The typeset above would require a TODO item to have a "note" with a non-empty string value for "text", and a `Date` instance for "updated". We could make the entire note optional, however, by _expecting_ it to be either `null` if a note wasn't provided, or the shape if one was:

```javascript
const {STRING, DATE, INT} = rtv.t;
const {EXPECTED, OPTIONAL} = rtv.q;

const item = {
  title: 'Make Christmas Oatmeal',
  due: new Date('12/25/2018'),
  priority: 1,
  note: null
};

rtv.verify(item, {
  title: STRING,
  created: [OPTIONAL, DATE],
  priority: [INT, {oneOf: [0, 1, 2]}],
  note: [EXPECTED, { // <- null, or note object
    text: STRING,
    updated: DATE
  }]
}); // ok
```

> When the default object type is implied, this is called the _shorthand syntax_. For shapes, it may be used when the typeset is the shape itself, or in an Array typeset that is _not_ [fully-qualified](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.fully_qualified_typeset), when a qualifier immediately precedes the shape (as we've done above for the "note" property).

### Lists

Many times, an API response or a function's arguments will contain a list of values or objects. At their most basic, lists are simple JavaScript Arrays that contain values of some type. The simplest way to verify a list is homogenous is to use the _shorthand_ syntax for the [ARRAY](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.ARRAY) type:

```javascript
[[rtv.t.STRING]]
```

This would verify that an Array contains non-empty string values, but the Array could be __empty__, given the default [arguments](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.ARRAY_args).

> __Note the nested Array.__

What the example above defines is an Array typeset that has a single _implied_ `ARRAY` type with an element typeset of `STRING` that will be applied to all elements found in the Array.

When the __full notation__ is used, the element typeset __moves into the `ts` argument__:

```javascript
[rtv.t.ARRAY, {ts: [rtv.t.STRING]}] // same as before, but in full notation
```

Either form is acceptable, and either form can show-up anywhere in a typeset. Therefore, we could verify a value is either a boolean, an Array of non-empty strings, or an Array of integers like this:

```javascript
[rtv.t.BOOLEAN, [rtv.t.STRING], [rtv.t.INT]]
```

A more practical example could be requiring a TODO item to have a non-empty list of notes associated with it, if "notes" isn't `null`, meaning there are no notes (i.e. either "notes" is `null` because there are no notes, or "notes" is an Array of note objects containing at least one note):

```javascript
const {STRING, DATE, INT} = rtv.t;
const {EXPECTED, OPTIONAL} = rtv.q;

const item = {
  title: 'Make Christmas Oatmeal',
  due: new Date('12/25/2018'),
  priority: 1,
  note: null
};

const shape = {
  title: STRING,
  created: [OPTIONAL, DATE],
  priority: [INT, {oneOf: [0, 1, 2]}],
  note: [EXPECTED, ARRAY, { // <- null, or non-empty Array of notes
    ts: {
      text: STRING,
      updated: DATE
    },
    min: 1 // <- require a non-empty Array when not null
  }]
};

rtv.verify(item, shape); // ok

item.notes = [];

rtv.verify(item, shape); // ERROR: `notes` cannot be empty

item.notes.push({
  text: 'Make 4 cups to have enough to share!',
  updated: new Date('09/21/2018')
});

rtv.verify(item, shape); // ok
```

### Custom Validations

Finally, there may be occasions where a type, or even its arguments, aren't sufficient to verify the value. In that case, the typeset can be customized with a [custom validator](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.custom_validator) function.

> The function on its own is considered a valid typeset, and gets an _implied_ type of [ANY](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.ANY), which validates _anything_, even `undefined` and `null`, regardless of the qualifier.

Let's say we wanted to verify that a value is a multiple of two. None of the [numeric type arguments](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.numeric_args) will verify that on their own, so we would need a custom validator:

```javascript
function validator(value) {
  const n = parseInt(value);
  return (!IsNaN(n) && n % 2 === 0);
}

rtv.verify(2, validator); // ok
rtv.verify(3, validator); // ERROR
```

A custom validator can fail the verification either by returning a _falsy_ value (other than `undefined`), or throwing an `Error`. When a _falsy_ value is returned, a default `Error` will be generated. Throwing an error with a helpful message is the recommended way to fail verification because of a custom validator:

```javascript
function(value) {
  const n = parseInt(value);
  if (IsNaN(n) || n % 2 != 0) {
    throw new Error('Not a number, or not a multiple of two.');
  }
}

rtv.verify(2, validator); // ok
rtv.verify(3, validator); // ERROR (failure: 'Not a number...')
```

> The error thrown by the custom validator (or the one generated by the library) will be included in the [failure](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.RtvError+failure) property of the failed verification results.

Custom validators are intended to be used as _compliments_ to existing types rather than complete replacements as we've been doing so far. For example, rather than worry about parsing the value as an integer and checking to see if it's not a number, we could let RTV.js first verify the value is an [integer](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.INT) by using an Array typeset:

```javascript
const typeset = [rtv.t.INT, (v) => v % 2 === 0];

rtv.verify(2, typeset); // ok
rtv.verify(3, typeset); // ERROR (failure: 'Verification failed...')
```

An Array typeset may have at most __one__ custom validator, and it must be the __last__ element. Each sub-typeset may have its own validator. When one or more types are in the typeset, the validator is immediately invoked if one of the types matches (i.e. verifies) the value (any remaining types are ignored):

```javascript
const typeset = [rtv.t.INT, rtv.t.STRING, (v) => v % 2 === 0];

// in both cases, STRING verification is skipped because INT matches first
rtv.verify(2, typeset); // ok
rtv.verify(3, typeset); // ERROR (failure: 'Verification failed...')
```

Finally, we could enhance our TODO item verification with a custom validator that verifies the `created` Date is not in the past:

```javascript
const {STRING, DATE, INT} = rtv.t;
const {EXPECTED, OPTIONAL} = rtv.q;

const item = {
  title: 'Make Christmas Oatmeal',
  due: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
  priority: 1,
  note: null
};

const shape = {
  title: STRING,
  created: [
    OPTIONAL,
    DATE,
    (v) => !v || v.getTime() >= Date.now()) // <- validator
  ],
  priority: [INT, {oneOf: [0, 1, 2]}],
  note: [EXPECTED, ARRAY, {
    ts: {
      text: STRING,
      updated: DATE
    },
    min: 1
  }]
};

rtv.verify(item, shape); // ok

item.due = new Date(Date.now() - 12 * 60 * 1000); // 12 hours ago

rtv.verify(item, shape); // ok
```

> Notice how the validator must handle `null` and `undefined` values because of the [OPTIONAL](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.qualifiers.OPTIONAL) qualifier, and is careful to return a _truthy_ result so that the property remains _optional_.

## Configuration

RTV.js provides a [configuration](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtv.config) interface which allows [checks](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtv.check) (`rtv.check(value, typeset)`) and [verifications](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtv.verify) (`rtv.verify(value, typeset)`) to be globally enabled or disabled:

```javascript
rtv.config.enabled = false; // default: true

rtv.verify('foo', rtv.t.INT); // no-op, always returns RtvSuccess
rtv.check('foo', rtv.t.INT); // no-op, always returns RtvSuccess
```

But why even make the function call?

```javascript
if (rtv.config.enabled) {
  rtv.verify('foo', rtv.t.INT);
}
```

Even better, since `rtv.e` is a getter that returns the value of `rtv.config.enabled`, we can make this really terse:

```javascript
rtv.e && rtv.verify('foo', rtv.t.INT);
```

Finally, a JavaScript bundler that supports _tree shaking_ (e.g. Webpack or Rollup) can be configured to completely _exclude_ the entire code for a build. This could be handy if you're concerned about script download size over runtime checks, say, in a production build. See the [Rollup example](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#enabled-example-rollup) for more information.

## Verifications

Let's say we're building a simple TODO app. We might use the following object as representative of a "todo" item in a list:

```javascript
const item = {
  title: 'Make Christmas Oatmeal',
  due: new Date('12/25/2018'),
  priority: 1,
  notes: [
    {
      text: 'Ingredients: Cranberries, apples, cinnamon, walnuts, raisins, maple syrup.',
      updated: new Date('09/20/2018')
    },
    {
      text: 'Make 4 cups to have enough to share!',
      updated: new Date('09/21/2018')
    }
  ]
};
```

We can describe this object using two [shapes](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.shape_descriptor):

```javascript
const {STRING, DATE, INT} = rtv.t;
const priorities = [1, 2, 3, 4]; // simple enumeration of priority levels

const shapes = {
  get todo() { // 'todo' shape
    return {
      title: STRING,
      due: DATE,
      priority: [INT, {oneOf: priorities}], // use 'priorities' enum
      notes: [[this.note]] // compose 'note' shape into this 'todo' shape
    };
  },
  get note() { // 'note' shape
    return {
      text: STRING,
      updated: DATE
    };
  }
};
```

Now we can verify that "todo" is a valid TODO item:

```javascript
rtv.verify(item, shapes.todo);
```

The above verification will pass because "todo" meets the requirements of the shape.

Now let's change the second note in "todo" such that its "updated" property is a boolean, `true` (a simple indication that the note was changed _at some point_ -- a change that seems to make sense, but would break code that expects a `Date` object to use for formatting in the UI, for example):

```javascript
todo.notes[1].updated = true;
```

Lexically, there's no reason for this assignment to fail, but the boolean value violates what is stated in the spec for a TODO item.

If we were to run the same verification again, __an exception would be thrown__. The exception would be an [RtvError](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.RtvError) with the following properties:

```javascript
rtv.verify(item, shapes.todo);

// RtvError exception thrown from the above statement:
{
  message: 'Verification failed: path="/notes/1/updated", cause=["!","DATE"], typeset={"title":"STRING","due":"DATE","priority":["INT",{"oneOf":[1,2,3,4]}],"notes":[[{"text":"STRING","updated":"DATE"}]]}',
  path: ['notes', '1', 'updated'], // path to the property that failed verification
  cause: ['!', 'DATE'], // fully-qualified typeset that caused the failure
  typeset: {...}, // reference to "shapes.todo"
  value: {...}, // reference to "todo"
  ...
}
```

The `cause` property is providing us with the [fully-qualified](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.fully_qualified_typeset) version of the nested typeset that caused the failure. The original typeset simply specified `DATE` as the nested typeset for the `note.updated` property.

In reality, all typesets have a [qualifier](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.qualifiers), and the default qualifier is `'!'` which means the value is _required_. Required values can neither be `undefined` nor `null`. Depending on the type, other restrictions may be imposed, such as the [STRING](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.STRING) type, which must also not be empty (by default).

For brevity, typesets don't always have to be fully-qualified since the default qualifier is implied when not specified. Note that a typeset must have exactly __one__ qualifier, implied or not, but each nested typeset may have its own qualifier.

For example, some TODO items may not have due dates. However, our shape currently requires them. To handle this requirement, we could alter the nested typeset of the `todo.due` property to be `['*', DATE]` This would state that the `due` property is _expected_ rather than _required_, which means its value could be `null` (but still not `undefined`). There is a third qualifier, `'?'`, which would indicate the value is _optional_, in which case it could also be `undefined` (which, in JavaScript terms, means the property could also not even exist anywhere up the prototype chain of the `todo` object).

The `RtvError` object can also be obtained without catching an exception thrown by using the `rtv.check()` method:

```javascript
rtv.check(item, shapes.todo); // returns the RtvError object
```

If the check was successful, an [RtvSuccess](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvrefrtvsuccess) would be returned instead. Since both `RtvError` and `RtvSuccess` objects have a common `valid: boolean` property, it's easy to check for success and failure:

```javascript
if (rtv.check(item, shapes.todo).valid) {
  // check passed, "todo" is valid!
} else {
  // check failed, ignore the item
}
```

Finally, we can check simple values too:

```javascript
rtv.verify('1', rtv.t.INT); // ERROR: not an integer number
rtv.verify('', [rtv.q.EXPECTED, rtv.t.STRING]); // ok: expected strings can be null/empty
```

## Dynamic Classes

This is an advanced use of the RTV.js library. I recommend you read through the [Getting Started](#getting-started) guide or the [Verifications](#verifications) example first.

Let's suppose we have the following [shape](https://gitlab.com/stefcameron/rtvjs/blob/master/API.md#rtvref.types.shape_descriptor) that describes a simple note:

```javascript
const {STRING, DATE} = rtv.t; // some types
const {EXPECTED} = rtv.q; // some qualifiers
const tags = ['car', 'money', 'reminder', 'grocery'];

const noteShape = {
  // required, non-empty string
  text: STRING,
  // required Array (could be empty) of non-empty tags names from the user's
  //  list of "tags"
  tags: [[STRING, {oneOf: tags}]],
  // required Date when the note was created
  created: DATE,
  // expected date of update (either null, or Date)
  updated: [EXPECTED, DATE]
};
```

Based on this shape, we can dynamically define a JavaScript class with getters and setters that ensure they are being set correctly:

```javascript
const classGenerator = function(shape) {
  const ctor = function(initialValues) {
    // by definition, a shape descriptor is made-up of its own-enumerable
    //  properties, so we enumerate them
    const props = Object.keys(shape);

    const typesets = {}; // prop -> fully-qualified Array typeset
    const values = {}; // prop -> value

    let initializing = true; // true while we apply "initialValues"

    props.forEach((prop) => {
      typesets[prop] = rtv.fullyQualify(shape[prop]);

      Object.defineProperty(this, prop, {
        enumerable: true,
        configurable: true, // could be false to lock this down further
        get() {
          return values[prop];
        },
        set(newValue) {
          const typeset = typesets[prop].concat(); // shallow clone

          if (initializing) {
            // allow each property to be initially null, or as the typeset specifies
            //  so we don't end-up with junk data
            // NOTE: in a fully-qualified typeset, the qualifier is always the
            //  first element
            typeset[0] = EXPECTED;
          }

          // we assume there are no interdependencies between nested typesets
          // this verification will throw an RtvError if the "newValue"
          //  violates the property's typeset
          rtv.verify(newValue, typeset);

          values[prop] = newValue;
        }
      });

      if (initialValues && initialValues.hasOwnProperty(prop)) {
        // go through the setter for verification
        this[prop] = initialValues[prop];
      } else {
        // initialize to null
        values[prop] = null;
      }
    });

    initializing = false;
  };

  return ctor;
};
```

Now we can generate a Note class and create an instance:

```javascript
const Note = classGenerator(noteShape);
const note = new Note({text: 'Hello world!');

note.text; // "Hello world!", since it was initialized
note.created; // null, since it wasn't initialized
note.text = ''; // ERROR: "text" must be a non-empty string
```

# Alternatives

RTV.js is not your only choice for runtime verification of values. Here are some alternatives you should consider. Compare them to what this library offers and choose the best one to fit your needs!

*   [Joi](https://github.com/hapijs/joi) offers object schema validation. In the _hapi ecosystem_, this is commonly paired with [Hoek](https://github.com/hapijs/hoek).
*   [prop-types](https://github.com/facebook/prop-types) is useful if you're building a React app.

# Contributing

[Contributing](CONTRIBUTING.md), including local development guide.

# License

[MIT](LICENSE)

# Future

See the list of proposed [enhancements](https://gitlab.com/stefcameron/rtvjs/issues?label_name%5B%5D=enhancement). Up-vote the ones you like to help contributors prioritize them!

Feel free to log an __enhancement__ if you have an idea! You may also file a PR, although it might be best to discuss your idea with the community first by creating an enhancement issue.
