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
const adapter = require('./adapter');
const mountMod = require('./mount');
const theme = require('./theme');

module.exports = {
  version: require('../package.json').version,
  configure: deps.configure,

  // markdown source -> document HTML. Pure.
  build,
  buildDefaults: DEFAULTS,
  transforms: transform.OPTIONAL,

  // document HTML -> a live element.
  mount: mountMod.mount,
  mountDefaults: mountMod.MOUNT_DEFAULTS,
  resolveDocPaths: mountMod.resolveDocPaths,
  bindLinks: mountMod.bindLinks,
  createAdapter: adapter.createAdapter,
  rootClass: mountMod.ROOT_CLASS,

  // Theme and layout state; the toolbar that drives it belongs to the host.
  createTheme: theme.createTheme,
  themes: theme.THEMES,
  themeDefaults: theme.DEFAULTS,

  // Opt-in behaviour a host wires to its own chrome.
  features: {
    mermaid: require('./features/mermaid'),
    mermaidZoom: require('./features/mermaid-zoom'),
    codeBlocks: require('./features/codeblocks'),
    collapse: require('./features/collapse'),
    outline: require('./features/outline'),
    outlineFold: require('./features/outline-fold'),
    outlineSlug: require('./features/outline-slug'),
  },

  // The pieces, for hosts that compose their own pipeline.
  parse,
  goodview,
  transform,
  titleFromH1: util.titleFromH1,
  titleFromStem: util.titleFromStem,
};
