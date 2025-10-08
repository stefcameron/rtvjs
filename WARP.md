# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

RTV.js — Runtime verification library for browsers and Node.js. Library code lives under src/, tests under test/, and builds are produced to dist/ via Rollup.

Commands (macOS/Linux, bash)

- Install deps (respect package-lock):
  ```bash
  npm ci
  ```
- Build library (rolls all formats into dist/):
  ```bash
  npm run build        # alias of build:lib
  npm run clean        # removes dist/ and dist_tools/
  ```
- Lint and format:
  ```bash
  npm run fmt          # write changes with Prettier
  npm run fmt:check    # verify formatting
  npm run lint         # ESLint (flat config)
  npm run ci:lint      # fmt:check + lint
  ```
- Tests (Jest via Babel):
  ```bash
  npm test                 # fmt:check + lint + coverage
  npm run test:unit        # run unit tests
  npm run test:coverage    # run with coverage (thresholds are 100%)
  npm run test:unit:watch  # watch mode
  npm run test:unit:debug  # --inspect-brk --runInBand
  ```
  Run a single test file or name:
  ```bash
  npm run test:unit -- test/lib/types.test.js
  npm run test:unit -- -t "should validate"   # by test name pattern
  ```
- Browser/manual dev harnesses:
  ```bash
  npm run html            # build then serve tools/ with live-server (mounts dist/)
  npm run html:live       # serve tools/ (assumes dist/ exists)
  ```
- Node manual harnesses (loads built dist/ into a Node session):
  ```bash
  npm run node:build      # build then start Node ESM harness
  npm run node            # Node ESM harness (requires prior build)
  npm run node:cjs        # Node CJS harness (requires prior build)
  npm run node:internals  # build tools internals then run
  ```
- Docs site (Jekyll under docs/):
  ```bash
  npm run docs:install    # bundle install in ./docs
  npm run docs:build      # jekyll build
  npm run docs            # jekyll serve -w -l
  ```
- API docs (generates API.md from JSDoc):
  ```bash
  npm run api
  ```

Environment and tooling

- Node >= 16.12 and npm >= 10 per package.json engines.
- ESLint config is in eslint.config.mjs (flat config). Prettier is enforced via .prettierrc.js.
- Jest config is in jest.config.mjs (jsdom env). Coverage thresholds are 100% across branches/functions/lines/statements. Babel is used for transforms; lodash-es is whitelisted for transform.

High-level architecture and structure

- Public entry (src/rtv.js)
  - Re-exports the library’s public API: types, qualifiers, check, verify, utility helpers, and result classes RtvSuccess/RtvError.
  - Imports per-type validators from src/lib/validator/ (val*.js) and wires them into the verification engine.
- Core engine (src/lib/impl.js)
  - Implements parsing/evaluation of typesets, verification orchestration, and creation of success/error results.
  - Provides helpers such as fullyQualify, check, verify and internal traversal utilities.
- Types and qualifiers (src/lib/types.js, src/lib/qualifiers.js)
  - Enumerations of the supported types (e.g., STRING, INT, ARRAY, OBJECT, DATE, MAP/SET/WEAKMAP/WEAKSET, etc.) and qualifiers (REQUIRED, EXPECTED, OPTIONAL, TRUTHY). Enumeration.js underpins these.
  - onlyTypes.js and onlyQualifiers.js expose just the enumerations for tree-shaking/consumers that only need constants.
- Validators and predicates
  - src/lib/validator/val*.js: Per-type validators that perform matching, argument handling, and error reporting for each supported type.
  - src/lib/validation/is*.js: Low-level type predicates (isArray, isPlainObject, isShape, etc.) used by validators and the engine.
- Results and MVV
  - RtvSuccess includes mvv (Minimum Viable Value): the minimal data structure derived from the original value that still passes the same validation (useful for reducing payloads/memory).
  - RtvError captures path, mismatch (fully-qualified typeset), the failing typeset, the original value, and optional rootCause from custom validators.
- Custom validators and context
  - A typeset may end with a custom validator function. It is invoked after a type matches and receives (value, match, typeset, context). Context exposes originalValue, parent, parentKey enabling cross-field validations (e.g., tagCount vs tags.length).
- Global configuration and bundler optimization
  - rtv.config.enabled can gate verification calls so bundlers can tree-shake verifications out of production builds when desired.

Builds and distribution

- Rollup builds (rollup.config.js + tools/build/*) produce multiple targets to dist/:
  - Node CJS: dist/node/rtv.cjs (dev and prod; non-minified by design).
  - Node ESM: dist/node/rtv(.slim).mjs (dev and prod; non-minified).
  - Browser ESM (for bundlers): dist/browser/rtv.esm(.slim).js (dev/prod).
  - Browser ESM minified (for direct <script type="module"> use): dist/browser/rtv.esm.min.js
- “Slim” builds externalize helpers to @babel/runtime and lodash (peer deps for slim usage). Non-slim builds are self-contained.
- package.json exports/module are configured so:
  - Node requires use dist/node/rtv.cjs via exports["."].node.
  - Bundlers resolve ESM via module and exports["."].import to dist/browser/rtv.esm.slim.js.
  - A self-contained browser ESM is available at dist/browser/rtv.esm.js (and .min.js).

Local dev notes

- Running the browser harness (npm run html) serves tools/index.html, which imports the dev ESM build from dist/browser/rtv.esm.dev.js and lodash-es from a CDN.
- The Node harness scripts import dist/node/rtv.slim.mjs into a Node session and expose rtv on global for ad-hoc testing. Run the build first or use node:build.

README highlights relevant to usage

- In Node (CJS):
  ```js
  const rtv = require('rtvjs');
  ```
- In ESM (Node, bundler, or browser):
  ```js
  import * as rtv from 'rtvjs';
  import { verify, STRING } from 'rtvjs';
  ```
- In the browser without a bundler, import the full path to the minified ESM:
  ```html
  <script type="module">
    import * as rtv from 'https://unpkg.com/rtvjs@5/dist/browser/rtv.esm.min.js';
    window.rtv = rtv;
  </script>
  ```

No CLAUDE/Cursor/Copilot rules files were found in this repo at the time of writing.

