'use strict';

/* A jsdom page shaped like a host app: a scrolling viewer around the mount
   element, plus the outline panel the outline feature expects. */

const { JSDOM } = require('jsdom');

const MARKUP = `
<div id="viewer" style="overflow:auto">
  <article id="content" class="page"></article>
</div>
<div id="outline-section" style="display:none">
  <span id="outline-actions">
    <button type="button" id="outline-collapse">C</button>
    <button type="button" id="outline-expand">E</button>
  </span>
  <nav><ul id="outline-list"></ul></nav>
</div>`;

// jsdom treats file:// as an opaque origin and THROWS on localStorage access,
// so a test that needs storage asks for an http origin instead.
function makePage(url) {
  const dom = new JSDOM('<!doctype html><html><body>' + MARKUP + '</body></html>', {
    url: url || 'file:///docs/index.html',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const $ = (id) => window.document.getElementById(id);
  return {
    dom, window,
    document: window.document,
    content: $('content'),
    viewer: $('viewer'),
    list: $('outline-list'),
    section: $('outline-section'),
    actions: { box: $('outline-actions'), expand: $('outline-expand'), collapse: $('outline-collapse') },
  };
}

// jsdom ships no clipboard; record writes so the copy buttons can be asserted.
function stubClipboard(window, opts) {
  const calls = [];
  Object.defineProperty(window.navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async (t) => {
        calls.push(t);
        if (opts && opts.fail) throw new Error('denied');
      },
    },
  });
  return calls;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

module.exports = { makePage, stubClipboard, tick };
