'use strict';

/* ================= mermaid diagrams + syntax highlighting =================
   Both peers are optional. A missing one means the step is skipped, not that
   rendering fails: a host may deliberately ship neither. */

const deps = require('../deps');
const zoom = require('./mermaid-zoom');

const INIT = {
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'base',
  themeVariables: { background: '#f6f8fa' },
};

let initialized = false;

// Initialised on first use rather than at load, so a host that pulls mermaid in
// late still gets a configured instance, and one that never renders a diagram
// never touches it.
function ensureInit(m, overrides) {
  if (initialized) return;
  m.initialize(Object.assign({}, INIT, overrides || {}));
  initialized = true;
}

// Every scratch element this module can strand is id'd 'd' + a render id, and
// every render id this module hands out starts 'mmd-'. Matching that prefix
// means the sweep only ever removes mermaid scratch we asked for, never an
// element the host put on the page itself.
function sweepScratch(doc) {
  if (!doc || typeof doc.querySelectorAll !== 'function') return;
  const strays = doc.querySelectorAll('[id^="dmmd-"]');
  for (let i = 0; i < strays.length; i++) {
    const e = strays[i];
    if (e && e.remove) e.remove();
  }
}

async function render(root, options) {
  const o = options || {};
  const m = deps.mermaid();
  if (!m) return 0;
  // Before the early return on purpose: a leftover outlives the document that
  // produced it, so the file that has to clear it is usually one with no
  // diagrams at all. See the finally below for how it gets there.
  sweepScratch(root.ownerDocument);
  const blocks = root.querySelectorAll('code.language-mermaid');
  if (!blocks.length) return 0;
  ensureInit(m, o.mermaidConfig);

  let n = 0;
  for (let i = 0; i < blocks.length; i++) {
    const el = blocks[i];
    const src = (el.textContent || '').trim();
    const pre = el.closest('pre');
    if (!pre || !src) continue;
    // The id must be unique per render or mermaid reuses a stale definition;
    // the counter is passed in so the caller stays deterministic under test.
    const id = 'mmd-' + i + '-' + (o.idSeed != null ? o.idSeed : Date.now());
    try {
      const out = await m.render(id, src);
      const wrap = root.ownerDocument.createElement('div');
      wrap.className = 'mermaid-wrapper';
      const dia = root.ownerDocument.createElement('div');
      dia.className = 'mermaid';
      dia.innerHTML = out.svg;
      wrap.appendChild(dia);
      pre.replaceWith(wrap);
      n++;
    } catch (err) {
      console.warn('md-editor: mermaid failed:', err);
    } finally {
      // A diagram that will not parse still gets drawn: mermaid renders its
      // "Syntax error in text" graphic into a scratch element it appends to
      // <body> — id 'd' + the render id — and then throws, leaving it there.
      // That element sits OUTSIDE the mounted document, so neither the next
      // render nor the host replacing the document's innerHTML can reach it,
      // and the error then shows on top of every file opened afterwards,
      // including files that contain no diagram at all.
      const doc = root.ownerDocument;
      const scratch = doc && typeof doc.getElementById === 'function' ? doc.getElementById('d' + id) : null;
      if (scratch && scratch.remove) scratch.remove();
    }
  }
  if (o.mermaidZoom !== false) zoom.init(root, o);
  return n;
}

function highlight(root) {
  const h = deps.hljs();
  if (!h) return 0;
  let n = 0;
  root.querySelectorAll('pre code').forEach((el) => {
    if (el.classList.contains('language-mermaid')) return;
    try { h.highlightElement(el); n++; } catch (e) {}
  });
  return n;
}

module.exports = { render, highlight, INIT, sweepScratch };
