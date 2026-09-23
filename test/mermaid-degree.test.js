'use strict';

/* ER degree — a table's title band coloured by how many other tables it links
   to. The counting rules are the whole feature, so they are pinned here: a
   pair joined twice is one link, a self-relationship is one, and the threshold
   sits between four and five. The real mermaid 11 fixtures cover the ids; the
   hand-built SVGs cover the shapes a real schema has but the fixtures do not. */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { makePage } = require('./helpers/dom');

const degree = require('../src/features/mermaid-degree');

function mount(svgMarkup) {
  const p = makePage();
  p.content.classList.add('md-editor');
  p.content.innerHTML = '<div class="mermaid-wrapper"><div class="mermaid">' + svgMarkup + '</div></div>';
  return {
    wrap: p.content.querySelector('.mermaid-wrapper'),
    dia: p.content.querySelector('.mermaid'),
    svg: p.content.querySelector('svg'),
  };
}

const fixture = (name) => fs.readFileSync(path.join(__dirname, 'fixtures', 'mermaid-' + name + '.svg'), 'utf8');

// An ER SVG with only what mermaid-graph reads: node ids and edge ids.
function erSvg(names, pairs) {
  const key = (n) => 'entity-' + n + '-' + names.indexOf(n);
  const nodes = names.map((n) => '<g class="node" id="s-' + key(n) + '"><text>' + n + '</text></g>').join('');
  const edges = pairs.map((pair, i) =>
    '<path data-edge="true" data-id="id_' + key(pair[0]) + '_' + key(pair[1]) + '_' + i + '"></path>').join('');
  return '<svg id="s" class="erDiagram">' + nodes + edges + '</svg>';
}

const bucketOf = (svg, name) => {
  const el = [...svg.querySelectorAll('g.node')].find((n) => n.id.includes('-' + name + '-'));
  return degree.CLASSES.find((c) => el.classList.contains(c)) + '/' + el.getAttribute('data-mmd-degree');
};

test('a real ER diagram: every table is tagged with its partner count', () => {
  const { svg } = mount(fixture('er'));
  const counts = degree.paint(svg);
  // AUDIT_LOG is drawn but joined to nothing; ORDER sits between CUSTOMER and LINE_ITEM.
  assert.strictEqual(bucketOf(svg, 'AUDIT_LOG'), 'mmd-deg-0/0');
  assert.strictEqual(bucketOf(svg, 'CUSTOMER'), 'mmd-deg-low/1');
  assert.strictEqual(bucketOf(svg, 'ORDER'), 'mmd-deg-low/2');
  assert.deepStrictEqual(counts, { zero: 1, low: 4, high: 0 });
});

test('partner tables, not relationship lines: a pair joined twice counts once', () => {
  const { svg } = mount(erSvg(['A', 'B'], [['A', 'B'], ['A', 'B'], ['A', 'B']]));
  degree.paint(svg);
  assert.strictEqual(bucketOf(svg, 'A'), 'mmd-deg-low/1');
  assert.strictEqual(bucketOf(svg, 'B'), 'mmd-deg-low/1');
});

test('a self-relationship is one link, not none', () => {
  const { svg } = mount(erSvg(['A', 'B'], [['A', 'A']]));
  degree.paint(svg);
  assert.strictEqual(bucketOf(svg, 'A'), 'mmd-deg-low/1');
  assert.strictEqual(bucketOf(svg, 'B'), 'mmd-deg-0/0');
});

test('the hub threshold is five partners, and four is still ordinary', () => {
  const names = ['HUB', 'NEAR', 'P1', 'P2', 'P3', 'P4', 'P5'];
  // HUB reaches all five P tables; NEAR reaches four of them.
  const pairs = ['P1', 'P2', 'P3', 'P4', 'P5'].map((p) => ['HUB', p])
    .concat(['P1', 'P2', 'P3', 'P4'].map((p) => ['NEAR', p]));
  const { svg } = mount(erSvg(names, pairs));
  const counts = degree.paint(svg);
  assert.strictEqual(bucketOf(svg, 'HUB'), 'mmd-deg-high/5');
  assert.strictEqual(bucketOf(svg, 'NEAR'), 'mmd-deg-low/4');
  assert.strictEqual(counts.high, 1);
  assert.strictEqual(degree.HIGH, 5);
});

test('a table keeps one bucket class when the same SVG is painted again', () => {
  const { svg } = mount(erSvg(['A', 'B'], [['A', 'B']]));
  degree.paint(svg);
  degree.paint(svg);
  const el = svg.querySelector('g.node');
  assert.strictEqual(degree.CLASSES.filter((c) => el.classList.contains(c)).length, 1);
});

test('the legend is added for an ER diagram, once, and names the three buckets', () => {
  const { wrap, dia } = mount(fixture('er'));
  degree.decorate(wrap, dia);
  degree.decorate(wrap, dia);
  const legends = wrap.querySelectorAll('.mermaid-degree-legend');
  assert.strictEqual(legends.length, 1);
  assert.strictEqual(legends[0].textContent, 'Tables linked01–45+');
  assert.strictEqual(wrap.querySelectorAll('.mermaid-degree-key i').length, 3);
});

test('a diagram that is not ER gets no tags and no legend', () => {
  const { wrap, dia, svg } = mount(fixture('flow'));
  assert.deepStrictEqual(degree.decorate(wrap, dia), { zero: 0, low: 0, high: 0 });
  assert.strictEqual(wrap.querySelector('.mermaid-degree-legend'), null);
  assert.strictEqual(svg.querySelector('[data-mmd-degree]'), null);
});

test('a redraw into another diagram type takes the legend away with it', () => {
  const { wrap, dia } = mount(fixture('er'));
  degree.decorate(wrap, dia);
  dia.innerHTML = fixture('flow');
  degree.decorate(wrap, dia);
  assert.strictEqual(wrap.querySelector('.mermaid-degree-legend'), null);
});

test('every bucket has a title-band rule and a swatch rule in base.css', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'base.css'), 'utf8');
  degree.CLASSES.forEach((c) => {
    assert.ok(css.includes('g.node.' + c + ' > g.outer-path path[stroke="none"]'), c + ' paints a title band');
    assert.ok(css.includes('.mermaid-degree-key.' + c + ' i'), c + ' paints a legend swatch');
  });
});
