'use strict';

/* Fixtures were generated from Qview's renderer by tools/parity-check.js and
   are byte-for-byte what that renderer produced. Reproducing them proves the
   library did not drift from the app it was extracted from — with no dependency
   on Qview being installed. */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const MdEditor = require('../src/index');
MdEditor.configure({ marked: require('marked') });

const DIR = path.join(__dirname, 'fixtures');
const cases = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5));

assert.ok(cases.length > 0, 'no fixtures found — run tools/parity-check.js --write');

for (const id of cases) {
  test('fixture: ' + id, () => {
    const spec = JSON.parse(fs.readFileSync(path.join(DIR, id + '.json'), 'utf8'));
    const md = fs.readFileSync(path.join(DIR, id + '.md'), 'utf8');
    const expected = fs.readFileSync(path.join(DIR, id + '.html'), 'utf8');
    const out = MdEditor.build(md, spec.options);
    assert.strictEqual(out.title, spec.title, 'title');
    assert.strictEqual(out.html, expected, 'html');
  });
}
