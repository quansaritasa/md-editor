'use strict';

/* ================= mermaid focus — one table and its neighbours =================
   Clicking a node lights it, every node one hop away and the edges between
   them; the rest of the diagram fades. It answers "what does this table touch?"
   at any zoom level, where following lines by eye stops working.

   Right-clicking reaches one hop further: the same set plus the neighbours of
   those neighbours, for the question "what is this table wrapped up with?" on a
   diagram where one hop is not enough to see the shape of a cluster. A left
   click on the same table drops back to its direct relations.

   A focus spans several copies of one diagram at once — the inline SVG, the
   fullscreen clone and the minimap — so they never disagree. The key lives on
   each SVG as data-mmd-focus, which is what lets a clone made mid-focus start
   out focused on the same node; the reach rides along in data-mmd-hops. */

const { readGraph, neighbourhood, nodeOf } = require('./mermaid-graph');

const ON = 'mmd-focus';
const HIT = 'mmd-hit';
const ROOT = 'mmd-hit-root';
const PEEK = 'mmd-peek'; // a neighbour picked out beside the focus
const PAIR = 'mmd-pair'; // an edge (and its label) between the focus and the peek
const PEEKING = 'mmd-peeking'; // on the svg while a peek is shown
const KEY_ATTR = 'data-mmd-focus';
const HOPS_ATTR = 'data-mmd-hops';
const DRAG_PX = 4; // a press that travels further than this was a pan, not a click

// How far a focus reaches: a click lights the table's direct relations, a right
// click also their own. Two is the widest a focus goes, whatever a host passes.
const NEAR = 1;
const FAR = 2;
const clampHops = (v) => (v >= FAR ? FAR : NEAR);

function clearSvg(svg) {
  svg.classList.remove(ON);
  svg.removeAttribute(KEY_ATTR);
  svg.removeAttribute(HOPS_ATTR);
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

function paint(svg, graph, key, hops) {
  clearSvg(svg);
  const node = graph.nodes.find((n) => n.key === key);
  if (!node) return false;
  const hood = neighbourhood(graph, node, hops);
  svg.classList.add(ON);
  svg.setAttribute(KEY_ATTR, key);
  svg.setAttribute(HOPS_ATTR, String(hops));
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
  const first = list[0];
  let key = (first && first.getAttribute(KEY_ATTR)) || null;
  let hops = clampHops(Number(first && first.getAttribute(HOPS_ATTR)));
  let peeked = null;
  const listeners = [], peekers = [];
  const changed = () => { peeked = null; listeners.forEach((fn) => fn(key)); };
  const f = {
    graph: graphs[0] || { nodes: [], edges: [] },
    get key() { return key; },
    // How far the current focus reaches — 2 after a right click, else 1.
    get reach() { return hops; },
    set(k, to) {
      key = k;
      hops = clampHops(to);
      list.forEach((svg, i) => paint(svg, graphs[i], k, hops));
      changed();
    },
    clear() {
      key = null;
      hops = NEAR;
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
    // A press on a table focuses it as far as `to` reaches. Pressing the table
    // that is already focused that far clears; pressing it from a wider focus
    // narrows it back instead, so a left click after a right click shows the
    // direct relations again.
    toggle(node, to) {
      const want = clampHops(to);
      if (!node || (node.key === key && want === hops)) f.clear();
      else f.set(node.key, want);
    },
  };
  return f;
}

// A click on a node toggles its focus; a click on empty diagram clears it.
// With Shift or Ctrl held it peeks a related table instead (where supported).
// A right click on a node focuses two hops out — its relations and theirs.
// Buttons and other controls inside `host` are left alone.
function bindClicks(host, focus, ignore) {
  let x0 = 0, y0 = 0;
  const inner = 'button, input, ' + (ignore || '.mermaid-zoom-controls');
  const dragged = (e) => Math.abs(e.clientX - x0) > DRAG_PX || Math.abs(e.clientY - y0) > DRAG_PX;
  host.addEventListener('mousedown', (e) => { x0 = e.clientX; y0 = e.clientY; });
  host.addEventListener('click', (e) => {
    if (dragged(e)) return;
    if (e.target.closest(inner)) return;
    if (!e.target.closest('svg')) { if (focus.key) focus.clear(); return; }
    const node = nodeOf(focus.graph, e.target);
    if ((e.shiftKey || e.ctrlKey || e.metaKey) && focus.peekToggle) { focus.peekToggle(node); return; }
    if (node) focus.toggle(node);
    else if (focus.key) focus.clear();
  });
  // Right click reads one hop further. It is only a focus when the press landed
  // on a table and did not pan: off a table the browser's own menu stays.
  // macOS turns a Ctrl+left click into this event too, and Ctrl+click is the
  // peek modifier there, so that one is left to the click handler above.
  host.addEventListener('contextmenu', (e) => {
    if (e.ctrlKey && e.button !== 2) return;
    if (dragged(e) || e.target.closest(inner)) return;
    const node = e.target.closest('svg') && nodeOf(focus.graph, e.target);
    if (!node) return;
    e.preventDefault();
    focus.toggle(node, FAR);
  });
}

module.exports = { create, bindClicks };
