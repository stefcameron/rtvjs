////// Manual CJS Node.js Testing

global.rtv = require('../dist/node/rtv.cjs');

// NOTE: not possible to load lodash-es because it's ESM only

global.ostr = function (v) {
  return Object.prototype.toString.call(v);
};
