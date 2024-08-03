////// Rollup Build Configurations

const jsonPlugin = require('@rollup/plugin-json');
const { nodeResolve: resolvePlugin } = require('@rollup/plugin-node-resolve');
const cjsPlugin = require('@rollup/plugin-commonjs');
const { default: babelPlugin } = require('@rollup/plugin-babel');
const replacePlugin = require('@rollup/plugin-replace');
const { terser: terserPlugin } = require('rollup-plugin-terser');

const {
  RU_FORMAT_CJS,
  RU_FORMAT_ESM,
  OUTPUT_DEV,
  OUTPUT_MIN,
  OUTPUT_SLIM,
  TARGET_BROWSER,
  TARGET_NODE,
  DIR_SRC,
  DIR_DIST,
} = require('./rollup-utils');

const pkg = require('../../package.json');

const FILE_NAME = 'rtv'; // skip the 'js' since that's in the extension, e.g. 'rtv.js'

const banner = `/*!
 * ${pkg.name} ${pkg.version}
 * @license MIT, https://github.com/stefcameron/rtvjs/blob/master/LICENSE.md
 * Parts of Lodash used internally: https://github.com/lodash/lodash/
 */`;

// base Babel configuration
// - format {string}: (REQUIRED) set to Rollup build format
// - isSlim: set to true for a slimmer non-bundled build
const getBabelConfig = function (
  options = {
    isSlim: false,
  }
) {
  const { isSlim, format } = options;

  if (!format || ![RU_FORMAT_CJS, RU_FORMAT_ESM].includes(format)) {
    throw new Error(`A valid output format is required, format=${format}`);
  }

  // NOTE: we don't define anything in /babel.config.js for the build env so
  //  that we can manipulate everything here, and ensure that every build uses
  //  a distinct Babel config object (if we `require('../../babel.config')`
  //  here, that's not what happens...
  const config = {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          // @see https://github.com/browserslist/browserslist#full-list
          targets: 'defaults',
        },
      ],
    ],
    plugins: [],
  };

  // slim builds (except for UMD) rely on external Babel helpers
  if (isSlim) {
    // NOTE: because of this, @babel/runtime must also be installed to use a slim
    //  build, and we build it with 'runtime' Babel helpers using `@rollup/plugin-babel`
    //  when targetting slim
    config.plugins.push('@babel/plugin-transform-runtime');
  }

  return config;
};

// terser plugin configuration
const getTerserConfig = function () {
  return {
    output: {
      // comments: /^\/\*!/
      comments(node, comment) {
        const text = comment.value;
        const type = comment.type;
        if (type === 'comment2') {
          // multiline comment: keep if it starts with a bang or contains
          //  some common preservation keywords
          return (
            text.indexOf('!') === 0 || /@preserve|@license|@cc_on/i.test(text)
          );
        }
      },
    },
  };
};

