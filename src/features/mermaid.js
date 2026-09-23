'use strict';

/* ================= mermaid diagrams + syntax highlighting =================
   Both peers are optional. A missing one means the step is skipped, not that
   rendering fails: a host may deliberately ship neither. */

const deps = require('../deps');
const zoom = require('./mermaid-zoom');
const mermaidTheme = require('./mermaid-theme');

const INIT = {
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'base',
  themeVariables: { background: '#f6f8fa' },
};

// ER tables are wide, so the SVG gets shrunk to fit the column and their text
// ends up smaller than any other diagram's. mermaid 11 ignores er.fontSize;
// a per-diagram init directive is the one knob that reaches ER alone, and it
// sits after any frontmatter so the frontmatter still parses. Column widths
// come from the top-level fontSize, box heights from themeVariables.fontSize,
// so both are set — to the table-name size, the largest; base.css then draws
// rows a little smaller inside those boxes.
const ER_FONT = '%%{init: {"fontSize": 42, "themeVariables": {"fontSize": "42px"}, '
  + '"er": {"nodeSpacing": 160, "rankSpacing": 120}}}%%\n';
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;

function withErFont(src) {
  const fm = FRONTMATTER.exec(src);
  const head = fm ? fm[0] : '';
  const body = src.slice(head.length);
  return /^(\s*%%.*\n)*\s*erDiagram\b/.test(body) ? head + ER_FONT + body : src;
}

let lastKey = null;

// (Re)initialised whenever the page theme's colours change, not once: mermaid
// bakes its palette into every SVG it draws, so a diagram drawn before a theme
// switch keeps the old theme's colours. Initialised lazily, so a host that
// pulls mermaid in late still gets a configured instance. Returns whether it
// (re)initialised. The host's mermaidConfig wins over the theme's colours.
function ensureInit(m, overrides, root) {
  const vars = root ? mermaidTheme.themeVars(root) : null;
  const key = JSON.stringify([vars, overrides || null]);
  if (key === lastKey) return false;
  const o = overrides || {};
  const themeVariables = Object.assign({}, INIT.themeVariables, vars || {}, o.themeVariables || {});
  m.initialize(Object.assign({}, INIT, o, { themeVariables }));
  lastKey = key;
  return true;
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

// One diagram to SVG markup, or null when it will not parse.
async function drawOne(m, id, src, doc) {
  try {
    return (await m.render(id, withErFont(src))).svg;
  } catch (err) {
    console.warn('md-editor: mermaid failed:', err);
    return null;
  } finally {
    // A diagram that will not parse still gets drawn: mermaid renders its
    // "Syntax error in text" graphic into a scratch element it appends to
    // <body> — id 'd' + the render id — and then throws, leaving it there.
    // That element sits OUTSIDE the mounted document, so neither the next
    // render nor the host replacing the document's innerHTML can reach it,
    // and the error then shows on top of every file opened afterwards,
    // including files that contain no diagram at all.
    const scratch = doc && typeof doc.getElementById === 'function' ? doc.getElementById('d' + id) : null;
    if (scratch && scratch.remove) scratch.remove();
  }
}

async function render(root, options) {
  const o = options || {};
  const m = deps.mermaid();
  if (!m) return 0;
  const doc = root.ownerDocument;
  // Before the early return on purpose: a leftover outlives the document that
  // produced it, so the file that has to clear it is usually one with no
  // diagrams at all. See drawOne's finally for how it gets there.
  sweepScratch(doc);
  const blocks = root.querySelectorAll('code.language-mermaid');
  if (!blocks.length) return 0;
  ensureInit(m, o.mermaidConfig, root);

  let n = 0;
  for (let i = 0; i < blocks.length; i++) {
    const src = (blocks[i].textContent || '').trim();
    const pre = blocks[i].closest('pre');
    if (!pre || !src) continue;
    // The id must be unique per render or mermaid reuses a stale definition;
    // the counter is passed in so the caller stays deterministic under test.
    const svg = await drawOne(m, 'mmd-' + i + '-' + (o.idSeed != null ? o.idSeed : Date.now()), src, doc);
    if (svg == null) continue;
    const wrap = doc.createElement('div');
    wrap.className = 'mermaid-wrapper';
    const dia = doc.createElement('div');
    dia.className = 'mermaid';
    dia.setAttribute('data-mermaid-src', src); // kept so refreshTheme can redraw it
    dia.innerHTML = svg;
    wrap.appendChild(dia);
    pre.replaceWith(wrap);
    n++;
  }
  if (o.mermaidZoom !== false) zoom.init(root, o);
  return n;
}

// Redraw the diagrams already on the page when the theme's colours changed —
// call it after a theme or light/dark switch has applied. A no-op, and cheap,
// when the colours are the same. Zoom and pan are kept; a focus is dropped.
async function refreshTheme(root, options) {
  const o = options || {};
  const m = deps.mermaid();
  if (!m || !root.querySelector('.mermaid[data-mermaid-src]')) return 0;
  if (!ensureInit(m, o.mermaidConfig, root)) return 0;
  const doc = root.ownerDocument;
  const dias = root.querySelectorAll('.mermaid-wrapper > .mermaid[data-mermaid-src]');
  let n = 0;
  for (let i = 0; i < dias.length; i++) {
    const svg = await drawOne(m, 'mmd-r' + i + '-' + Date.now(), dias[i].getAttribute('data-mermaid-src'), doc);
    if (svg == null) continue;
    dias[i].innerHTML = svg;
    n++;
  }
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

module.exports = { render, refreshTheme, highlight, INIT, sweepScratch, withErFont };
