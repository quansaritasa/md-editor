'use strict';

const test = require('node:test');
const assert = require('node:assert');

const MdEditor = require('../src/index');
MdEditor.configure({ marked: require('marked') });

test('transforms are off by default', () => {
  const out = MdEditor.build('# Title\n\n---\n\n## S\n\ntext\n');
  assert.ok(!out.html.includes('class="header"'), 'no header card');
  assert.ok(out.html.includes('<hr>'), 'horizontal rules survive');
  assert.ok(out.html.includes('<section class="section">'), 'sections still wrap');
});

test('postprocess:false returns marked output untouched', () => {
  const out = MdEditor.build('## S\n\ntext\n', { postprocess: false });
  assert.ok(!out.html.includes('<section'), 'no sections');
});

test('an unknown transform is rejected rather than ignored', () => {
  assert.throws(() => MdEditor.build('x', { transforms: ['nope'] }), /unknown transform "nope"/);
});

test('empty and nullish input do not throw', () => {
  for (const v of ['', null, undefined]) {
    assert.strictEqual(typeof MdEditor.build(v).html, 'string');
  }
});

test('extractMeta falls back to the stem when no title is present', () => {
  const out = MdEditor.build('body only\n', { extractMeta: true, fallbackStem: 'my-shot-list' });
  assert.strictEqual(out.title, 'My Shot List');
});

test('frontmatter is read into meta and stripped from the body', () => {
  const out = MdEditor.build('---\nname: x\n---\n\nbody\n', { extractMeta: true, fallbackStem: 's' });
  assert.strictEqual(out.meta.name, 'x');
  assert.ok(!out.html.includes('name:'), 'frontmatter not rendered');
});

test('a missing marked fails with a named error, not a TypeError', () => {
  const fresh = require('vm').runInNewContext(
    require('fs').readFileSync(require('path').join(__dirname, '..', 'dist', 'md-editor.js'), 'utf8') + '; MdEditor',
    { console }
  );
  assert.throws(() => fresh.build('x'), /marked not found/);
});
