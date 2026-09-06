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

async function render(root, options) {
  const o = options || {};
  const m = deps.mermaid();
  if (!m) return 0;
  const blocks = root.querySelectorAll('code.language-mermaid');
  if (!blocks.length) return 0;
  ensureInit(m, o.mermaidConfig);

  let n = 0;
  for (let i = 0; i < blocks.length; i++) {
    const el = blocks[i];
    const src = (el.textContent || '').trim();
    const pre = el.closest('pre');
    if (!pre || !src) continue;
    try {
      // The id must be unique per render or mermaid reuses a stale definition;
      // the counter is passed in so the caller stays deterministic under test.
      const id = 'mmd-' + i + '-' + (o.idSeed != null ? o.idSeed : Date.now());
      const out = await m.render(id, src);
      const wrap = root.ownerDocument.createElement('div');
      wrap.className = 'mermaid-wrapper';
      const dia = root.ownerDocument.createElement('div');
      dia.className = 'mermaid';
      dia.innerHTML = out.svg;
      wrap.appendChild(dia);
      pre.replaceWith(wrap);
      n++;
    } catch (err) { console.warn('md-editor: mermaid failed:', err); }
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

module.exports = { render, highlight, INIT };
