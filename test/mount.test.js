'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { makePage, stubClipboard, tick } = require('./helpers/dom');

const MdEditor = require('../src/index');
MdEditor.configure({ marked: require('marked') });

const DOC = '/docs/guide.md';

test('relative pictures and links resolve against the document', async () => {
  const p = makePage();
  await MdEditor.mount(p.content, '![x](img/a.png)\n\n[y](notes/b.md)\n', { docPath: DOC });
  assert.strictEqual(p.content.querySelector('img').getAttribute('src'), 'file:///docs/img/a.png');
  const a = p.content.querySelector('a');
  assert.strictEqual(a.getAttribute('href'), 'file:///docs/notes/b.md');
  assert.strictEqual(a.dataset.path, 'file:///docs/notes/b.md');
});

test('absolute, scheme and anchor hrefs are left alone and get no dataset.path', async () => {
  const p = makePage();
  await MdEditor.mount(p.content, '[a](https://x.test/p)\n\n[b](#frag)\n\n[c](mailto:z@x.test)\n', { docPath: DOC });
  const [a, b, c] = [...p.content.querySelectorAll('a')];
  assert.strictEqual(a.getAttribute('href'), 'https://x.test/p');
  assert.strictEqual(b.getAttribute('href'), '#frag');
  assert.strictEqual(c.getAttribute('href'), 'mailto:z@x.test');
  for (const el of [a, b, c]) assert.strictEqual(el.dataset.path, undefined);
});

test('a web link goes to the adapter, not to onNavigate', async () => {
  const p = makePage();
  const opened = []; const navigated = [];
  await MdEditor.mount(p.content, '[a](https://x.test/p)\n', {
    docPath: DOC,
    adapter: MdEditor.createAdapter({ openExternal: (u) => opened.push(u) }),
    onNavigate: (path) => navigated.push(path),
  });
  p.content.querySelector('a').click();
  assert.deepStrictEqual(opened, ['https://x.test/p']);
  assert.deepStrictEqual(navigated, []);
});

test('an in-document link calls onNavigate with the resolved path, after beforeOpen', async () => {
  const p = makePage();
  const order = [];
  await MdEditor.mount(p.content, '[y](notes/b.md)\n', {
    docPath: DOC,
    beforeOpen: () => order.push('beforeOpen'),
    onNavigate: (path) => order.push('navigate:' + path),
  });
  p.content.querySelector('a').click();
  assert.deepStrictEqual(order, ['beforeOpen', 'navigate:file:///docs/notes/b.md']);
});

test('re-mounting replaces the click handler instead of stacking a second one', async () => {
  const p = makePage();
  const hits = [];
  const opts = { docPath: DOC, onNavigate: () => hits.push(1) };
  await MdEditor.mount(p.content, '[y](b.md)\n', opts);
  MdEditor.bindLinks(p.content, opts);
  MdEditor.bindLinks(p.content, opts);
  p.content.querySelector('a').click();
  assert.strictEqual(hits.length, 1);
});

test('the default web adapter opens an in-document link itself', async () => {
  const p = makePage();
  const opened = [];
  p.window.open = (u) => opened.push(u);
  const adapter = MdEditor.createAdapter({ openExternal: (u) => opened.push(u) });
  await MdEditor.mount(p.content, '[y](b.md)\n', { docPath: DOC, adapter });
  p.content.querySelector('a').click();
  assert.deepStrictEqual(opened, ['file:///docs/b.md']);
});

test('Copy puts the block text on the clipboard, minus its trailing newline', async () => {
  const p = makePage();
  const clip = stubClipboard(p.window);
  await MdEditor.mount(p.content, '```js\nconst x = 1;\n```\n', {});
  const btn = p.content.querySelector('.code-copy-btn');
  btn.click();
  await tick();
  assert.deepStrictEqual(clip, ['const x = 1;']);
  assert.strictEqual(btn.textContent, 'Copied');
});

test('a rejected clipboard write reports failure rather than throwing', async () => {
  const p = makePage();
  stubClipboard(p.window, { fail: true });
  await MdEditor.mount(p.content, '```\nx\n```\n', {});
  const btn = p.content.querySelector('.code-copy-btn');
  btn.click();
  await tick();
  assert.strictEqual(btn.textContent, 'Copy failed');
});

test('Copy Full splices the sidecar prompt around the code', async () => {
  const p = makePage();
  const clip = stubClipboard(p.window);
  const adapter = MdEditor.createAdapter({ readInject: () => ({ pre: 'BEFORE\n', post: '\nAFTER' }) });
  await MdEditor.mount(p.content, '```\nbody\n```\n', { docPath: DOC, adapter });
  await tick();
  const full = p.content.querySelector('.code-full-btn');
  assert.strictEqual(full.style.display, '', 'button revealed when a sidecar exists');
  full.click();
  await tick();
  assert.deepStrictEqual(clip, ['BEFORE\n\nbody\n\nAFTER']);
});

test('Copy Full stays hidden when no sidecar is on disk', async () => {
  const p = makePage();
  stubClipboard(p.window);
  await MdEditor.mount(p.content, '```\nbody\n```\n', { docPath: DOC });
  await tick();
  assert.strictEqual(p.content.querySelector('.code-full-btn').style.display, 'none');
});

test('Wrap starts on and toggles', async () => {
  const p = makePage();
  await MdEditor.mount(p.content, '```\nx\n```\n', {});
  const btn = p.content.querySelector('.code-wrap-btn');
  const code = p.content.querySelector('pre code');
  assert.strictEqual(btn.textContent, 'Unwrap');
  assert.strictEqual(code.style.whiteSpace, 'pre-wrap');
  btn.click();
  assert.strictEqual(btn.textContent, 'Wrap');
  assert.strictEqual(code.style.whiteSpace, '');
});

test('code is only contenteditable when the host asks for it', async () => {
  const ro = makePage();
  await MdEditor.mount(ro.content, '```\nx\n```\n', {});
  assert.strictEqual(ro.content.querySelector('pre code').getAttribute('contenteditable'), null);
  const rw = makePage();
  await MdEditor.mount(rw.content, '```\nx\n```\n', { editableCode: true });
  assert.strictEqual(rw.content.querySelector('pre code').getAttribute('contenteditable'), 'true');
});

test('a mermaid fence survives untouched when the peer is absent', async () => {
  const p = makePage();
  await MdEditor.mount(p.content, '```mermaid\ngraph TD; A-->B;\n```\n', {});
  assert.strictEqual(p.content.querySelectorAll('.mermaid-wrapper').length, 0);
  assert.ok(p.content.querySelector('code.language-mermaid'), 'fence left in place');
  assert.ok(!p.content.querySelector('.code-copy-btn'), 'and gets no copy chrome');
});
