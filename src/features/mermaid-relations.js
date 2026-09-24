'use strict';

/* ================= mermaid relations — what a focused ER table links to =================
   A panel in the fullscreen view. Focus a table and it lists the table's
   primary and foreign keys, then every relationship it takes part in: the
   partner table, the kind (one-to-many, …) with the exact cardinalities, the
   relationship's label, and the partner's own keys. Clicking a partner pans
   the view to it and gives it a glow of its own — zoom, focus and panel all
   stay as they were. The table's own name pans back to it.

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

function relItem(doc, table, rel, go) {
  const li = el(doc, 'li', 'mermaid-relations-item');
  const head = el(doc, 'div', 'mermaid-relations-head');
  const self = rel.partner.key === table.key;
  const name = el(doc, 'button', 'mermaid-relations-partner', self ? rel.partner.label + ' (itself)' : rel.partner.label);
  name.type = 'button';
  name.title = 'Show ' + rel.partner.label + ' (keeps the zoom and the selection)';
  name.addEventListener('click', () => {
    go(rel.partner.key);
    li.parentNode.querySelectorAll('.is-peek').forEach((x) => x.classList.remove('is-peek'));
    if (!self) li.classList.add('is-peek');
  });
  head.appendChild(name);
  if (rel.label) head.appendChild(el(doc, 'span', 'mermaid-relations-label', rel.label));
  li.appendChild(head);
  const d = model.describe(table, rel);
  li.appendChild(el(doc, 'div', 'mermaid-relations-says', d.text));
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
  // gets its own glow so it is found at once; back to the focused table drops it.
  const go = (key) => {
    const node = focus.graph.nodes.find((n) => n.key === key);
    focus.peek(key);
    if (key === focus.key) panel.querySelectorAll('.is-peek').forEach((x) => x.classList.remove('is-peek'));
    if (node) view.centerOn(node.el);
  };
  const show = () => fill(panel, m, focus.key, go, () => focus.clear());
  focus.onChange(show);
  const ready = model.load(src).then((parsed) => { m = parsed; show(); return !!parsed; });
  return { panel, ready, detach() { panel.remove(); } };
}

module.exports = { attach, fill };
