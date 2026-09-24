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
const DRAG_PX = 4; // a press that travels further than this was a pan, not a click

function clearSvg(svg) {
  svg.classList.remove(ON);
  svg.removeAttribute('data-mmd-focus');
  svg.querySelectorAll('.' + HIT + ', .' + ROOT).forEach((el) => el.classList.remove(HIT, ROOT));
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
  const listeners = [];
  const changed = () => listeners.forEach((fn) => fn(key));
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
// Buttons and other controls inside `host` are left alone.
function bindClicks(host, focus, ignore) {
  let x0 = 0, y0 = 0;
  host.addEventListener('mousedown', (e) => { x0 = e.clientX; y0 = e.clientY; });
  host.addEventListener('click', (e) => {
    if (Math.abs(e.clientX - x0) > DRAG_PX || Math.abs(e.clientY - y0) > DRAG_PX) return;
    if (e.target.closest('button, input, ' + (ignore || '.mermaid-zoom-controls'))) return;
    if (!e.target.closest('svg')) { if (focus.key) focus.clear(); return; }
    const node = nodeOf(focus.graph, e.target);
    if (node) focus.toggle(node);
    else if (focus.key) focus.clear();
  });
}

module.exports = { create, bindClicks };
