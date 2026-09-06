// Regenerate demo/docs.js from test/corpus. Run after editing a corpus file.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const pick = { all: 'transforms-all.md', skill: 'skill-metablock.md', txt: 'kv-lines.txt' };
const out = {};
for (const [k, f] of Object.entries(pick)) out[k] = fs.readFileSync(path.join(ROOT, 'test/corpus', f), 'utf8');
fs.writeFileSync(path.join(__dirname, 'docs.js'),
  '// Generated from test/corpus by demo/build-docs.js — the samples are inlined\n'
  + '// because a file:// page cannot fetch() its neighbours.\n'
  + 'window.DEMO_DOCS = ' + JSON.stringify(out, null, 2) + ';\n');
console.log('demo/docs.js written');
