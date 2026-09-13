// Regenerate test/fixtures from tools/corpus.json.
//
//   node tools/fixtures.js [--write] [/path/to/qview]
//
// Default lists the ids whose output would change and touches nothing; --write
// re-freezes them. Verification is NOT done here — test/build.test.js already
// rebuilds every fixture and asserts it byte for byte, so a second checker
// would only be a second thing to keep in step.
//
// This replaces tools/parity-check.js, which proved the library reproduced
// Qview's own renderer byte for byte. That renderer no longer exists: the
// migration deleted renderer/markdown.js, renderer/postprocess.js,
// renderer/goodview.js and renderer/render.js, and moved what remained under
// src/. There is nothing left to compare against, so the fixtures are now what
// they had already become in practice — frozen snapshots of THIS library,
// guarding against unintended drift.
//
// A deliberate change to the pipeline is therefore expected to change fixtures.
// Read the diff before committing it: that diff is the review.
'use strict';

const fs = require('fs');
const path = require('path');

const MdEditor = require('../src/index');
MdEditor.configure({ marked: require('marked') });

const WRITE = process.argv.includes('--write');
const QVIEW = process.argv.slice(2).find((a) => !a.startsWith('--'))
  || path.join(__dirname, '..', '..', 'qview');
const FIXTURES = path.join(__dirname, '..', 'test', 'fixtures');

// The option mapping Qview applies, kept here so regenerated fixtures describe
// the real host rather than the library's bare defaults. Mirrors
// renderer/md-glue.js mdOptionsFor().
function optionsFor(fileName, md, goodView) {
  const stem = fileName.replace(/\.(md|txt)$/i, '');
  const gv = goodView ? ['good-view'] : [];
  if (/\.txt$/i.test(fileName)) {
    return { postprocess: false, title: MdEditor.titleFromStem(stem), transforms: ['txt-headings'].concat(gv) };
  }
  const extras = ['strip-hr', 'data-labels', 'qa-cards', 'example-boxes', 'field-tables'];
  if (/SKILL\.md$/i.test(fileName)) {
    return { extractMeta: true, fallbackStem: stem, transforms: ['header'].concat(extras, gv) };
  }
  return {
    title: MdEditor.titleFromH1(md) || MdEditor.titleFromStem(stem),
    transforms: extras.concat(gv),
  };
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus.json'), 'utf8'));
  if (WRITE) fs.mkdirSync(FIXTURES, { recursive: true });

  const changed = [];
  const skipped = [];
  let same = 0;

  for (const entry of corpus) {
    const src = entry.local ? path.join(__dirname, '..', entry.file) : path.join(QVIEW, entry.file);
    if (!fs.existsSync(src)) { skipped.push(entry.id + '  (' + entry.file + ')'); continue; }
    const md = fs.readFileSync(src, 'utf8');
    const name = entry.as || path.basename(src);

    for (const goodView of [false, true]) {
      const id = entry.id + (goodView ? '.gv' : '');
      const opts = optionsFor(name, md, goodView);
      const built = MdEditor.build(md, opts);
      const base = path.join(FIXTURES, id);

      let before = null;
      try { before = fs.readFileSync(base + '.html', 'utf8'); } catch {}
      if (before === built.html) same++; else changed.push(id + (before === null ? '  (new)' : ''));

      if (WRITE) {
        fs.writeFileSync(base + '.md', md);
        fs.writeFileSync(base + '.json', JSON.stringify({ name, options: opts, title: built.title }, null, 2) + '\n');
        fs.writeFileSync(base + '.html', built.html);
      }
    }
  }

  if (skipped.length) {
    console.log('skipped ' + skipped.length + ' corpus entries whose source is missing');
    console.log('  (pass the path to a Qview checkout if these matter: node tools/fixtures.js /path/to/qview)');
    for (const s of skipped) console.log('  - ' + s);
    console.log('');
  }
  console.log(same + ' unchanged, ' + changed.length + ' would change');
  for (const c of changed) console.log('  * ' + c);
  if (changed.length && !WRITE) console.log('\nnothing written — re-run with --write to re-freeze, then read the diff');
  if (changed.length && WRITE) console.log('\nwritten to test/fixtures/ — read the diff before committing');
}

main();
