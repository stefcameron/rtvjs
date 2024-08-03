//// Utilities for Rollup Builds

// {string} Rollup CJS output format
const RU_FORMAT_CJS = 'cjs';

// {string} Rollup ESM output format
const RU_FORMAT_ESM = 'es';

// {string} Sub-extension used in development (i.e. non-production) builds
const OUTPUT_DEV = 'dev';

// {string} Sub-extension used in minified builds
const OUTPUT_MIN = 'min';

// {string} Sub-extension used for slim (i.e. non-bundled) builds
const OUTPUT_SLIM = 'slim';

// {string} Target run platform for a browser
const TARGET_BROWSER = 'browser';

// {string} Target run platform for Node
const TARGET_NODE = 'node';

// {string} input directory relative path, no trailing slash
const DIR_SRC = 'src';

// {string} output directory relative path, no trailing slash
const DIR_DIST = 'dist';

module.exports = {
  RU_FORMAT_CJS,
  RU_FORMAT_ESM,
  OUTPUT_DEV,
  OUTPUT_MIN,
  OUTPUT_SLIM,
  TARGET_BROWSER,
  TARGET_NODE,
  DIR_SRC,
  DIR_DIST,
};
