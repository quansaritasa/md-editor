'use strict';

/* ================= mermaid branches — a hue per flowchart branch =================
   mermaid fills every flowchart node from one variable, so a tree of boxes
   reads as one block of mint. This finds the first node that fans out, walking
   down from the diagram's roots, and gives each branch below it a hue of its
   own. The nodes above it — the trunk — keep the palette's mint, so the eye
   finds where the diagram splits and what hangs off each side.

   A node two branches reach goes to the nearer one: every branch is walked
   breadth-first at the same time. A diagram that never fans out, or is not a
   flowchart, is left alone.

   Painted as an inline style, not a class. mermaid's own <style> is keyed by
   the SVG's id, which no class rule outranks without !important, and
   !important would also beat an author's `style X fill:…` — mermaid writes
   that inline, on the same shape. So a node whose shape already has an inline
   fill is the author's and is skipped; a classDef still wins on its own,
   because mermaid emits it as an id-keyed !important rule. The inline value is
   a var() with the hue as fallback, so a theme may override
   --mermaid-branch-N-fill / -stroke. Inline styles survive the clones the
   fullscreen view and the minimap make; a redraw replaces the SVG, so
   mermaid.js paints again. */

const { readGraph } = require('./mermaid-graph');

// [fill, border]. Gold and blue are the palette's edge-label and subgraph
// colours, lightened to the mint's weight so dark ink reads on every one;
// rose, violet and lime keep five branches from repeating.
const HUES = [
  ['#fdf1cc', '#b7791f'],
  ['#e0edfd', '#2f6fb8'],
  ['#fde7ec', '#be3455'],
  ['#efe8fb', '#6d4bc3'],
  ['#eaf5d8', '#4d7c0f'],
];

const isFlowchart = (graph) => graph.nodes.some((n) => n.key.startsWith('flowchart-'));

// Each node's children, in the order their edges were drawn, and the nodes
// nothing points at.
function childrenOf(graph) {
  const kids = new Map(graph.nodes.map((n) => [n, []]));
  const hasParent = new Set();
  graph.edges.forEach((e) => {
    if (e.from === e.to || !kids.has(e.from)) return;
    const list = kids.get(e.from);
    if (!list.includes(e.to)) list.push(e.to);
    hasParent.add(e.to);
  });
  return { kids, roots: graph.nodes.filter((n) => !hasParent.has(n)) };
}

// The first node with two or more children, breadth-first from the roots,
// and every node visited on the way there — the trunk.
function fanOut(kids, roots) {
  const trunk = new Set();
  const queue = roots.slice();
  while (queue.length) {
    const n = queue.shift();
    if (trunk.has(n)) continue;
    trunk.add(n);
    if (kids.get(n).length >= 2) return { hub: n, trunk };
    queue.push(...kids.get(n));
  }
  return null;
}

// node -> index into HUES, for every node below the fan-out.
function branches(graph) {
  const { kids, roots } = childrenOf(graph);
  const found = fanOut(kids, roots);
  const hue = new Map();
  if (!found) return hue;
  const heads = kids.get(found.hub).filter((n) => !found.trunk.has(n));
  heads.forEach((h, i) => hue.set(h, i % HUES.length));
  const queue = heads.slice();
  while (queue.length) {
    const n = queue.shift();
    kids.get(n).forEach((k) => {
      if (hue.has(k) || found.trunk.has(k)) return;
      hue.set(k, hue.get(n));
      queue.push(k);
    });
  }
  return hue;
}

const hasFill = (shape) => /(^|;)\s*fill\s*:/.test(shape.getAttribute('style') || '');

function paintNode(el, i) {
  const shapes = Array.from(el.querySelectorAll('.label-container'));
  if (!shapes.length || shapes.some(hasFill)) return false;
  const n = i + 1;
  const add = 'fill: var(--mermaid-branch-' + n + '-fill, ' + HUES[i][0] + '); '
    + 'stroke: var(--mermaid-branch-' + n + '-stroke, ' + HUES[i][1] + ');';
  shapes.forEach((s) => {
    const had = (s.getAttribute('style') || '').trim();
    s.setAttribute('style', had ? had.replace(/;?$/, '; ') + add : add);
  });
  el.setAttribute('data-mmd-branch', String(n));
  return true;
}

// Colour one SVG's branches. Returns how many nodes were painted.
function paint(svg) {
  if (!svg || !svg.querySelectorAll) return 0;
  const graph = readGraph(svg);
  if (!isFlowchart(graph)) return 0;
  let painted = 0;
  branches(graph).forEach((i, node) => {
    if (paintNode(node.el, i)) painted++;
  });
  return painted;
}

module.exports = { paint, branches, HUES };
