'use strict';

/* Diagram navigation — graph reading, focus, table search, fullscreen wiring.
   The fixtures are SVGs mermaid 11 really drew (test/fixtures/mermaid-*.svg),
   so a mermaid upgrade that renames its node or edge ids fails here instead of
   silently switching focus off. jsdom does no layout, so geometry (pan, fit,
   the minimap frame) is left to the host's browser smoke tests. */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { makePage } = require('./helpers/dom');

const graph = require('../src/features/mermaid-graph');
const focusLib = require('../src/features/mermaid-focus');
const search = require('../src/features/mermaid-search');
const { openFullscreen } = require('../src/features/mermaid-fullscreen');

function diagram(name) {
  const p = makePage();
  p.content.classList.add('md-editor');
  p.content.innerHTML = '<div class="mermaid-wrapper"><div class="mermaid">'
    + fs.readFileSync(path.join(__dirname, 'fixtures', 'mermaid-' + name + '.svg'), 'utf8')
    + '</div></div>';
  return { p, el: p.content.querySelector('.mermaid'), svg: p.content.querySelector('svg') };
}
const pairs = (g) => g.edges.map((e) => e.from.name + '>' + e.to.name).sort();
const names = (set) => [...set].map((n) => n.name).sort();

test('ER: tables and relationships are read back, underscores and all', () => {
  const g = graph.readGraph(diagram('er').svg);
  assert.deepStrictEqual(g.nodes.map((n) => n.name).sort(),
    ['AUDIT_LOG', 'CUSTOMER', 'LINE_ITEM', 'ORDER', 'PRODUCT']);
  assert.deepStrictEqual(pairs(g), ['CUSTOMER>ORDER', 'ORDER>LINE_ITEM', 'PRODUCT>LINE_ITEM']);
  assert.ok(g.edges.every((e) => e.label), 'every relationship has its label');
});

test('flowchart and class diagrams read the same way', () => {
  assert.deepStrictEqual(pairs(graph.readGraph(diagram('flow').svg)), ['A>B', 'A>C_x', 'B>C_x']);
  assert.deepStrictEqual(pairs(graph.readGraph(diagram('cls').svg)), ['Animal>Duck', 'Duck>Egg']);
});

test('neighbourhood is the node plus one hop, never two', () => {
  const g = graph.readGraph(diagram('er').svg);
  const order = g.nodes.find((n) => n.name === 'ORDER');
  const hood = graph.neighbourhood(g, order);
  assert.deepStrictEqual(names(hood.nodes), ['CUSTOMER', 'LINE_ITEM', 'ORDER']);
  assert.strictEqual(hood.edges.length, 2);
});

test('focus lights the neighbourhood, fades the rest, and clears', () => {
  const { svg } = diagram('er');
  const f = focusLib.create([svg]);
  f.set(f.graph.nodes.find((n) => n.name === 'ORDER').key);
  assert.ok(svg.classList.contains('mmd-focus'));
  const lit = [...svg.querySelectorAll('g.node.mmd-hit')].map((el) => graph.shortName(el.id.slice(svg.id.length + 1)));
  assert.deepStrictEqual(lit.sort(), ['CUSTOMER', 'LINE_ITEM', 'ORDER']);
  assert.strictEqual(svg.querySelectorAll('path[data-edge].mmd-hit').length, 2);
  assert.strictEqual(svg.querySelectorAll('.mmd-hit-root').length, 1);
  f.clear();
  assert.ok(!svg.classList.contains('mmd-focus'));
  assert.strictEqual(svg.querySelectorAll('.mmd-hit').length, 0);
});

test('a focus spans every copy, and a copy made mid-focus starts focused', () => {
  const { svg } = diagram('er');
  const copy = svg.cloneNode(true);
  const f = focusLib.create([svg, copy]);
  const key = f.graph.nodes.find((n) => n.name === 'PRODUCT').key;
  f.set(key);
  assert.strictEqual(copy.querySelectorAll('g.node.mmd-hit').length, 2);
  assert.strictEqual(focusLib.create([svg.cloneNode(true)]).key, key);
});

test('a click toggles focus; a drag does not', () => {
  const { p, svg } = diagram('er');
  const wrap = p.content.querySelector('.mermaid-wrapper');
  const f = focusLib.create([svg]);
  focusLib.bindClicks(wrap, f);
  const W = p.window;
  const node = f.graph.nodes.find((n) => n.name === 'CUSTOMER').el.querySelector('*') || svg;
  const press = (x2) => {
    node.dispatchEvent(new W.MouseEvent('mousedown', { bubbles: true, clientX: 10, clientY: 10 }));
    node.dispatchEvent(new W.MouseEvent('click', { bubbles: true, clientX: x2, clientY: 10 }));
  };
  press(60);
  assert.strictEqual(f.key, null, 'a 50px drag is a pan');
  press(11);
  assert.ok(f.key && f.key.includes('CUSTOMER'));
  press(11);
  assert.strictEqual(f.key, null, 'second click on the same table clears');
});

test('search ranks prefix matches first and ignores case', () => {
  const g = graph.readGraph(diagram('er').svg);
  assert.deepStrictEqual(search.rank(g.nodes, 'item').map((n) => n.name), ['LINE_ITEM']);
  assert.deepStrictEqual(search.rank(g.nodes, 'o').map((n) => n.name)[0], 'ORDER');
  assert.deepStrictEqual(search.rank(g.nodes, '  '), []);
});

test('fullscreen: search picks a table, Esc peels focus before closing', () => {
  const { p, el } = diagram('er');
  const W = p.window;
  const fs1 = openFullscreen(el, p.content);
  const overlay = p.content.querySelector('.mermaid-fullscreen-overlay');
  assert.ok(overlay.querySelector('.mermaid-minimap'), 'minimap shown');
  const input = overlay.querySelector('.mermaid-search-input');
  input.value = 'line';
  input.dispatchEvent(new W.Event('input', { bubbles: true }));
  assert.strictEqual(overlay.querySelectorAll('.mermaid-search-list li').length, 1);
  input.dispatchEvent(new W.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.ok(fs1.focus.key.includes('LINE_ITEM'));
  assert.ok(overlay.querySelector('.mermaid-minimap svg.mmd-focus'), 'minimap follows the focus');

  const esc = () => p.document.dispatchEvent(new W.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  esc();
  assert.strictEqual(fs1.focus.key, null, 'first Esc clears the focus');
  assert.ok(overlay.isConnected, 'overlay still open');
  esc();
  assert.ok(!overlay.isConnected, 'second Esc closes');
});
