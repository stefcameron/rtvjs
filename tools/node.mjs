////// Manual ESM Node.js Testing

// NOTE: this will load because Node will naturally resolve the external references
//  to @babel/runtime and lodash in ../node_modules
import * as rtv from '../dist/node/rtv.slim.mjs';
global.rtv = rtv;

import * as _ from 'lodash-es';
global.ld = _;

global.ostr = function (v) {
  return Object.prototype.toString.call(v);
};
