////// Rollup Configuration for internals.js module

const jsonPlugin = require('@rollup/plugin-json');
const { nodeResolve: resolvePlugin } = require('@rollup/plugin-node-resolve');
const cjsPlugin = require('@rollup/plugin-commonjs');
const replacePlugin = require('@rollup/plugin-replace');

const LIB_NAME = 'internals';

const config = {
  input: 'tools/internals.js',
  output: [
    // CJS Module build
    {
      file: `dist_tools/${LIB_NAME}.mjs`,
      format: 'esm',
      sourcemap: false,
    },
  ],
  plugins: [
    replacePlugin({
      values: {}, // none for now
      preventAssignment: true,
    }),
    jsonPlugin(),
    resolvePlugin(),
    cjsPlugin({
      include: 'node_modules/**',
    }),
  ],
  watch: {
    include: 'src/**',
    exclude: ['node_modules/**', 'dist/**', 'dist_tools/**'],
  },
};

module.exports = [config];
