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
// The tables a focus has lit, by name.
const lit = (svg) => [...svg.querySelectorAll('g.node.mmd-hit')]
  .map((el) => graph.shortName(el.id.slice(svg.id.length + 1))).sort();

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

test('neighbourhood is the node plus the hops asked for, one by default', () => {
  const g = graph.readGraph(diagram('er').svg);
  const order = g.nodes.find((n) => n.name === 'ORDER');
  const hood = graph.neighbourhood(g, order);
  assert.deepStrictEqual(names(hood.nodes), ['CUSTOMER', 'LINE_ITEM', 'ORDER']);
  assert.strictEqual(hood.edges.length, 2);
  // Two hops bring in what the neighbours touch — and stop there, so the lone
  // AUDIT_LOG stays out either way.
  const far = graph.neighbourhood(g, order, 2);
  assert.deepStrictEqual(names(far.nodes), ['CUSTOMER', 'LINE_ITEM', 'ORDER', 'PRODUCT']);
  assert.strictEqual(far.edges.length, 3);
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

// mermaid writes class="edgeLabel" twice per relationship: on the outer <g>
// and on the <span> holding the text. Fading by the class alone dimmed a lit
// relationship's own text, since only the <g> ever carries mmd-hit.
test('a lit relationship keeps its label text at full strength', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'base.css'), 'utf8');
  const fade = css.match(/([^}]+)\{\s*opacity: 0\.12;/)[1].trim();
  const { svg } = diagram('er');
  const f = focusLib.create([svg]);
  f.set(f.graph.nodes.find((n) => n.name === 'ORDER').key);
  const lit = [...svg.querySelectorAll('g.edgeLabel.mmd-hit')];
  assert.strictEqual(lit.length, 2);
  lit.forEach((g) => g.querySelectorAll('.edgeLabel').forEach((inner) => {
    assert.ok(!inner.matches(fade), 'label text inside a lit relationship is not faded');
  }));
  const dark = [...svg.querySelectorAll('g.edgeLabel:not(.mmd-hit)')];
  assert.ok(dark.length && dark.every((g) => g.matches(fade)), 'the other relationships still fade');
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

// A right click answers the same question one hop wider: this table's
// relations, and the relations of those. Left click narrows it back.
test('a right click lights two hops; a left click narrows it back', () => {
  const { p, svg } = diagram('er');
  const wrap = p.content.querySelector('.mermaid-wrapper');
  const f = focusLib.create([svg]);
  focusLib.bindClicks(wrap, f);
  const W = p.window;
  const order = f.graph.nodes.find((n) => n.name === 'ORDER');
  const target = order.el.querySelector('*') || svg;
  const at = (type, opts) => target.dispatchEvent(new W.MouseEvent(type,
    Object.assign({ bubbles: true, cancelable: true, clientX: 10, clientY: 10 }, opts)));

  at('mousedown', { button: 2 });
  assert.strictEqual(at('contextmenu', { button: 2 }), false, 'the browser menu is suppressed on a table');
  assert.ok(f.key.includes('ORDER'));
  assert.strictEqual(f.reach, 2);
  assert.deepStrictEqual(lit(svg), ['CUSTOMER', 'LINE_ITEM', 'ORDER', 'PRODUCT']);
  assert.strictEqual(svg.querySelectorAll('path[data-edge].mmd-hit').length, 3);
  assert.strictEqual(svg.getAttribute('data-mmd-hops'), '2');

  // A left click on the same table steps back to its direct relations; the
  // same table pressed that far clears.
  at('mousedown', { button: 0 });
  at('click', { button: 0 });
  assert.strictEqual(f.reach, 1);
  assert.deepStrictEqual(lit(svg), ['CUSTOMER', 'LINE_ITEM', 'ORDER']);
  at('mousedown', { button: 0 });
  at('click', { button: 0 });
  assert.strictEqual(f.key, null);

  // Off a table the event is the host's again: no focus, no suppression.
  f.set(order.key, 2);
  at('mousedown', { button: 2 });
  assert.strictEqual(svg.dispatchEvent(new W.MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 })), true);
  assert.strictEqual(f.reach, 2, 'a right click on the background leaves the focus alone');

  // macOS turns Ctrl+left click into the same event; that is the peek
  // modifier, and must not widen the focus behind the click handler's back.
  at('mousedown', { button: 0, ctrlKey: true });
  assert.strictEqual(at('contextmenu', { button: 0, ctrlKey: true }), true);
  assert.strictEqual(f.reach, 2);
});

test('a copy made mid-focus keeps the reach it was made at', () => {
  const { svg } = diagram('er');
  const f = focusLib.create([svg]);
  const order = f.graph.nodes.find((n) => n.name === 'ORDER');
  f.set(order.key, 2);
  assert.strictEqual(focusLib.create([svg.cloneNode(true)]).reach, 2);
  f.set(f.graph.nodes.find((n) => n.name === 'LINE_ITEM').key);
  assert.strictEqual(focusLib.create([svg.cloneNode(true)]).reach, 1, 'a plain set goes back to one hop');
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
