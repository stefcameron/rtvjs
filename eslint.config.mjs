//
// ROOT ESLint Configuration
//

/* eslint-env node */

import js from '@eslint/js';
import globals from 'globals';
import babel from '@babel/eslint-plugin';
import babelParser from '@babel/eslint-parser';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import jestDom from 'eslint-plugin-jest-dom';

const ecmaVersion = 'latest';
const impliedStrict = true;

//
// Plugins
//

// Plugins that apply to ALL envs
const basePlugins = {
  '@babel': babel, // @see https://www.npmjs.com/package/@babel/eslint-plugin
};

const importPluginSettings = {
  'import/resolver': {
    node: {
      extensions: [
        '.js',
        '.jsx',
        '.cts',
        '.mjs',
        '.ts',
        '.tsx',
        '.cts',
        '.mts',
      ],
      moduleDirectory: ['node_modules', 'src/', 'test/', 'tools/'],
    },
  },
};

//
// Globals
//

// Globals that apply to ALL envs
const baseGlobals = {
  // anything in addition to what `languageOptions.ecmaVersion` provides
  // @see https://eslint.org/docs/latest/use/configure/language-options#predefined-global-variables
};

// Globals for repo tooling scripts
const toolingGlobals = {
  ...globals.node,
};

// Globals for browser-based source code
const browserGlobals = {
  ...globals.browser,
};

// Globals for test files
const testGlobals = {
  ...globals.jest,
};

// Globals for BUNDLED (Webpack, Rollup, etc) source code
// NOTE: these must also be defined in (a future) <repo>/src/globals.d.ts, which would need to
//  be referenced in the <repo>/tsconfig.json, as well as the `globals` property in
//  <repo>/jest.config.mjs
const bundlerGlobals = {};

//
// Base rules
// @see http://eslint.org/docs/rules/RULE-NAME
//

const baseRules = {
  ...js.configs.recommended.rules,
  'no-regex-spaces': 'off',
  'no-await-in-loop': 'error',
  'no-async-promise-executor': 'error',
  'no-misleading-character-class': 'error',
  'no-unsafe-optional-chaining': 'error',

  //// Best practices

  curly: 'error',
  'default-case': 'error',
  eqeqeq: 'error',
  'guard-for-in': 'error',
  'no-alert': 'error',
  'no-caller': 'error',
  'no-console': 'error',
  'no-else-return': 'error',
  'no-eq-null': 'error',
  'no-eval': 'error',
  'no-lone-blocks': 'error',
  'no-loop-func': 'error',
  'no-multi-spaces': 'error',
  'no-new': 'off',
  'no-new-func': 'error',
  'no-new-wrappers': 'error',
  'no-throw-literal': 'error',
  'no-warning-comments': [
    'error',
    {
      terms: ['DEBUG', 'FIXME', 'HACK'],
      location: 'start',
    },
  ],

  //// Strict mode

  strict: ['error', 'function'],

  //// Variables

  'no-catch-shadow': 'error',
  'no-shadow': 'error',
  'no-unused-vars': [
    'error',
    {
      args: 'none',
      caughtErrors: 'none',
      vars: 'local',
    },
  ],
  'no-use-before-define': 'error',

  //// Stylistic issues

  // NONE: Prettier will take care of these by reformatting the code on commit,
  //  save a few exceptions.

  // Prettier will format using single quotes per .prettierrc.js settings, but
  //  will not require single quotes instead of backticks/template strings
  //  when interpolation isn't used, so this rule will catch those cases
  quotes: [
    'error',
    'single',
    {
      avoidEscape: true,
      allowTemplateLiterals: false,
    },
  ],

  //// ECMAScript 6 (non-stylistic issues only)

  'no-duplicate-imports': ['error', { includeExports: true }],
  'no-useless-constructor': 'error',
  'no-var': 'error',
  'prefer-arrow-callback': 'off',
  'prefer-const': 'error',
};

//
// Tool-specific rules
//

