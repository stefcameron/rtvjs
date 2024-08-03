////// Manual CJS Node.js Testing

// eslint-disable-next-line node/no-missing-require -- only exists if `npm run build` has run
global.rtv = require('../dist/node/rtv.cjs');

// NOTE: not possible to load lodash-es because it's ESM only

global.ostr = function (v) {
  return Object.prototype.toString.call(v);
};
