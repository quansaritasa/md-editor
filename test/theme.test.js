'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { makePage } = require('./helpers/dom');

const MdEditor = require('../src/index');
MdEditor.configure({ marked: require('marked') });

function setup(page, extra) {
  const link = page.document.createElement('link');
  link.rel = 'stylesheet';
  link.id = 'doc-theme';
  page.document.head.appendChild(link);
  const t = MdEditor.createTheme(Object.assign({
    root: page.content, link, basePath: 'themes/', storagePrefix: 'test-',
  }, extra));
  return { t, link };
}

// An origin jsdom will grant localStorage on; file:// is opaque and throws.
const STORAGE_ORIGIN = 'http://host.test/docs/';

const layoutCss = (page) => {
  const el = page.document.getElementById('md-editor-layout');
  return el ? el.textContent : '';
};

test('mount applies the theme scope class to whatever element it is given', async () => {
  const p = makePage();
  const el = p.document.createElement('div');
  p.document.body.appendChild(el);
  await MdEditor.mount(el, '## H\n\nx\n', {});
  assert.ok(el.classList.contains('md-editor'), 'no id, no class of its own — still scoped');
});

test('the good-view class tracks the transform, not a host body class', async () => {
  const p = makePage();
  await MdEditor.mount(p.content, 'A: 1\n', { transforms: ['good-view'] });
  assert.strictEqual(p.content.classList.contains('good-view'), true);
  await MdEditor.mount(p.content, 'A: 1\n', { transforms: [] });
  assert.strictEqual(p.content.classList.contains('good-view'), false, 'and clears again');
});

test('setTheme rewrites the link href and rejects an unknown name', async () => {
  const p = makePage();
  const { t, link } = setup(p);
  t.setTheme('glass');
  assert.strictEqual(link.getAttribute('href'), 'themes/glass.css');
  assert.strictEqual(t.setTheme('nope'), 'card', 'falls back to the default');
  assert.strictEqual(link.getAttribute('href'), 'themes/card.css');
});

test('dark toggles a root class and reports the new state', async () => {
  const p = makePage();
  const { t } = setup(p);
  assert.strictEqual(t.toggleDark(), true);
  assert.strictEqual(p.document.documentElement.classList.contains('dark'), true);
  assert.strictEqual(t.toggleDark(), false);
  assert.strictEqual(p.document.documentElement.classList.contains('dark'), false);
});

test('the layout rule targets the element id when it has one', async () => {
  const p = makePage();
  const { t } = setup(p);
  t.setLayout({ font: 19 });
  assert.match(layoutCss(p), /#content \{[^}]*font-size: 19px/);
});

test('an element with no id falls back to the scope class, never to "#"', async () => {
  const p = makePage();
  const el = p.document.createElement('div');
  p.document.body.appendChild(el);
  await MdEditor.mount(el, '## H\n\nx\n', {});
  MdEditor.createTheme({ root: el, storagePrefix: 'test-noid-' }).setLayout({ font: 18 });
  const css = layoutCss(p);
  assert.ok(!/(^|[^\w.#-])# \{/.test(css), 'no bare "#" selector: ' + css);
  assert.match(css, /\.md-editor\.md-editor \{[^}]*font-size: 18px/,
    'the class is doubled so layout outranks the theme rules it must override');
});

test('setLayout changes only the keys it is given', async () => {
  const p = makePage();
  const { t } = setup(p);
  const before = t.get();
  const after = t.setLayout({ font: 20 });
  assert.strictEqual(after.font, 20);
  assert.strictEqual(after.width, before.width);
  assert.strictEqual(after.code, before.code);
});

test('resetLayout returns to the configured defaults', async () => {
  const p = makePage();
  const { t } = setup(p);
  t.setLayout({ width: 700, font: 22, code: 11 });
  const r = t.resetLayout();
  assert.deepStrictEqual([r.width, r.font, r.code], [1000, 17, 15]);
});

test('state persists through the prefixed store and is read back on the next instance', async () => {
  const p = makePage(STORAGE_ORIGIN);
  const { t } = setup(p, { storagePrefix: 'persist-' });
  t.setTheme('modern');
  t.setDark(true);
  t.setLayout({ font: 21 });
  const again = MdEditor.createTheme({ root: p.content, storagePrefix: 'persist-' }).get();
  assert.strictEqual(again.theme, 'modern');
  assert.strictEqual(again.dark, true);
  assert.strictEqual(again.font, 21);
});

test('two prefixes do not read each other\'s state', async () => {
  const p = makePage(STORAGE_ORIGIN);
  MdEditor.createTheme({ root: p.content, storagePrefix: 'app-a-' }).setTheme('glass');
  const b = MdEditor.createTheme({ root: p.content, storagePrefix: 'app-b-' }).get();
  assert.strictEqual(b.theme, 'card', 'app-b keeps the default');
});

test('the layout is re-measured on load, not at the moment the href changes', async () => {
  const p = makePage();
  const { t, link } = setup(p);
  const calls = [];
  const t2 = MdEditor.createTheme({ root: p.content, link, basePath: 'themes/', storagePrefix: 'load-', onLayout: () => calls.push(1) });
  const n = calls.length;
  t2.setTheme('claude');
  assert.strictEqual(calls.length, n, 'nothing measured yet — the CSS has not loaded');
  link.onload();
  assert.strictEqual(calls.length, n + 1, 'measured once the theme is actually in effect');
});

test('storage that throws on access degrades to not persisting, and never throws out', async () => {
  const p = makePage();   // file:// — jsdom throws on localStorage access
  assert.throws(() => p.window.localStorage, /opaque origin/i, 'precondition: access throws');
  const t = MdEditor.createTheme({ root: p.content, storagePrefix: 'blocked-' });
  assert.strictEqual(t.setTheme('glass'), 'glass', 'still works in memory');
  assert.strictEqual(MdEditor.createTheme({ root: p.content, storagePrefix: 'blocked-' }).get().theme, 'card',
    'and simply does not come back');
});
