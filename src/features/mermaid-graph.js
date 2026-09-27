'use strict';

/* ================= mermaid graph — who connects to whom =================
   Reads a rendered mermaid 11 SVG back into nodes and edges, so focus, search
   and the minimap can reason about the diagram without re-parsing its source.

   mermaid names things consistently enough to join them:
     node   <g class="node" id="<svgId>-entity-CUSTOMER-0">   (ER)
            <g class="node" id="<svgId>-flowchart-A-0">        (flowchart)
            <g class="node" id="<svgId>-classId-Duck-1">       (class)
     edge   <path data-edge="true" data-id="id_entity-CUSTOMER-0_entity-ORDER-1_0">
            <path data-edge="true" data-id="L_A_B_0">
     label  <g class="label" data-id="…same as its edge…">
   An edge id is "<prefix><from>_<to>_<n>". Node names may contain "_" too, so
   the split is chosen by trying every "_" until both halves name a node.
   A diagram that follows none of this (sequence, pie, …) reads as no nodes
   and no edges, and every feature built on it quietly does nothing. */

function shortName(key) {
  // "entity-CUSTOMER-0" -> "CUSTOMER"; "flowchart-C_x-3" -> "C_x"
  return key.replace(/^[A-Za-z]+-/, '').replace(/-\d+$/, '');
}

function readNodes(svg) {
  const prefix = svg.id ? svg.id + '-' : '';
  const byName = new Map();
  const nodes = [];
  svg.querySelectorAll('g.node').forEach((el) => {
    const key = prefix && el.id.startsWith(prefix) ? el.id.slice(prefix.length) : el.id;
    if (!key) return;
    const lbl = el.querySelector('.nodeLabel, text');
    const node = { key, el, name: shortName(key), label: ((lbl && lbl.textContent) || '').trim() };
    nodes.push(node);
    byName.set(key, node);
    if (!byName.has(node.name)) byName.set(node.name, node);
  });
  return { nodes, byName };
}

function splitEdgeId(id, byName) {
  const body = id.replace(/^(L_|id_)/, '').replace(/_\d+$/, '');
  for (let i = body.indexOf('_'); i > 0; i = body.indexOf('_', i + 1)) {
    const a = byName.get(body.slice(0, i));
    const b = byName.get(body.slice(i + 1));
    if (a && b) return [a, b];
  }
  return null;
}

function readGraph(svg) {
  const { nodes, byName } = readNodes(svg);
  const labels = new Map();
  svg.querySelectorAll('g.label[data-id]').forEach((g) => {
    labels.set(g.getAttribute('data-id'), g.closest('.edgeLabel') || g);
  });
  const edges = [];
  svg.querySelectorAll('path[data-edge="true"][data-id]').forEach((path) => {
    const id = path.getAttribute('data-id');
    const ends = splitEdgeId(id, byName);
    if (!ends) return;
    edges.push({ from: ends[0], to: ends[1], path, label: labels.get(id) || null });
  });
  return { nodes, edges };
}

// The node, every node within `hops` of it, and the edges that touch any of
// them. One hop by default — the node and its direct neighbours; two reaches
// the neighbours' own neighbours as well. An isolated node stops the walk early.
function neighbourhood(graph, node, hops) {
  const depth = Math.max(1, hops > 1 ? 2 : 1);
  const nodes = new Set([node]);
  const edges = [];
  let ring = new Set([node]);
  for (let i = 0; i < depth && ring.size; i++) {
    const next = new Set();
    graph.edges.forEach((e) => {
      const from = ring.has(e.from), to = ring.has(e.to);
      if (!from && !to) return;
      if (!edges.includes(e)) edges.push(e);
      const out = from ? e.to : e.from;
      if (nodes.has(out)) return;
      nodes.add(out);
      next.add(out);
    });
    ring = next;
  }
  return { nodes, edges };
}

function nodeOf(graph, target) {
  const el = target && target.closest && target.closest('g.node');
  return (el && graph.nodes.find((n) => n.el === el)) || null;
}

module.exports = { readGraph, neighbourhood, nodeOf, shortName };
