'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { makePage } = require('./helpers/dom');
const { beautify } = require('../src/features/beautify');

const MdEditor = require('../src/index');
MdEditor.configure({ marked: require('marked') });

const CASES = [
  ['json', '{"a":1,"body":"{\\n  \\"k\\": \\"v\\"\\n}"}', '{\n  "a": 1,\n  "body": "{ \'k\': \'v\' }"\n}'],
  ['xml', '<a x="1"><b>hi</b><c/><d><e>t</e></d></a>', '<a x="1">\n  <b>hi</b>\n  <c/>\n  <d>\n    <e>t</e>\n  </d>\n</a>'],
  ['html', '<div><br><script>var a=1;\n b()</script><p>x</p></div>', '<div>\n  <br>\n  <script>var a=1;\n b()</script>\n  <p>x</p>\n</div>'],
  ['yaml', 'a:   1\nl:\n    - n:   x\n      v: |\n          t1\n            t2\n      s:\n          k: v\n    - m: 1\n      z: 2',
    'a: 1\nl:\n  - n: x\n    v: |\n      t1\n        t2\n    s:\n      k: v\n  - m: 1\n    z: 2'],
  ['ini', '[s]\nhost=a\n\n\n  port  =  80\n[d]\nx=1', '[s]\nhost = a\n\nport = 80\n\n[d]\nx = 1'],
  ['conf', 'server {\nlisten 80;\n  location / {\n proxy x;\n}\n}', 'server {\n  listen 80;\n  location / {\n    proxy x;\n  }\n}'],
  ['css', 'a{color:red;margin:0 auto}', 'a {\n  color: red;\n  margin: 0 auto\n}'],
];

for (const [kind, src, want] of CASES) {
  test('beautify ' + kind, () => {
    const out = beautify(src, kind);
    assert.strictEqual(out, want);
    assert.strictEqual(beautify(out, kind), want, 'idempotent');
  });
}

test('beautify refuses invalid JSON and unknown kinds', () => {
  assert.strictEqual(beautify('{ nope', 'json'), null);
  assert.strictEqual(beautify('x', 'rust'), null);
});

test('Beautify button shows only where a formatter exists, and toggles back', async () => {
  const p = makePage();
  await MdEditor.mount(p.content, '```yaml\na:   1\n```\n\n```rust\nfn x(){}\n```\n\n```\nplain\n```\n', {});
  const [yml, rust, plain] = [...p.content.querySelectorAll('.md-code-beautify-btn')];
  assert.strictEqual(yml.style.display, '');
  assert.strictEqual(rust.style.display, 'none');
  assert.strictEqual(plain.style.display, 'none');
  const code = p.content.querySelector('pre code');
  assert.strictEqual(code.textContent.trim(), 'a: 1', 'beautified on mount');
  assert.strictEqual(yml.textContent, 'Original');
  yml.click();
  assert.strictEqual(code.textContent.trim(), 'a:   1');
  assert.strictEqual(yml.textContent, 'Beautify');
  yml.click();
  assert.strictEqual(code.textContent.trim(), 'a: 1');
});

test('an unlabelled fence that opens with { is sniffed as JSON', async () => {
  const p = makePage();
  await MdEditor.mount(p.content, '```\n{"a":1}\n```\n', {});
  assert.strictEqual(p.content.querySelector('.md-code-beautify-btn').style.display, '');
});
