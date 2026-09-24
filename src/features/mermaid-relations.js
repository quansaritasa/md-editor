'use strict';

/* ================= mermaid relations — what a focused ER table links to =================
   A panel in the fullscreen view. Focus a table and it lists the table's
   primary and foreign keys, then every relationship it takes part in: the
   partner table, the kind (one-to-many, …) with the exact cardinalities, the
   relationship's label, and the partner's own keys. Clicking a partner pans
   the view so it and the focused table are both in sight, and gives it a
   glow of its own — zoom, focus and panel all
   stay as they were. The table's own name pans back to it. Shift/Ctrl+click
   on a related table in the diagram picks it out the same way, in place.

   Presses, clicks and wheel turns stop at the panel: no pan, no focus toggle,
   and a long list scrolls instead of moving the diagram. */

const model = require('./mermaid-er-model');

function el(doc, tag, cls, text) {
  const e = doc.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// "PK  id, code" — or nothing at all when the table declares none.
function keyLine(doc, tag, cols) {
  if (!cols.length) return null;
  const row = el(doc, 'div', 'mermaid-relations-keys');
  row.appendChild(el(doc, 'span', 'mermaid-relations-tag is-' + tag.toLowerCase(), tag));
  const names = el(doc, 'span', 'mermaid-relations-cols', cols.map((c) => c.name).join(', '));
  names.title = cols.map((c) => [c.type, c.name, c.comment && '— ' + c.comment].filter(Boolean).join(' ')).join('\n');
  row.appendChild(names);
  return row;
}

function appendKeys(doc, box, table) {
  const pk = keyLine(doc, 'PK', table.pks);
  const fk = keyLine(doc, 'FK', table.fks);
  if (pk) box.appendChild(pk);
  if (fk) box.appendChild(fk);
  return !!(pk || fk);
}

// "One organizations – **many** users": the focused table's own word in bold,
// so its end of the relationship is found without reading the names.
function says(doc, parts) {
  const line = el(doc, 'div', 'mermaid-relations-says');
  parts.forEach((p, i) => {
    if (i) line.appendChild(doc.createTextNode(' – '));
    line.appendChild(el(doc, p.me ? 'strong' : 'span', p.me ? 'is-me' : null, p.word));
    line.appendChild(doc.createTextNode(' ' + p.name));
  });
  return line;
}

function relItem(doc, table, rel, go) {
  const li = el(doc, 'li', 'mermaid-relations-item');
  const head = el(doc, 'div', 'mermaid-relations-head');
  const self = rel.partner.key === table.key;
  const name = el(doc, 'button', 'mermaid-relations-partner', self ? rel.partner.label + ' (itself)' : rel.partner.label);
  name.type = 'button';
  name.title = 'Show ' + rel.partner.label + ' (keeps the zoom and the selection)';
  name.addEventListener('click', () => go(rel.partner.key));
  if (!self) li.setAttribute('data-partner', rel.partner.key);
  head.appendChild(name);
  if (rel.label) head.appendChild(el(doc, 'span', 'mermaid-relations-label', rel.label));
  li.appendChild(head);
  const d = model.describe(table, rel);
  li.appendChild(says(doc, d.parts));
  const meta = el(doc, 'div', 'mermaid-relations-kind', d.kind + ' · ' + d.cards + (rel.identifying ? '' : ' · non-identifying'));
  meta.title = 'Each ' + table.label + ' has ' + rel.theirs.short + ' ' + rel.partner.label
    + '; each ' + rel.partner.label + ' has ' + rel.mine.short + ' ' + table.label;
  li.appendChild(meta);
  if (!self && !appendKeys(doc, li, rel.partner)) li.appendChild(el(doc, 'div', 'mermaid-relations-none', 'No keys declared'));
  return li;
}

function fill(panel, m, key, go, close) {
  const doc = panel.ownerDocument;
  const table = m && m.tables.get(key);
  panel.textContent = '';
  panel.scrollTop = 0; // a new table's list starts at its name, not where the last one was scrolled to
  panel.hidden = !table;
  if (!table) return;
  const top = el(doc, 'div', 'mermaid-relations-title');
  const me = el(doc, 'button', 'mermaid-relations-name', table.label);
  me.type = 'button';
  me.title = 'Show ' + table.label;
  me.addEventListener('click', () => go(table.key));
  top.appendChild(me);
  const x = el(doc, 'button', 'mermaid-relations-close', '×');
  x.type = 'button';
  x.title = 'Clear focus (Esc)';
  x.addEventListener('click', close);
  top.appendChild(x);
  panel.appendChild(top);
  if (!appendKeys(doc, panel, table)) panel.appendChild(el(doc, 'div', 'mermaid-relations-none', 'No keys declared'));
  const rels = model.relationsOf(m, key);
  panel.appendChild(el(doc, 'div', 'mermaid-relations-heading', 'Relationships (' + rels.length + ')'));
  const list = el(doc, 'ul', 'mermaid-relations-list');
  rels.forEach((r) => list.appendChild(relItem(doc, table, r, go)));
  panel.appendChild(list);
}

const MARGIN = 24; // canvas px kept clear around a framed pair

// Nudge offset x (diagram point p sits at x + p·s) until `span` {a, b} lies
// within `range` {lo, hi}. A span wider than that keeps its start in view.
function fitAxis(x0, s, span, range) {
  let x = x0;
  if (x + span.b * s > range.hi) x = range.hi - span.b * s;
  if (x + span.a * s < range.lo) x = range.lo - span.a * s;
  return x;
}

// The offset that centres `span` in `range` at scale s.
const centre = (s, span, range) => (range.lo + range.hi) / 2 - ((span.a + span.b) / 2) * s;

// Pan, never zoom, so the focused table and `partner` share the free part of
// the canvas — right of the panel, inside a margin. When the pair is wider or
// taller than that at this zoom, the partner stays whole and the focused
// table shows as much as still fits.
function frame(view, panel, focusEl, partnerEl) {
  const v = view.get();
  const A = view.boxOf(focusEl), P = view.boxOf(partnerEl);
  const left = (panel.hidden ? 0 : panel.offsetLeft + panel.offsetWidth) + MARGIN;
  // A canvas too narrow for the panel's reserve falls back to the plain margin.
  const cols = { lo: v.W - MARGIN > left ? left : MARGIN, hi: v.W - MARGIN };
  const rows = { lo: MARGIN, hi: v.H - MARGIN };
  const pairX = { a: Math.min(A.l, P.l), b: Math.max(A.r, P.r) };
  const pairY = { a: Math.min(A.t, P.t), b: Math.max(A.b, P.b) };
  const x = fitAxis(centre(v.s, pairX, cols), v.s, { a: P.l, b: P.r }, cols);
  const y = fitAxis(centre(v.s, pairY, rows), v.s, { a: P.t, b: P.b }, rows);
  view.pan(x - v.x, y - v.y);
}

// Mark every row about `key` — a pair can share several relationships — and
// bring the first into the panel's own view. Scrolled by hand, not with
// scrollIntoView, which would also try to scroll the canvas behind it.
function markRows(panel, key) {
  const rows = [...panel.querySelectorAll('.mermaid-relations-item')];
  rows.forEach((li) => li.classList.toggle('is-peek', !!key && li.getAttribute('data-partner') === key));
  const first = rows.find((li) => li.classList.contains('is-peek'));
  if (!first) return;
  const top = first.offsetTop, bottom = top + first.offsetHeight;
  if (top < panel.scrollTop) panel.scrollTop = top - 8;
  else if (bottom > panel.scrollTop + panel.clientHeight) panel.scrollTop = bottom - panel.clientHeight + 8;
}

// Add the panel to `canvas` and keep it on the focused table. `src` is the
// diagram's mermaid source; nothing is shown until it has been parsed.
function attach(canvas, focus, view, src) {
  const doc = canvas.ownerDocument;
  const panel = el(doc, 'aside', 'mermaid-relations');
  panel.hidden = true;
  ['mousedown', 'click', 'wheel'].forEach((t) => panel.addEventListener(t, (e) => e.stopPropagation()));
  canvas.appendChild(panel);
  let m = null;
  // Only the view moves: same zoom, same focused table, same panel. A partner
  // is framed together with the focused table and gets its own glow; the
  // focused table's own name centres it and drops that glow.
  const go = (key) => {
    const node = focus.graph.nodes.find((n) => n.key === key);
    focus.peek(key);
    if (!node) return;
    const own = focus.graph.nodes.find((n) => n.key === focus.key);
    if (own && own !== node) frame(view, panel, own.el, node.el);
    else view.centerOn(node.el);
  };
  const show = () => fill(panel, m, focus.key, go, () => focus.clear());
  focus.onChange(show);
  focus.onPeek((key) => markRows(panel, key));
  const ready = model.load(src).then((parsed) => { m = parsed; show(); return !!parsed; });
  return { panel, ready, detach() { panel.remove(); } };
}

module.exports = { attach, fill, frame };
