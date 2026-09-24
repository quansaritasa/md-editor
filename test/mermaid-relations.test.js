'use strict';

/* The ER relations panel — keys and relationships of a focused table.
   Its own file: configure() installs a mermaid stand-in at module level, and
   node --test gives each file its own process. The stand-in's db is shaped
   exactly like mermaid 11's erDb (entity ids, crosswise cardA/cardB), and its
   ids match the real SVG in test/fixtures/mermaid-er.svg. */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { makePage } = require('./helpers/dom');

const MdEditor = require('../src/index');
const model = require('../src/features/mermaid-er-model');
const { openFullscreen } = require('../src/features/mermaid-fullscreen');

const attr = (type, name, keys, comment) => ({ type, name, keys: keys || [], comment: comment || '' });
const ENTITIES = [
  ['CUSTOMER', [attr('int', 'id', ['PK'])]],
  ['ORDER', [attr('int', 'id', ['PK']), attr('int', 'customer_id', ['FK'], 'who ordered')]],
  ['LINE_ITEM', [attr('int', 'order_id', ['PK', 'FK']), attr('int', 'product_id', ['PK', 'FK'])]],
  ['PRODUCT', []],
  ['AUDIT_LOG', []],
];
const rel = (a, b, role, cardA, cardB, relType) => ({
  entityA: 'entity-' + a, roleA: role, entityB: 'entity-' + b,
  relSpec: { cardA, cardB, relType: relType || 'IDENTIFYING' },
});
function fakeDb() {
  const entities = new Map();
  ENTITIES.forEach(([name, attributes], i) => entities.set(name, { id: 'entity-' + name + '-' + i, alias: '', attributes }));
  const idOf = (n) => n + '-' + ENTITIES.findIndex((e) => e[0] === n);
  return {
    getEntities: () => entities,
    getRelationships: () => [
      // CUSTOMER ||--o{ ORDER : places
      rel(idOf('CUSTOMER'), idOf('ORDER'), 'places', 'ZERO_OR_MORE', 'ONLY_ONE'),
      // ORDER ||--|{ LINE_ITEM : contains
      rel(idOf('ORDER'), idOf('LINE_ITEM'), 'contains', 'ONE_OR_MORE', 'ONLY_ONE'),
      // PRODUCT |o..o{ LINE_ITEM : ""
      rel(idOf('PRODUCT'), idOf('LINE_ITEM'), '', 'ZERO_OR_MORE', 'ZERO_OR_ONE', 'NON_IDENTIFYING'),
    ],
  };
}

test('model: keys per table, cardinality straightened to each end', () => {
  const m = model.fromDb(fakeDb());
  const orderT = m.tables.get('entity-ORDER-1');
  assert.deepStrictEqual(orderT.pks.map((c) => c.name), ['id']);
  assert.deepStrictEqual(orderT.fks.map((c) => c.name), ['customer_id']);
  const rels = model.relationsOf(m, 'entity-ORDER-1');
  const order = m.tables.get('entity-ORDER-1');
  assert.deepStrictEqual(rels.map((r) => [r.partner.name, r.mine.short, r.theirs.short]), [
    ['CUSTOMER', '0..*', '1'],
    ['LINE_ITEM', '1', '1..*'],
  ]);
  // The "one" side always reads first, whichever table is focused.
  assert.deepStrictEqual(rels.map((r) => model.describe(order, r)), [
    { text: 'One CUSTOMER – many ORDER', kind: 'one-to-many', cards: '1 : 0..*' },
    { text: 'One ORDER – many LINE_ITEM', kind: 'one-to-many', cards: '1 : 1..*' },
  ]);
  assert.strictEqual(model.relationsOf(m, 'entity-AUDIT_LOG-4').length, 0);
});

test('model: a self-relationship is listed once', () => {
  const db = { getEntities: () => new Map([['EMP', { id: 'entity-EMP-0', attributes: [] }]]),
    getRelationships: () => [rel('EMP-0', 'EMP-0', 'manages', 'ZERO_OR_MORE', 'ONLY_ONE')] };
  assert.strictEqual(model.relationsOf(model.fromDb(db), 'entity-EMP-0').length, 1);
});

test('model: null without mermaid parse support', async () => {
  assert.strictEqual(await model.load(''), null);
});

function fullscreen() {
  const p = makePage();
  MdEditor.configure({ marked: require('marked'), mermaid: {
    initialize() {},
    mermaidAPI: { async getDiagramFromText() { return { db: fakeDb() }; } },
  } });
  p.content.classList.add('md-editor');
  p.content.innerHTML = '<div class="mermaid-wrapper"><div class="mermaid" data-mermaid-src="erDiagram">'
    + fs.readFileSync(path.join(__dirname, 'fixtures', 'mermaid-er.svg'), 'utf8') + '</div></div>';
  const f = openFullscreen(p.content.querySelector('.mermaid'), p.content);
  return { p, f, panel: p.content.querySelector('.mermaid-relations') };
}
const text = (panel, sel) => [...panel.querySelectorAll(sel)].map((e) => e.textContent);

