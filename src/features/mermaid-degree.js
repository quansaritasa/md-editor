'use strict';

/* ================= mermaid ER degree — how connected a table is =================
   Tags every ER table with how many OTHER tables it links to, and paints its
   title band from that: grey when nothing references it, the theme's usual
   colour for a few, warm when five or more. A schema then answers "which table
   is the hub, and which one is stranded" before anyone traces a single line.

   The count is PARTNER TABLES, not relationship lines. Two relationships
   between the same pair still read as one link — they say the same thing about
   how connected those tables are — and a self-relationship counts as one.

   What this module writes is a class on the table's <g class="node">, never a
   fill: mermaid bakes its own colours into each SVG's <style>, keyed by the
   SVG's id, so css/base.css owns the paint and a theme can override it with
   --mermaid-er-deg-*. Classes also survive the DOM clones the fullscreen view
   and the minimap make, so every copy of a diagram agrees for free. What they
   do NOT survive is a redraw: mermaid.refreshTheme replaces the whole SVG, so
   it calls decorate() again.

   Non-ER diagrams are left alone — a flowchart's arrow count says nothing
   about its boxes. */

const { readGraph } = require('./mermaid-graph');

const HIGH = 5; // five partner tables or more is a hub
const BUCKETS = ['zero', 'low', 'high'];
const CLASSES = ['mmd-deg-0', 'mmd-deg-low', 'mmd-deg-high'];
const LEGEND = 'mermaid-degree-legend';
const KEYS = [['mmd-deg-0', '0'], ['mmd-deg-low', '1–4'], ['mmd-deg-high', '5+']];

const isEr = (svg) => !!(svg && svg.classList && svg.classList.contains('erDiagram'));

// How many distinct tables each node links to.
function degrees(graph) {
  const partners = new Map();
  graph.nodes.forEach((n) => partners.set(n, new Set()));
  graph.edges.forEach((e) => {
    // A self-relationship adds the table itself: one link, not none.
    if (partners.has(e.from)) partners.get(e.from).add(e.to);
    if (partners.has(e.to)) partners.get(e.to).add(e.from);
  });
  return partners;
}

// Tag every table in one SVG. Returns how many landed in each bucket; all zero
// when the SVG is not an ER diagram, so the caller can skip the legend.
function paint(svg) {
  const counts = { zero: 0, low: 0, high: 0 };
  if (!isEr(svg)) return counts;
  const graph = readGraph(svg);
  const partners = degrees(graph);
  graph.nodes.forEach((n) => {
    const degree = partners.get(n).size;
    const b = degree === 0 ? 0 : (degree < HIGH ? 1 : 2);
    CLASSES.forEach((c) => n.el.classList.remove(c));
    n.el.classList.add(CLASSES[b]);
    n.el.setAttribute('data-mmd-degree', String(degree));
    counts[BUCKETS[b]]++;
  });
  return counts;
}

// Three swatches naming the scale. pointer-events are off in css/base.css, so
// it never eats a drag meant for the diagram underneath it.
function legend(doc) {
  const box = doc.createElement('div');
  box.className = LEGEND;
  const title = doc.createElement('span');
  title.className = 'mermaid-degree-legend-title';
  title.textContent = 'Tables linked';
  box.appendChild(title);
  KEYS.forEach(([cls, text]) => {
    const key = doc.createElement('span');
    key.className = 'mermaid-degree-key ' + cls;
    key.appendChild(doc.createElement('i'));
    key.appendChild(doc.createTextNode(text));
    box.appendChild(key);
  });
  return box;
}

// Paint the SVG inside `host` and keep `wrap`'s legend in step with it — added
// for an ER diagram, removed when a redraw turned it into something else.
function decorate(wrap, host) {
  const svg = host && host.querySelector && host.querySelector('svg');
  const counts = paint(svg);
  if (!wrap || !wrap.querySelector) return counts;
  const had = wrap.querySelector('.' + LEGEND);
  if (!isEr(svg)) {
    if (had) had.remove();
  } else if (!had) {
    wrap.appendChild(legend(wrap.ownerDocument));
  }
  return counts;
}

module.exports = { decorate, paint, legend, HIGH, CLASSES };
