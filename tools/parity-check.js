// Prove the library reproduces Qview's renderer byte for byte, then freeze the
// results as fixtures so the test suite no longer needs Qview present.
//
//   node tools/parity-check.js /path/to/qview [--write]
//
// Qview's renderer is a set of classic scripts that assume a browser. They are
// loaded into one vm context with just enough of a DOM stubbed to let their
// top-level code run; only the pure functions are actually called.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const QVIEW = process.argv[2] || path.join(__dirname, '..', '..', 'qview');
const WRITE = process.argv.includes('--write');
const FIXTURES = path.join(__dirname, '..', 'test', 'fixtures');

function loadQview() {
  const el = () => ({
    classList: { toggle() {}, add() {}, remove() {}, contains: () => false },
    addEventListener() {}, querySelectorAll: () => [], style: {}, dataset: {},
  });
  const sandbox = {
    console, setTimeout, clearTimeout,
    // Qview reads this to decide whether Good View is on; the harness drives it.
    localStorage: {
      _v: {},
      getItem(k) { return k in this._v ? this._v[k] : null; },
      setItem(k, v) { this._v[k] = String(v); },
    },
    document: { getElementById: () => null, querySelectorAll: () => [], body: el(), title: '' },
    mermaid: { initialize() {} },
    hljs: { highlightElement() {} },
    content: el(),
    window: { api: {} },
    compareActive: false,
    editing: false, currentPath: null, rawMarkdown: null,
    initMermaidZoom() {}, render() {},
  };
  sandbox.window.localStorage = sandbox.localStorage;
  vm.createContext(sandbox);

  const files = [
    'renderer/vendor/marked.min.js',
    'renderer/helpers.js', 'renderer/markdown.js', 'renderer/postprocess.js',
    'renderer/goodview.js', 'renderer/render.js',
  ];
  for (const f of files) {
    const p = path.join(QVIEW, f);
    if (!fs.existsSync(p)) throw new Error('missing ' + p + ' (run npm install in qview first)');
    vm.runInContext(fs.readFileSync(p, 'utf8'), sandbox, { filename: f });
  }
  return sandbox;
}

// The option mapping Qview will pass once it consumes the library. Keeping it
// here means the parity run tests the very mapping Phase 5 ships.
function optionsFor(fileName, md, goodView) {
  const stem = fileName.replace(/\.(md|txt)$/i, '');
  const gv = goodView ? ['good-view'] : [];
  const MdEditor = require('../src/index');
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
  const qv = loadQview();
  const MdEditor = require('../src/index');
  MdEditor.configure({ marked: qv.marked });

  const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus.json'), 'utf8'));
  let pass = 0; const failures = [];
  if (WRITE) fs.mkdirSync(FIXTURES, { recursive: true });

  for (const entry of corpus) {
    const src = entry.local ? path.join(__dirname, '..', entry.file) : path.join(QVIEW, entry.file);
    if (!fs.existsSync(src)) { console.log('  skip (missing): ' + entry.file); continue; }
    const md = fs.readFileSync(src, 'utf8');
    const name = entry.as || path.basename(src);

    for (const goodView of [false, true]) {
      qv.localStorage.setItem('qview-good-view', goodView ? '1' : '0');
      const expected = qv.buildDocHtml(md, name);
      const opts = optionsFor(name, md, goodView);
      const actual = MdEditor.build(md, opts);

      const label = entry.id + (goodView ? ' [good-view]' : '');
      const htmlOk = actual.html === expected.html;
      const titleOk = actual.title === expected.title;
      if (htmlOk && titleOk) { pass++; } else {
        failures.push({ label, htmlOk, titleOk, expected, actual });
      }
      if (WRITE) {
        const base = path.join(FIXTURES, entry.id + (goodView ? '.gv' : ''));
        fs.writeFileSync(base + '.md', md);
        fs.writeFileSync(base + '.json', JSON.stringify({ name, options: opts, title: expected.title }, null, 2) + '\n');
        fs.writeFileSync(base + '.html', expected.html);
      }
    }
  }

  console.log('\nparity: ' + pass + ' passed, ' + failures.length + ' failed');
  for (const f of failures) {
    console.log('\nFAIL ' + f.label + (f.titleOk ? '' : '  [title differs]'));
    if (!f.titleOk) console.log('  expected title: ' + JSON.stringify(f.expected.title) + '\n  actual title:   ' + JSON.stringify(f.actual.title));
    if (!f.htmlOk) {
      const e = f.expected.html, a = f.actual.html;
      let i = 0; while (i < e.length && i < a.length && e[i] === a[i]) i++;
      console.log('  html diverges at char ' + i + ' of ' + e.length + '/' + a.length);
      console.log('  expected: ' + JSON.stringify(e.slice(Math.max(0, i - 60), i + 100)));
      console.log('  actual:   ' + JSON.stringify(a.slice(Math.max(0, i - 60), i + 100)));
    }
  }
  if (WRITE && !failures.length) console.log('fixtures written to test/fixtures/');
  process.exit(failures.length ? 1 : 0);
}

main();
