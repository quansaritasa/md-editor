'use strict';

const test = require('node:test');
const assert = require('node:assert');

const MdEditor = require('../src/index');
MdEditor.configure({ marked: require('marked') });

const html = (md) => MdEditor.build(md, { postprocess: false }).html;

test('a GitHub alert becomes a titled callout around its markdown', () => {
  const out = html('> [!WARNING]\n> Mind the **gap**.\n> - one\n\nafter\n');
  assert.match(out, /<div class="callout callout-warning">\s*<p class="callout-title">Warning<\/p>/);
  assert.match(out, /<strong>gap<\/strong>/);
  assert.match(out, /<li>one<\/li>/);
  assert.match(out, /<\/div>\s*<p>after<\/p>/);
});

test('a plain blockquote is left alone', () => {
  assert.match(html('> just a quote\n'), /<blockquote>/);
});

test('container spellings: VitePress, Docusaurus, remark attributes', () => {
  assert.match(html('::: tip Read this\nbody\n:::\n'), /callout-tip">\s*<p class="callout-title">Read this<\/p>\s*<p>body<\/p>/);
  assert.match(html(':::note[Heads up]\nbody\n:::\n'), /callout-note">\s*<p class="callout-title">Heads up<\/p>/);
  const out = html(':::block{type=chart title="Dense Worker"}\n```json\n{"a":1}\n```\n:::\n');
  assert.match(out, /<div class="callout callout-block" data-type="chart">/);
  assert.match(out, /callout-title">Dense Worker</);
  assert.match(out, /<code class="language-json">/);
});

test('containers nest, by depth or by a longer outer fence', () => {
  const same = html(':::note\nouter\n:::tip\ninner\n:::\nstill outer\n:::\n');
  assert.match(same, /callout-note[\s\S]*callout-tip[\s\S]*inner[\s\S]*<\/div>\s*<p>still outer<\/p>\s*<\/div>/);
  const longer = html('::::warning\n:::tip\nin\n:::\nout\n::::\n');
  assert.match(longer, /callout-warning[\s\S]*callout-tip[\s\S]*<\/div>\s*<p>out<\/p>\s*<\/div>/);
});

test('a ::: inside a code fence never closes the container', () => {
  const out = html(':::note\n```\n:::\n```\nafter code\n:::\n');
  assert.match(out, /<code>:::\n<\/code>[\s\S]*<p>after code<\/p>\s*<\/div>/);
});

test('an unclosed container stays text', () => {
  assert.doesNotMatch(html(':::note\nnever closed\n'), /callout/);
});

test('::: ends the paragraph above it without a blank line', () => {
  assert.match(html('para\n:::tip\nx\n:::\n'), /<p>para<\/p>\s*<div class="callout callout-tip">/);
});

test('details folds, and attributes are escaped', () => {
  assert.match(html('::: details Click\nhidden\n:::\n'), /<details class="callout callout-details"><summary class="callout-title">Click<\/summary>/);
  assert.match(html(':::x{a="<b>"}\ny\n:::\n'), /data-a="&lt;b&gt;"/);
});
