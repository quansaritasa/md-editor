'use strict';

/* ================= mermaid focus — one table and its neighbours =================
   Clicking a node lights it, every node one hop away and the edges between
   them; the rest of the diagram fades. It answers "what does this table touch?"
   at any zoom level, where following lines by eye stops working.

   A focus spans several copies of one diagram at once — the inline SVG, the
   fullscreen clone and the minimap — so they never disagree. The key lives on
   each SVG as data-mmd-focus, which is what lets a clone made mid-focus start
   out focused on the same node. */

const { readGraph, neighbourhood, nodeOf } = require('./mermaid-graph');

const ON = 'mmd-focus';
const HIT = 'mmd-hit';
const ROOT = 'mmd-hit-root';
const PEEK = 'mmd-peek'; // a neighbour picked out beside the focus
const PAIR = 'mmd-pair'; // an edge (and its label) between the focus and the peek
const PEEKING = 'mmd-peeking'; // on the svg while a peek is shown
const DRAG_PX = 4; // a press that travels further than this was a pan, not a click

function clearSvg(svg) {
  svg.classList.remove(ON);
  svg.removeAttribute('data-mmd-focus');
  svg.querySelectorAll('.' + HIT + ', .' + ROOT).forEach((el) => el.classList.remove(HIT, ROOT));
  clearPeek(svg);
}

function clearPeek(svg) {
  svg.classList.remove(PEEKING);
  svg.querySelectorAll('.' + PEEK + ', .' + PAIR).forEach((el) => el.classList.remove(PEEK, PAIR));
}

// Pick out `peekKey` and every edge joining it to `key`; css/base.css fades
// the rest of the neighbourhood so the pair reads on its own.
function paintPeek(svg, graph, key, peekKey) {
  clearPeek(svg);
  const n = peekKey && peekKey !== key && graph.nodes.find((x) => x.key === peekKey);
  if (!n) return;
  svg.classList.add(PEEKING);
  n.el.classList.add(PEEK);
  graph.edges.forEach((e) => {
    const ends = [e.from.key, e.to.key];
    if (!ends.includes(key) || !ends.includes(peekKey)) return;
    e.path.classList.add(PAIR);
    if (e.label) e.label.classList.add(PAIR);
  });
}

// Is `node` one hop from the table with key `key`?
function isNeighbour(graph, key, node) {
  return graph.edges.some((e) => (e.from.key === key && e.to === node) || (e.to.key === key && e.from === node));
}

function paint(svg, graph, key) {
  clearSvg(svg);
  const node = graph.nodes.find((n) => n.key === key);
  if (!node) return false;
  const hood = neighbourhood(graph, node);
  svg.classList.add(ON);
  svg.setAttribute('data-mmd-focus', key);
  hood.nodes.forEach((n) => n.el.classList.add(HIT));
  hood.edges.forEach((e) => {
    e.path.classList.add(HIT);
    if (e.label) e.label.classList.add(HIT);
  });
  node.el.classList.add(ROOT);
  return true;
}

// svgs[0] is the one clicks and search read from; the rest follow it.
function create(svgs) {
  const list = svgs.filter(Boolean);
  const graphs = list.map(readGraph);
  let key = (list[0] && list[0].getAttribute('data-mmd-focus')) || null;
  let peeked = null;
  const listeners = [], peekers = [];
  const changed = () => { peeked = null; listeners.forEach((fn) => fn(key)); };
  const f = {
    graph: graphs[0] || { nodes: [], edges: [] },
    get key() { return key; },
    set(k) {
      key = k;
      list.forEach((svg, i) => paint(svg, graphs[i], k));
      changed();
    },
    clear() {
      key = null;
      list.forEach(clearSvg);
      changed();
    },
    get peeked() { return peeked; },
    // Pick out one neighbour beside the focus, in its own colour, without
    // moving the focus. A new focus (or a clear) drops it; null drops it now.
    peek(k) {
      peeked = k && k !== key ? k : null;
      list.forEach((svg, i) => paintPeek(svg, graphs[i], key, peeked));
      peekers.forEach((fn) => fn(peeked));
    },
    // Shift/Ctrl+click: peek a neighbour of the focus, or drop it when it is
    // the one already peeked. Anything else — no focus, the focus itself, a
    // table that is not related — is ignored.
    peekToggle(node) {
      if (!key || !node || node.key === key || !isNeighbour(f.graph, key, node)) return;
      f.peek(node.key === peeked ? null : node.key);
    },
    // fn(peekKey) after every peek; null once dropped.
    onPeek(fn) { peekers.push(fn); },
    // fn(key) after every set and clear; key is null once cleared.
    onChange(fn) { listeners.push(fn); },
    toggle(node) {
      if (!node || node.key === key) f.clear();
      else f.set(node.key);
    },
  };
  return f;
}

// A click on a node toggles its focus; a click on empty diagram clears it.
// With Shift or Ctrl held it peeks a related table instead (where supported).
// Buttons and other controls inside `host` are left alone.
function bindClicks(host, focus, ignore) {
  let x0 = 0, y0 = 0;
  host.addEventListener('mousedown', (e) => { x0 = e.clientX; y0 = e.clientY; });
  host.addEventListener('click', (e) => {
    if (Math.abs(e.clientX - x0) > DRAG_PX || Math.abs(e.clientY - y0) > DRAG_PX) return;
    if (e.target.closest('button, input, ' + (ignore || '.mermaid-zoom-controls'))) return;
    if (!e.target.closest('svg')) { if (focus.key) focus.clear(); return; }
    const node = nodeOf(focus.graph, e.target);
    if ((e.shiftKey || e.ctrlKey || e.metaKey) && focus.peekToggle) { focus.peekToggle(node); return; }
    if (node) focus.toggle(node);
    else if (focus.key) focus.clear();
  });
}

module.exports = { create, bindClicks };
