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

// The theme editor previews a real-world document instead of a fixture: Qview's
// README, cloned to demo/readme/ because a file:// page cannot fetch() a
// neighbour. Its pictures were copied to demo/docs/screenshots/ too, so the
// relative srcs the markdown carries resolve against the page that mounts it.
const readme = path.join(__dirname, 'readme', 'qview-readme.md');
const text = fs.readFileSync(readme, 'utf8');
fs.writeFileSync(path.join(__dirname, 'theme-editor-doc.js'),
  '// Generated from demo/readme/qview-readme.md by demo/build-docs.js — rerun it\n'
  + '// after re-cloning the README, do not hand-edit.\n'
  + 'window.TE_DOC = { name: ' + JSON.stringify('qview-readme.md') + ', text: ' + JSON.stringify(text) + ' };\n');
console.log('demo/theme-editor-doc.js written');
