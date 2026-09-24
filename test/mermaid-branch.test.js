'use strict';

/* Flowchart branches — each branch below the first fan-out gets its own hue.
   Where the fan-out is, which branch a shared node joins, and that an author's
   own colours win are the whole feature, so they are pinned here. The real
   mermaid 11 fixture covers the ids and shape markup; the hand-built SVGs
   cover the tree shapes it does not. */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { makePage } = require('./helpers/dom');

const branch = require('../src/features/mermaid-branch');

function mount(svgMarkup) {
  const p = makePage();
  p.content.innerHTML = '<div class="mermaid">' + svgMarkup + '</div>';
  return p.content.querySelector('svg');
}

const fixture = (name) => fs.readFileSync(path.join(__dirname, 'fixtures', 'mermaid-' + name + '.svg'), 'utf8');

// A flowchart SVG with only what the module reads: node ids, one shape per
// node, and edge ids. `styles` maps a node name to its shape's inline style.
function flowSvg(names, pairs, styles) {
  const key = (n) => 'flowchart-' + n + '-' + names.indexOf(n);
  const nodes = names.map((n) => '<g class="node default" id="s-' + key(n) + '">'
    + '<rect class="basic label-container" style="' + ((styles && styles[n]) || '') + '"></rect>'
    + '<text>' + n + '</text></g>').join('');
  const edges = pairs.map((pair, i) =>
    '<path data-edge="true" data-id="L_' + pair[0] + '_' + pair[1] + '_' + i + '"></path>').join('');
  return '<svg id="s">' + nodes + edges + '</svg>';
}

const branchOf = (svg, name) => {
  const el = [...svg.querySelectorAll('g.node')].find((n) => n.id.includes('-' + name + '-'));
  return el.getAttribute('data-mmd-branch');
};

test('a real flowchart: the root is trunk, each child starts a branch', () => {
  const svg = mount(fixture('flow'));
  // A --> B, B --> C_x, A --> C_x: A fans out to B and C_x.
  assert.strictEqual(branch.paint(svg), 2);
  assert.strictEqual(branchOf(svg, 'A'), null);
  assert.strictEqual(branchOf(svg, 'B'), '1');
  assert.strictEqual(branchOf(svg, 'C_x'), '2');
  const shape = svg.querySelector('[id$="-flowchart-B-1"] .label-container');
  assert.match(shape.getAttribute('style'), /fill: var\(--mermaid-branch-1-fill, #fdf1cc\)/);
});

test('the trunk runs down to the first fan-out; descendants join their branch', () => {
  const names = ['S', 'D', 'C', 'X', 'Y', 'X1', 'X2', 'Y1'];
  const svg = mount(flowSvg(names, [
    ['S', 'D'], ['D', 'C'], ['C', 'X'], ['C', 'Y'], ['X', 'X1'], ['X', 'X2'], ['Y', 'Y1'],
  ]));
  branch.paint(svg);
  ['S', 'D', 'C'].forEach((n) => assert.strictEqual(branchOf(svg, n), null, n + ' is trunk'));
  ['X', 'X1', 'X2'].forEach((n) => assert.strictEqual(branchOf(svg, n), '1', n));
  ['Y', 'Y1'].forEach((n) => assert.strictEqual(branchOf(svg, n), '2', n));
});

test('more branches than hues: the hues cycle', () => {
  const kids = ['K0', 'K1', 'K2', 'K3', 'K4', 'K5'];
  const svg = mount(flowSvg(['R'].concat(kids), kids.map((k) => ['R', k])));
  branch.paint(svg);
  assert.deepStrictEqual(kids.map((k) => branchOf(svg, k)), ['1', '2', '3', '4', '5', '1']);
});

test('a node two branches reach joins the nearer one', () => {
  const svg = mount(flowSvg(['R', 'A', 'B', 'A1', 'M'], [
    ['R', 'A'], ['R', 'B'], ['A', 'A1'], ['A1', 'M'], ['B', 'M'],
  ]));
  branch.paint(svg);
  assert.strictEqual(branchOf(svg, 'M'), '2', 'one hop from B, two from A');
});

test("an author's inline fill wins: that node is left alone", () => {
  const svg = mount(flowSvg(['R', 'A', 'B'], [['R', 'A'], ['R', 'B']], { A: 'fill:#ff0000' }));
  assert.strictEqual(branch.paint(svg), 1);
  assert.strictEqual(branchOf(svg, 'A'), null);
  assert.strictEqual(svg.querySelector('[id$="-flowchart-A-1"] rect').getAttribute('style'), 'fill:#ff0000');
});

test('no fan-out, or not a flowchart: nothing is painted', () => {
  assert.strictEqual(branch.paint(mount(flowSvg(['A', 'B', 'C'], [['A', 'B'], ['B', 'C']]))), 0);
  assert.strictEqual(branch.paint(mount(fixture('er'))), 0);
  assert.strictEqual(branch.paint(null), 0);
});
