'use strict';

/* The theme editor's logic, without a browser: the field schema and the CSS
   it generates. The page around it is DOM wiring and
   is verified by opening it; everything that can be wrong silently — a field
   with no target, a colour that formats differently in the preview and in the
   export — is here. */

const test = require('node:test');
const assert = require('node:assert');

const { GROUPS } = require('../demo/theme-fields');
const { toHex, buildCss } = require('../demo/theme-css');

const fields = () => GROUPS.flatMap((g) => g.fields.map((f) => ({ g, f })));
const byKey = (k) => fields().find((x) => x.f.k === k);

test('every field can be written somewhere, and every key is unique', () => {
  const keys = fields().map((x) => x.f.k);
  assert.strictEqual(new Set(keys).size, keys.length, 'duplicate field key: two controls, one state slot');
  for (const { g, f } of fields()) {
    assert.ok(f.label, f.k + ' has no label');
    assert.ok(f.kind === 'color' || f.kind === 'length', f.k + ' has an unknown kind');
    const writable = f.vars || f.prop || f.pair;
    assert.ok(writable, f.k + ' declares neither vars nor a property');
    if (f.kind === 'length') assert.ok(Number.isFinite(f.min) && Number.isFinite(f.max), f.k + ' has no range');
  }
  for (const g of GROUPS) assert.ok(typeof g.sel === 'string', g.id + ' has no selector');
});

test('toHex accepts what a browser and a person produce, and refuses the rest', () => {
  assert.strictEqual(toHex('#abc'), '#aabbcc');
  assert.strictEqual(toHex('#AABBCC'), '#aabbcc');
  assert.strictEqual(toHex('rgb(28, 35, 51)'), '#1c2333');
  // Opacity is kept as an 8-digit hex; an opaque colour stays 6 digits.
  assert.strictEqual(toHex('rgba(255, 0, 16, 0.5)'), '#ff001080');
  assert.strictEqual(toHex('rgba(255, 0, 16, 1)'), '#ff0010');
  assert.strictEqual(toHex('#11223344'), '#11223344');
  // Chromium serialises a resolved color-mix() this way; the themes' derived
  // tokens are mixes, so the panel cannot read them without this form.
  assert.strictEqual(toHex('color(srgb 0.798275 0.799373 0.802824)'), '#cccccd');
  assert.strictEqual(toHex('color-mix(in srgb, red 40%, blue)'), null);
  assert.strictEqual(toHex(''), null);
  assert.strictEqual(toHex(undefined), null);
});

test('a colour field with a token writes the token on the mount element', () => {
  const css = buildCss(GROUPS, { bg: '#fafafa' }, '#te-preview', '');
  assert.strictEqual(css, '#te-preview {\n  --bg: #fafafa;\n}');
});

test('a heading size writes a rule on that heading, not a token', () => {
  const css = buildCss(GROUPS, { h2Size: 30 }, '#te-preview', '');
  assert.strictEqual(css, '#te-preview h2 {\n  font-size: 30px;\n}');
});

test('a heading colour is a declaration, because themes derive it differently', () => {
  const css = buildCss(GROUPS, { h1Color: '#1C2333' }, '#te-preview', '');
  assert.strictEqual(css, '#te-preview h1 {\n  color: #1c2333;\n}');
});

test('padding-left and padding-right are written together', () => {
  const css = buildCss(GROUPS, { padX: 32 }, '#te-preview', '');
  assert.match(css, /padding-left: 32px;/);
  assert.match(css, /padding-right: 32px;/);
});

test('the body text size lands on the mount element, so em-sized tables follow it', () => {
  const css = buildCss(GROUPS, { pSize: 18 }, '#te-preview', '');
  assert.strictEqual(css, '#te-preview {\n  font-size: 18px;\n}');
});

test('fields of one element share a single rule block', () => {
  const css = buildCss(GROUPS, { h2Size: 28, h2MarginTop: 40, h2Color: '#333333' }, '#te-preview', '');
  const blocks = css.split('\n\n');
  assert.strictEqual(blocks.length, 1, 'two rules for one selector is a shorter file split in two');
  assert.match(blocks[0], /font-size: 28px;/);
  assert.match(blocks[0], /margin-top: 40px;/);
  assert.match(blocks[0], /color: #333333;/);
});

test('only touched fields are written — an export never freezes the theme', () => {
  const css = buildCss(GROUPS, { bg: '#ffffff' }, '#te-preview', '');
  assert.ok(!/--accent|--text|font-size/.test(css));
  assert.strictEqual(buildCss(GROUPS, {}, '#te-preview', ''), '');
  assert.strictEqual(buildCss(GROUPS, null, '#te-preview', ''), '');
});

test('an unusable value is skipped, not written out', () => {
  const css = buildCss(GROUPS, { bg: 'color-mix(in srgb, red 40%, blue)', h1Size: 'wide' }, '#te-preview', '');
  assert.strictEqual(css, '');
});

test('the dark export prefixes the compound selector, keeping it scoped', () => {
  const css = buildCss(GROUPS, { bg: '#221f1c', h1Color: '#ede8e3' }, '.md-editor', 'html.dark ');
  assert.match(css, /^html\.dark \.md-editor \{/);
  assert.match(css, /html\.dark \.md-editor h1 \{/);
  assert.ok(!/^\.md-editor /m.test(css), 'the dark block must not also style the light page');
});

test('preview and export are the same declarations under a different selector', () => {
  const over = { bg: '#123456', padX: 24, h3Size: 20, rowBg: '#eeeeee' };
  const strip = (css) => css.replace(/#te-preview|\.md-editor/g, '<root>');
  assert.strictEqual(strip(buildCss(GROUPS, over, '#te-preview', '')), strip(buildCss(GROUPS, over, '.md-editor', '')));
});

test('the fields the panel offers cover the groups the editor promised', () => {
  const ids = GROUPS.map((g) => g.id);
  for (const id of ['surface', 'layout', 'h1', 'h2', 'h3', 'body', 'code', 'table', 'link']) {
    assert.ok(ids.includes(id), 'missing group: ' + id);
  }
  assert.ok(byKey('linkColor').f.vars.includes('--link-ink'));
  assert.ok(byKey('codeBg').f.vars.includes('--code-bg'));
  assert.ok(byKey('tableBorder').f.vars.includes('--table-border'));
});
