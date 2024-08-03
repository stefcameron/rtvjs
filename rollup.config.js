////// Rollup Configuration

const builds = require('./tools/build/rollup-builds');

module.exports = [
  //// CJS NODE -- NO MIN builds INTENTIONALLY (Node doesn't need this optimization)
  ////  and no 'slim' builds because that results in external imports to lodash-es
  ////  which is ESM-only and incompatible with CJS

  // Prod, self-contained
  builds.getCjsConfig({
    isMin: false,
    isSlim: false,
    isDev: false,
    target: 'node',
  }),
  // Dev, self-contained
  builds.getCjsConfig({
    isMin: false,
    isSlim: false,
    isDev: true,
    target: 'node',
  }),

  //// ESM NODE -- NO MIN builds INTENTIONALLY (Node doesn't need this optimization)

  // Prod, self-contained
  builds.getEsmConfig({
    isMin: false,
    isSlim: false,
    isDev: false,
    target: 'node',
  }),
  // Prod, externals
  builds.getEsmConfig({
    isMin: false,
    isSlim: true,
    isDev: false,
    target: 'node',
  }),
  // Dev, self-contained
  builds.getEsmConfig({
    isMin: false,
    isSlim: false,
    isDev: true,
    target: 'node',
  }),
  // Dev, externals
  builds.getEsmConfig({
    isMin: false,
    isSlim: true,
    isDev: true,
    target: 'node',
  }),

  //// ESM BROWSER PROD -- Only Prod builds should be minified

  // Prod, self-contained -- bundler
  builds.getEsmConfig({
    isMin: false,
    isSlim: false,
    isDev: false,
    target: 'browser',
  }),
  // Prod, externals -- bundler
  builds.getEsmConfig({
    isMin: false,
    isSlim: true,
    isDev: false,
    target: 'browser',
  }),
  // Prod, self-contained, minified -- in-browser
  builds.getEsmConfig({
    isMin: true,
    isSlim: false,
    isDev: false,
    target: 'browser',
  }),
  // NOTE: Prod with externals and minified (i.e. slim/minified) for use in-browser doesn't
  //  make sense because it'll have export imports that won't be resolvable

  //// ESM BROWSER DEV -- No minification

  // Dev, self-contained -- bundler or in-browser
  builds.getEsmConfig({
    isMin: false,
    isSlim: false,
    isDev: true,
    target: 'browser',
  }),
  // Dev, externals -- bundler or in-browser
  builds.getEsmConfig({
    isMin: false,
    isSlim: true,
    isDev: true,
    target: 'browser',
  }),
];