// base config with INCOMPLETE outputs, relative to the repo root
// - format {string}: (REQUIRED) set to Rollup build format
// - isDev: set to true for a development build, false for a production build
// - isMin: set to true for a minified build
// - isSlim: set to true for a slimmer non-bundled build
// - target: one of [TARGET_BROWSER, TARGET_NODE]
const getBaseConfig = function (
  options = {
    isDev: false,
    isMin: false,
    isSlim: false,
  }
) {
  const { format, isDev, isMin, isSlim, target } = options;

  if (!format || ![RU_FORMAT_CJS, RU_FORMAT_ESM].includes(format)) {
    throw new Error(`A valid output format is required, format=${format}`);
  }

  if (![TARGET_BROWSER, TARGET_NODE].includes(target)) {
    throw new Error(`A valid target is required, target="${target}"`);
  }

  // {Array<string>} slim builds bundle noting; fat ones bundle everything
  // NOTE: we do not put `peerDependencies` in package.json because the default
  //  distributions referenced via `main` and `module` are the full versions
  //  that bundle everything; adding peer dependencies to the package would
  //  result in "missing peer dependency" warnings on installation, which
  //  technically aren't true for the package's default use
  const externals = isSlim ? ['@babel/runtime', 'lodash'] : [];

  const replaceTokens = {
    // none for now
  };
  const babelConfig = getBabelConfig({ format, isSlim });

  replaceTokens['process.env.NODE_ENV'] = JSON.stringify(
    isDev ? 'development' : 'production'
  );

  const config = {
    input: `${DIR_SRC}/rtv.js`,
    output: {
      banner,
      sourcemap: target === TARGET_BROWSER,
      preserveModules: false, // roll everything up into one file
    },
    external(moduleName) {
      // NOTE: if we just provided an array of module names, Rollup would do
      //  an exact match, but would then miss treating as external any imports
      //  that are deeper into the package, like 'lodash/merge', for example,
      //  if we just stated that 'lodash' should be an external package, so we
      //  have to treat the list of externals as substrings of the module name
      // @see https://rollupjs.org/guide/en/#peer-dependencies
      const result = !!externals.find((ex) => moduleName.includes(ex));
      return result;
    },
    plugins: [
      // ALWAYS FIRST: string token replacement
      replacePlugin({
        values: replaceTokens,
        preventAssignment: true,
      }),

      jsonPlugin(),
      resolvePlugin(),
      cjsPlugin({
        include: 'node_modules/**',
      }),
    ],
    watch: {
      include: `${DIR_SRC}/**`,
      exclude: ['node_modules/**', `${DIR_DIST}/**`, 'dist_tools/**'],
    },
  };

  config.plugins.push(
    // NOTE: As of Babel 7, this plugin now ensures that Babel helpers are not
    //  repeated, and are inserted at the top of the generated bundle:
    //  "This rollup plugin automatically de-duplicates those helpers, keeping
    //  only one copy of each one used in the output bundle. Rollup will combine
    //  the helpers in a single block at the top of your bundle."
    //  @see https://github.com/rollup/rollup-plugin-babel#helpers
    babelPlugin({
      ...babelConfig,
      exclude: 'node_modules/**',

      // for CJS and ESM builds, IIF SLIM, have all Babel helpers reference an external
      //  @babel/runtime dependency that consumers can provide and bundle into their
      //  app code; this is the recommendation for library modules, which is what
      //  this package is, and we use this in conjunction with `@babel/plugin-transform-runtime`
      // @see https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
      babelHelpers: isSlim ? 'runtime' : 'bundled',
    })
  );

  if (isSlim) {
    // provide Lodash-related globals for external references
    // NOTE: per https://unpkg.com/lodash, Lodash registers the `_` global
    config.output.globals = (id) => {
      // `id` is module name like 'lodash'
      if (id === 'lodash') {
        return '_';
      } else if (id.startsWith('lodash/')) {
        // a deep reference like `import isObjectLike from 'lodash-es/isObjectLike.js'`
        //  becomes `_.isObjectLike`
        return `_.${id.substr('lodash/'.length)}`;
      } else if (id === pkg.name) {
        return pkg.name;
      }

      throw new Error(`Unexpected external package reference, id="${id}"`);
    };
  }

  if (isMin) {
    const terserConfig = getTerserConfig();
    config.plugins.push(terserPlugin(terserConfig));
  }

  return config;
};

// CJS (ES5) build config (for Node ONLY)
// - isDev: set to true for a development build, false for a production build
// - isMin: set to true for a minified build
// - isSlim: set to true for a slimmer non-bundled build
// - target: one of [TARGET_BROWSER, TARGET_NODE]
const getCjsConfig = function (
  options = {
    isDev: false,
    isMin: false,
    isSlim: false,
  }
) {
  const { isDev, isMin, isSlim, target } = options;

  if (![TARGET_BROWSER, TARGET_NODE].includes(target)) {
    throw new Error(`A valid target is required, target="${target}"`);
  }

  const format = RU_FORMAT_CJS;
  const config = getBaseConfig({ format, isDev, isSlim, isMin, target });

  config.output = {
    ...config.output,
    file: `${DIR_DIST}/${target}/${FILE_NAME}${isSlim ? `.${OUTPUT_SLIM}` : ''}${
      isDev ? `.${OUTPUT_DEV}` : ''
    }.${target === TARGET_BROWSER ? 'js' : 'cjs'}`,
    format,
    exports: 'named',
  };

  return config;
};

// ESM (ES6+) build config (for Node and browsers)
// - isDev: set to true for a development build, false for a production build
// - isMin: set to true for a minified build
// - isSlim: set to true for a slimmer non-bundled build
// - target: one of [TARGET_BROWSER, TARGET_NODE]
const getEsmConfig = function (
  options = {
    isDev: false,
    isMin: false,
    isSlim: false,
  }
) {
  const { isDev, isMin, isSlim, target } = options;

  if (![TARGET_BROWSER, TARGET_NODE].includes(target)) {
    throw new Error(`A valid target is required, target="${target}"`);
  }

  const format = RU_FORMAT_ESM;
  const config = getBaseConfig({ format, isDev, isMin, isSlim, target });

  config.output = {
    ...config.output,
    file: `${DIR_DIST}/${target}/${FILE_NAME}${target === TARGET_BROWSER ? '.esm' : ''}${
      isSlim ? `.${OUTPUT_SLIM}` : ''
    }${isDev ? `.${OUTPUT_DEV}` : ''}${
      isMin ? `.${OUTPUT_MIN}` : ''
    }.${target === TARGET_BROWSER ? 'js' : 'mjs'}`,
    format,
  };

  return config;
};

module.exports = {
  getCjsConfig,
  getEsmConfig,
};
