'use strict';

/* ================= md-editor — public surface =================
   Built to dist/md-editor.js as a classic script exposing the global
   `MdEditor`. Members land here phase by phase; see README for the roadmap. */

const deps = require('./deps');
const util = require('./util');
const parse = require('./parse');
const transform = require('./transform');
const goodview = require('./goodview');
const { build, DEFAULTS } = require('./build');

module.exports = {
  version: require('../package.json').version,
  configure: deps.configure,

  build,
  buildDefaults: DEFAULTS,
  transforms: transform.OPTIONAL,

  // The pieces, for hosts that compose their own pipeline.
  parse,
  goodview,
  transform,
  titleFromH1: util.titleFromH1,
  titleFromStem: util.titleFromStem,
};
