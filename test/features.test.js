'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { makePage } = require('./helpers/dom');

const MdEditor = require('../src/index');
MdEditor.configure({ marked: require('marked') });
const { collapse, outline, outlineFold } = MdEditor.features;

const SECTIONED = '## One\n\ntext one\n\n## Two\n\ntext two\n\n### Two A\n\nnested\n';

async function withDoc(md, opts) {
  const p = makePage();
  await MdEditor.mount(p.content, md, Object.assign({ transforms: [] }, opts));
  return p;
}

/* ---------- section collapse ---------- */

test('a toggle is added per foldable h2, and none for an empty section', async () => {
  const p = await withDoc('## Full\n\nbody\n\n## Empty\n');
  assert.strictEqual(collapse.bind(p.content), 1);
  const hs = [...p.content.querySelectorAll('h2')];
  assert.ok(hs[0].querySelector('.sec-toggle'), 'section with a body gets one');
  assert.strictEqual(hs[1].querySelector('.sec-toggle'), null, 'trailing empty section does not');
});

test('binding twice does not add a second toggle', async () => {
  const p = await withDoc(SECTIONED);
  const first = collapse.bind(p.content);
  assert.strictEqual(collapse.bind(p.content), 0, 'second pass adds nothing');
  assert.strictEqual(p.content.querySelectorAll('.sec-toggle').length, first);
});

test('the toggle glyph stays out of h2.textContent', async () => {
  const p = await withDoc(SECTIONED);
  collapse.bind(p.content);
  assert.strictEqual(p.content.querySelector('h2').textContent.trim(), 'One');
});

test('clicking a toggle hides that section only', async () => {
  const p = await withDoc(SECTIONED);
  collapse.bind(p.content);
  const [h1, h2] = [...p.content.querySelectorAll('h2')];
  h1.querySelector('.sec-toggle').click();
  assert.strictEqual(h1.nextElementSibling.hidden, true);
  assert.strictEqual(h1.classList.contains('sec-collapsed'), true);
  assert.strictEqual(h2.nextElementSibling.hidden, false, 'the other section is untouched');
  h1.querySelector('.sec-toggle').click();
  assert.strictEqual(h1.nextElementSibling.hidden, false, 'and it folds back open');
});

test('an unwrapped run folds only up to the next heading', async () => {
  const p = await withDoc('## A\n\na1\n\n## B\n\nb1\n', { postprocess: false });
  assert.strictEqual(p.content.querySelector('section'), null, 'precondition: no wrappers');
  collapse.bind(p.content);
  const [a, b] = [...p.content.querySelectorAll('h2')];
  a.querySelector('.sec-toggle').click();
  assert.strictEqual(a.nextElementSibling.hidden, true);
  assert.strictEqual(b.hidden, false, 'the next heading is not swallowed');
});

test('revealCollapsedTarget unfolds the section holding a hidden element', async () => {
  const p = await withDoc(SECTIONED);
  collapse.bind(p.content);
  const h = [...p.content.querySelectorAll('h2')][1];
  h.querySelector('.sec-toggle').click();
  const nested = p.content.querySelector('h3');
  assert.strictEqual(nested.hidden, true);
  collapse.revealCollapsedTarget(nested);
  assert.strictEqual(nested.hidden, false);
});

/* ---------- outline ---------- */

function makeOutline(p, extra) {
  return outline.createOutline(Object.assign({
    content: p.content, scroller: p.viewer, list: p.list, section: p.section, actions: p.actions,
  }, extra));
}

test('the outline lists h2 and h3 with the right classes, and ids the headings', async () => {
  const p = await withDoc(SECTIONED);
  assert.strictEqual(makeOutline(p).build(), 3);
  const links = [...p.list.querySelectorAll('a')];
  assert.deepStrictEqual(links.map((a) => a.textContent), ['One', 'Two', 'Two A']);
  assert.deepStrictEqual(links.map((a) => a.className), ['outline-h2', 'outline-h2', 'outline-h3']);
  assert.deepStrictEqual(links.map((a) => a.getAttribute('href')), ['#one', '#two', '#two-a']);
  assert.strictEqual(p.section.style.display, '');
});

test('a heading-less document keeps the panel open and says so', async () => {
  const p = await withDoc('just a paragraph\n');
  assert.strictEqual(makeOutline(p).build(), 0);
  assert.strictEqual(p.section.style.display, '', 'panel stays open');
  assert.strictEqual(p.list.querySelector('.outline-empty').textContent, 'No headings');
});

test('kvLabels lists "header:" lines when there are no headings', async () => {
  const p = await withDoc('Camera: 35mm\nLighting: soft\n', { transforms: ['good-view'] });
  assert.strictEqual(makeOutline(p, { kvLabels: true }).build(), 2);
  assert.deepStrictEqual([...p.list.querySelectorAll('a')].map((a) => a.textContent), ['Camera', 'Lighting']);
});

