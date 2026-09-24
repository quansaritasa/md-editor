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
  const order = m.tables.get('entity-ORDER-1');
  assert.deepStrictEqual(order.pks.map((c) => c.name), ['id']);
  assert.deepStrictEqual(order.fks.map((c) => c.name), ['customer_id']);
  const rels = model.relationsOf(m, 'entity-ORDER-1');
  assert.deepStrictEqual(rels.map((r) => [r.partner.name, model.kind(r), r.mine.short, r.theirs.short]), [
    ['CUSTOMER', 'many-to-one', '0..*', '1'],
    ['LINE_ITEM', 'one-to-many', '1', '1..*'],
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
  assert.ok(text(panel, '.mermaid-relations-kind')[0].startsWith('many-to-one'));
  // LINE_ITEM's composite key shows as both PK and FK columns.
  const li = panel.querySelectorAll('.mermaid-relations-item')[1];
  assert.deepStrictEqual(text(li, '.mermaid-relations-cols'), ['order_id, product_id', 'order_id, product_id']);
  f.focus.clear();
  assert.ok(panel.hidden);
});

test('fullscreen ER: clicking a partner moves the focus; × clears it; close removes the panel', async () => {
  const { p, f, panel } = fullscreen();
  await f.relations.ready;
  f.focus.set('entity-ORDER-1');
  panel.querySelector('.mermaid-relations-partner').click();
  assert.strictEqual(f.focus.key, 'entity-CUSTOMER-0');
  assert.strictEqual(panel.querySelector('.mermaid-relations-name').textContent, 'CUSTOMER');
  assert.ok(text(panel, '.mermaid-relations-kind')[0].startsWith('one-to-many'));
  panel.querySelector('.mermaid-relations-close').click();
  assert.strictEqual(f.focus.key, null);
  f.close();
  assert.strictEqual(p.content.querySelector('.mermaid-relations'), null);
});
