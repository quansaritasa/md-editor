'use strict';

/* A minimal host. It owns the toolbar, the panel and the layout; the library is
   handed a mount element, a scroller and a set of options, and nothing else.

   The mount element is called #reading-pane on purpose — nothing in the library
   or the themes depends on what a host names it. */

const pane = document.getElementById('reading-pane');
const viewer = document.getElementById('viewer');
document.getElementById('ver').textContent = 'v' + MdEditor.version;

const goodView = () => document.getElementById('gv').checked;

const theme = MdEditor.createTheme({
  root: pane,
  link: document.getElementById('doc-theme'),
  basePath: '../dist/themes/',
  storagePrefix: 'md-editor-demo-',
  onTheme: (name) => { document.getElementById('theme').value = name; },
  onDark: (on) => { document.getElementById('dark').checked = on; },
  onLayout: (s) => {
    document.getElementById('w').value = s.width;
    document.getElementById('f').value = s.font;
  },
});

const sel = document.getElementById('theme');
for (const t of theme.themes) sel.add(new Option(t, t));

const outline = MdEditor.features.outline.createOutline({
  content: pane, scroller: viewer,
  list: document.getElementById('outline-list'),
  section: document.getElementById('outline-section'),
  actions: {
    box: document.getElementById('outline-actions'),
    expand: document.getElementById('outline-expand'),
    collapse: document.getElementById('outline-collapse'),
  },
  // A function, not a boolean: with Good View on, a flat document's "header:"
  // lines are its only headings, and that toggles while the page is open.
  kvLabels: goodView,
});

// The three shapes a host distinguishes. This mapping is the host's business:
// the library never looks at a filename.
function optionsFor(kind, docPath) {
  const gv = goodView() ? ['good-view'] : [];
  if (kind === 'txt') {
    return { docPath, postprocess: false, transforms: ['txt-headings'].concat(gv) };
  }
  const extras = ['strip-hr', 'data-labels', 'qa-cards', 'example-boxes', 'field-tables'];
  if (kind === 'skill') {
    return { docPath, extractMeta: true, fallbackStem: 'demo', transforms: ['header'].concat(extras, gv) };
  }
  return { docPath, transforms: extras.concat(gv) };
}

async function show() {
  const kind = document.getElementById('doc').value;
  const md = window.DEMO_DOCS[kind];
  const opts = optionsFor(kind, location.href);
  opts.editableCode = true;
  opts.onNavigate = (p) => console.log('[demo] navigate ->', p);

  const doc = await MdEditor.mount(pane, md, opts);
  // The library only reports a title it was given or extracted; deriving one
  // from the first heading is the host's fallback.
  const title = doc.title || MdEditor.titleFromH1(md) || MdEditor.titleFromStem(kind);
  document.title = title + ' — md-editor demo';

  outline.build();
  // After the outline: it reads h2.textContent for its labels, and the toggle
  // must not be in the DOM while it does.
  if (goodView()) MdEditor.features.collapse.bind(pane);
  // ...and after that: the expand/collapse pair judges whether it has anything
  // to do only once both sets of toggles exist.
  outline.updateActions();
  // The new document may have a different wrapper, so the inset can differ.
  theme.refresh();
  console.log('[demo] rendered', kind, '| title:', JSON.stringify(title));
}

sel.addEventListener('change', (e) => theme.setTheme(e.target.value));
document.getElementById('dark').addEventListener('change', (e) => theme.setDark(e.target.checked));
document.getElementById('w').addEventListener('input', (e) => theme.setLayout({ width: e.target.value }));
document.getElementById('f').addEventListener('input', (e) => theme.setLayout({ font: e.target.value }));
document.getElementById('doc').addEventListener('change', show);
document.getElementById('gv').addEventListener('change', show);

theme.apply();
show();