test('kvLabels stays off by default', async () => {
  const p = await withDoc('Camera: 35mm\n', { transforms: ['good-view'] });
  assert.strictEqual(makeOutline(p).build(), 0);
});

test('clear empties the list and hides the panel', async () => {
  const p = await withDoc(SECTIONED);
  const o = makeOutline(p);
  o.build();
  o.clear();
  assert.strictEqual(p.list.children.length, 0);
  assert.strictEqual(p.section.style.display, 'none');
});

test('duplicate heading texts get distinct ids so each row scrolls to its own', async () => {
  const p = await withDoc('## Same\n\na\n\n## Same\n\nb\n\n## Same\n\nc\n');
  makeOutline(p).build();
  const hrefs = [...p.list.querySelectorAll('a')].map((a) => a.getAttribute('href'));
  assert.deepStrictEqual(hrefs, ['#same', '#same-2', '#same-3']);
  const [h1, h2] = [...p.content.querySelectorAll('h2')];
  assert.strictEqual(p.document.getElementById('same'), h1);
  assert.strictEqual(p.document.getElementById('same-2'), h2, 'the second row resolves to the second heading');
});

test('a generated slug never collides with an id already on a heading', async () => {
  const p = await withDoc('## Same\n\na\n\n## Same\n\nb\n');
  const hs = [...p.content.querySelectorAll('h2')];
  hs[1].id = 'same';                      // author-supplied, claimed first
  makeOutline(p).build();
  assert.deepStrictEqual([...p.list.querySelectorAll('a')].map((a) => a.getAttribute('href')), ['#same-2', '#same']);
});

test('a heading of only punctuation falls back to a positional slug', async () => {
  const p = await withDoc('## !!!\n\na\n');
  makeOutline(p).build();
  assert.strictEqual(p.list.querySelector('a').getAttribute('href'), '#section-0');
});

/* ---------- outline folding ---------- */

test('an outline heading with nested rows gets a fold toggle; a flat one does not', async () => {
  const p = await withDoc(SECTIONED);
  makeOutline(p).build();
  const rows = [...p.list.children];
  assert.strictEqual(rows[0].querySelector('.outline-toggle'), null, 'One has nothing nested');
  assert.ok(rows[1].querySelector('.outline-toggle'), 'Two has Two A under it');
  rows[1].querySelector('.outline-toggle').click();
  assert.strictEqual(rows[2].hidden, true, 'the nested row hides');
});

test('the expand/collapse pair drives the outline AND the document at once', async () => {
  const p = await withDoc(SECTIONED);
  const o = makeOutline(p);
  o.build();
  collapse.bind(p.content);
  assert.ok(o.setAllFolds(false) >= 2, 'both halves reported changes');
  assert.strictEqual([...p.list.children][2].hidden, true, 'outline row folded');
  assert.strictEqual(p.content.querySelector('h2').classList.contains('sec-collapsed'), true, 'document section folded');
  o.setAllFolds(true);
  assert.strictEqual(p.content.querySelector('h2').classList.contains('sec-collapsed'), false);
});

test('the actions are disabled when nothing is foldable', async () => {
  const p = await withDoc('## Only\n\nbody\n');
  const o = makeOutline(p);
  o.build();
  assert.strictEqual(p.actions.box.classList.contains('outline-actions-off'), true);
  assert.strictEqual(p.actions.expand.disabled, true);
  collapse.bind(p.content);   // the document alone is now foldable
  o.updateActions();
  assert.strictEqual(p.actions.expand.disabled, false, 'either half is enough');
});

test('setAllFolds reports zero when every toggle is already where asked', async () => {
  const p = await withDoc(SECTIONED);
  const o = makeOutline(p);
  o.build();
  o.setAllFolds(false);
  assert.strictEqual(o.setAllFolds(false), 0);
});

test('the panel buttons are wired when actions are supplied', async () => {
  const p = await withDoc(SECTIONED);
  makeOutline(p).build();
  collapse.bind(p.content);
  p.actions.collapse.click();
  assert.strictEqual(p.content.querySelector('h2').classList.contains('sec-collapsed'), true);
  p.actions.expand.click();
  assert.strictEqual(p.content.querySelector('h2').classList.contains('sec-collapsed'), false);
});

test('outlineFold works on a host-built list of the same shape', async () => {
  const p = makePage();
  p.list.innerHTML = '<li><a class="outline-h2">Ch 1</a></li><li><a class="outline-h3">1.1</a></li>';
  assert.strictEqual(outlineFold.bindFolding(p.list), 1);
  p.list.querySelector('.outline-toggle').click();
  assert.strictEqual(p.list.children[1].hidden, true);
});

test('kvLabels accepts a function so it can track host state', async () => {
  const p = await withDoc('Camera: 35mm\n', { transforms: ['good-view'] });
  let on = false;
  const o = makeOutline(p, { kvLabels: () => on });
  assert.strictEqual(o.build(), 0, 'off: no rows');
  on = true;
  assert.strictEqual(o.build(), 1, 're-read on the next build, not frozen at construction');
});