const toolingRules = {
  'no-console': 'off',
  'no-prototype-builtins': 'off', // OFF to allow {}.hasOwnProperty('foo')
  'no-process-exit': 'off', // we're OK with process.exit()
};

//
// Test-specific rules
//

const testRules = {
  'no-prototype-builtins': 'off', // OFF to allow {}.hasOwnProperty('foo')

  //// jest plugin

  'jest/no-disabled-tests': 'error',
  'jest/no-focused-tests': 'error',
  'jest/no-identical-title': 'error',
  'jest/valid-expect': 'error',
  'jest/valid-title': 'error',

  //// jest-dom plugin

  // this rule is buggy, and doesn't seem to work well with the Testing Library's queries
  'jest-dom/prefer-in-document': 'off',
};

//
// Config generators
//

/**
 * Project scripts.
 * @param {boolean} isModule
 * @returns {Object} ESLint config.
 */
const createToolingConfig = (isModule = true) => ({
  files: isModule ? ['**/*.{js,mjs}'] : ['**/*.cjs'],
  ignores: ['src/**/*.*', 'test/**/*.*', 'docs/**/*.*'],
  plugins: {
    ...basePlugins,
    ...(isModule ? { import: importPlugin } : {}),
  },
  languageOptions: {
    ecmaVersion,
    parser: babelParser,
    parserOptions: {
      sourceType: isModule ? 'module' : 'script',
      ecmaFeatures: {
        impliedStrict,
        jsx: false,
      },
    },
    globals: {
      ...baseGlobals,
      ...toolingGlobals,
    },
  },
  settings: {
    ...(isModule ? importPluginSettings : {}),
  },
  rules: {
    ...baseRules,
    ...toolingRules,
    ...(isModule ? importPlugin.flatConfigs.recommended.rules : {}), // BEFORE TypeScript rules
  },
});

/**
 * JavaScript source files.
 * @returns ESLint config.
 */
const createSourceJSConfig = () => ({
  files: ['src/**/*.js'],
  plugins: {
    ...basePlugins,
    import: importPlugin,
  },
  languageOptions: {
    ecmaVersion,
    parser: babelParser,
    parserOptions: {
      sourceType: 'module',
      ecmaFeatures: {
        impliedStrict,
        jsx: false,
      },
    },
    globals: {
      ...baseGlobals,
      ...bundlerGlobals,
      ...browserGlobals,
    },
  },
  settings: {
    ...importPluginSettings,
  },
  rules: {
    ...baseRules,
    ...importPlugin.flatConfigs.recommended.rules,
  },
});

const createTestConfig = () => ({
  files: ['test/**/*.js'],
  plugins: {
    ...basePlugins,
    import: importPlugin,
    jest,
    'jest-dom': jestDom,
  },
  languageOptions: {
    ecmaVersion,
    parser: babelParser,
    parserOptions: {
      sourceType: 'module',
      ecmaFeatures: {
        impliedStrict,
        jsx: false,
      },
    },
    globals: {
      ...baseGlobals,
      ...bundlerGlobals, // because tests execute code that also gets bundled
      ...browserGlobals,
      ...testGlobals,
    },
  },
  settings: {
    ...importPluginSettings,
  },
  rules: {
    ...baseRules,
    ...importPlugin.flatConfigs.recommended.rules, // BEFORE TypeScript rules
    ...testRules,
  },
});

export default [
  // Ignores
  {
    ignores: [
      // third-party
      '**/node_modules/',
      // build output
      'dist/**',
      'dist_tools/**',
      // test output
      'coverage/**',
    ],
  },

  // Tooling Configs
  createToolingConfig(false), // CJS scripts
  createToolingConfig(true), // ESM scripts

  // Source Configs
  createSourceJSConfig(),

  // Test Configs
  createTestConfig(),

  // Prettier
  // ALWAYS LAST: disable style rules that conflict with prettier
  // @see https://typescript-eslint.io/troubleshooting/formatting#suggested-usage---prettier
  {
    plugins: {
      prettier,
    },
    rules: prettier.rules,
  },
];
