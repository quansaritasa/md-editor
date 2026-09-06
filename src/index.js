'use strict';

/* ================= md-editor — public surface =================
   Built to dist/md-editor.js as a classic script exposing the global
   `MdEditor`. Members land here phase by phase; see README for the roadmap. */

const deps = require('./deps');

module.exports = {
  version: require('../package.json').version,
  configure: deps.configure,
};
