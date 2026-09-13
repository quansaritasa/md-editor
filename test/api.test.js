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

/* ---------- data-labels ---------- */

test('a table cell holding "$&" is labelled without corrupting the row', () => {
  // A quoted $-interpolation is the everyday way this shows up: marked turns the
  // quote into &quot;, leaving a literal "$&" that a replacement STRING reads as
  // "splice the whole match back in here".
  const md = '| Rule | Title |\n|---|---|\n| BR-1 | StartsWith($"host") |\n';
  const out = MdEditor.build(md, { transforms: ['data-labels'] });
  assert.ok(out.html.includes('data-label="Title"'), 'the cell is labelled');
  assert.ok(out.html.includes('StartsWith($&quot;host&quot;)'), 'its text survives verbatim');
  assert.strictEqual((out.html.match(/<td>/g) || []).length, 0, 'no cell is left unlabelled');
  assert.strictEqual((out.html.match(/<\/tr>/g) || []).length, 2, 'the row count is unchanged');
});

// Labelling used to search the whole table for each row's own text, so a long
// table cost O(rows x table size) — a 1600-row one spent a second here. The
// budget is deliberately loose: the one-pass version runs in ~20ms, the
// quadratic one took 620ms, so only a return to quadratic can trip it.
test('a long table is labelled in one pass, not once per row', () => {
  let md = '| Rule | Status | Title |\n|---|---|---|\n';
  for (let i = 0; i < 3000; i++) {
    md += '| BR-' + i + ' | inferred | requires filePath.StartsWith($"\\{host}\") and a longer description |\n';
  }
  const t = Date.now();
  const out = MdEditor.build(md, { transforms: ['data-labels'] });
  const ms = Date.now() - t;
  assert.strictEqual((out.html.match(/<td>/g) || []).length, 0, 'every cell is labelled');
  assert.strictEqual((out.html.match(/data-label="Title"/g) || []).length, 3000, 'every row is labelled');
  assert.ok(ms < 250, 'labelling 3000 rows took ' + ms + 'ms — quadratic again?');
});