test('fullscreen ER: panel follows the focus and lists keys and relationships', async () => {
  const { f, panel } = fullscreen();
  assert.ok(await f.relations.ready, 'source parsed');
  assert.ok(panel.hidden, 'hidden until a table is focused');
  f.focus.set('entity-ORDER-1');
  assert.ok(!panel.hidden);
  assert.strictEqual(panel.querySelector('.mermaid-relations-name').textContent, 'ORDER');
  assert.deepStrictEqual(text(panel, ':scope > .mermaid-relations-keys .mermaid-relations-cols'), ['id', 'customer_id']);
  assert.deepStrictEqual(text(panel, '.mermaid-relations-partner'), ['CUSTOMER', 'LINE_ITEM']);
  assert.deepStrictEqual(text(panel, '.mermaid-relations-label'), ['places', 'contains']);
  assert.deepStrictEqual(text(panel, '.mermaid-relations-says'), ['One CUSTOMER – many ORDER', 'One ORDER – many LINE_ITEM']);
  assert.ok(text(panel, '.mermaid-relations-kind')[0].startsWith('one-to-many · 1 : 0..*'));
  // LINE_ITEM's composite key shows as both PK and FK columns.
  const li = panel.querySelectorAll('.mermaid-relations-item')[1];
  assert.deepStrictEqual(text(li, '.mermaid-relations-cols'), ['order_id, product_id', 'order_id, product_id']);
  f.focus.clear();
  assert.ok(panel.hidden);
});

test('fullscreen ER: clicking a partner only pans; × clears; close removes the panel', async () => {
  const { p, f, panel } = fullscreen();
  await f.relations.ready;
  f.focus.set('entity-ORDER-1');
  const s0 = f.view.get().s;
  panel.querySelector('.mermaid-relations-partner').click();
  assert.strictEqual(f.focus.key, 'entity-ORDER-1', 'selection kept');
  assert.strictEqual(f.view.get().s, s0, 'zoom kept');
  assert.ok(!panel.hidden, 'panel kept');
  assert.strictEqual(panel.querySelector('.mermaid-relations-name').textContent, 'ORDER');
  // The partner glows in its own colour, in the fullscreen copy and the minimap alike.
  const peeks = () => [...p.content.querySelectorAll('g.node.mmd-peek')].map((n) => n.id.replace(/^.*entity-/, ''));
  assert.ok(peeks().length >= 1 && peeks().every((k) => k === 'CUSTOMER-0'), 'only CUSTOMER peeked');
  assert.ok(panel.querySelector('.mermaid-relations-item').classList.contains('is-peek'));
  assert.ok(p.content.querySelector('g.node.mmd-hit-root[id$="entity-ORDER-1"]'), 'focused table keeps its glow');
  // The table's own name pans back and drops the partner's glow.
  panel.querySelector('.mermaid-relations-name').click();
  assert.strictEqual(f.focus.key, 'entity-ORDER-1');
  assert.deepStrictEqual(peeks(), []);
  assert.strictEqual(panel.querySelectorAll('.is-peek').length, 0);
  panel.querySelector('.mermaid-relations-close').click();
  assert.strictEqual(f.focus.key, null);
  f.close();
  assert.strictEqual(p.content.querySelector('.mermaid-relations'), null);
});

test('osFullscreen: fits on entry, closes once on exit, no-op without the API', async () => {
  const { osFullscreen } = require('../src/features/mermaid-ui');
  const { document: doc } = makePage();
  const none = doc.createElement('div');
  assert.strictEqual(typeof osFullscreen(none, () => {}, () => {}), 'function');
  const el = doc.createElement('div');
  let fs = null;
  Object.defineProperty(doc, 'fullscreenElement', { get: () => fs, configurable: true });
  el.requestFullscreen = async () => { fs = el; doc.dispatchEvent(new doc.defaultView.Event('fullscreenchange')); };
  const seen = [];
  osFullscreen(el, () => seen.push('enter'), () => seen.push('exit'));
  await new Promise((r) => setTimeout(r, 0));
  fs = null;
  doc.dispatchEvent(new doc.defaultView.Event('fullscreenchange'));
  doc.dispatchEvent(new doc.defaultView.Event('fullscreenchange'));
  assert.deepStrictEqual(seen, ['enter', 'exit']);
});

// A view at scale s over a W×H canvas, with boxes given in diagram coordinates.
function fakeView(s, W, H, boxes) {
  const v = { x: 0, y: 0 };
  return { v, get: () => ({ x: v.x, y: v.y, s, W, H }), boxOf: (el) => boxes[el], pan(dx, dy) { v.x += dx; v.y += dy; } };
}
const onCanvas = (view, b) => ({ l: view.v.x + b.l * 2, r: view.v.x + b.r * 2, t: view.v.y + b.t * 2, b: view.v.y + b.b * 2 });

test('frame: a pair that fits is centred right of the panel, zoom untouched', () => {
  const { frame } = require('../src/features/mermaid-relations');
  const boxes = { A: { l: 0, t: 0, r: 100, b: 50 }, P: { l: 300, t: 200, r: 400, b: 250 } };
  const view = fakeView(2, 1600, 900, boxes);
  frame(view, { hidden: false, offsetLeft: 16, offsetWidth: 300 }, 'A', 'P');
  const a = onCanvas(view, boxes.A), p = onCanvas(view, boxes.P);
  assert.ok(a.l >= 340 && p.r <= 1576 && a.t >= 24 && p.b <= 876, 'both inside the free area');
  assert.strictEqual(Math.round((a.l + p.r) / 2), Math.round((340 + 1576) / 2), 'pair centred across it');
});

test('frame: a pair too far apart keeps the partner whole', () => {
  const { frame } = require('../src/features/mermaid-relations');
  const boxes = { A: { l: 0, t: 0, r: 100, b: 50 }, P: { l: 2000, t: 0, r: 2100, b: 50 } };
  const view = fakeView(2, 1600, 900, boxes);
  frame(view, { hidden: true }, 'A', 'P');
  const p = onCanvas(view, boxes.P);
  assert.ok(p.l >= 24 && p.r <= 1576, 'partner fully visible');
  assert.strictEqual(p.r, 1576, 'pushed only as far as needed, towards the focused table');
});
