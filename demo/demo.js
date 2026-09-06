'use strict';

/* A minimal host. It owns the toolbar, the panel and the layout; the library is
   handed a mount element, a scroller and a set of options, and nothing else. */

const content = document.getElementById('content');
const viewer = document.getElementById('viewer');
document.getElementById('ver').textContent = 'v' + MdEditor.version;

// The library reads marked / hljs / mermaid off globals, so nothing to inject
// here — but a bundler-based host would call MdEditor.configure({...}).

const goodView = () => document.getElementById('gv').checked;

const outline = MdEditor.features.outline.createOutline({
  content, scroller: viewer,
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

  const doc = await MdEditor.mount(content, md, opts);
  // The library only reports a title it was given or extracted; deriving one
  // from the first heading is the host's fallback, as it is in Qview.
  const title = doc.title || MdEditor.titleFromH1(md) || MdEditor.titleFromStem(kind);
  document.title = title + ' — md-editor demo';

  outline.build();
  // After the outline: it reads h2.textContent for its labels, and the toggle
  // must not be in the DOM while it does.
  if (goodView()) MdEditor.features.collapse.bind(content);
  // ...and after that: the expand/collapse pair judges whether it has anything
  // to do only once both sets of toggles exist.
  outline.updateActions();
  console.log('[demo] rendered', kind, '| title:', JSON.stringify(doc.title));
}

document.getElementById('theme').addEventListener('change', (e) => {
  document.getElementById('doc-theme').setAttribute('href', '../dist/themes/' + e.target.value + '.css');
});
document.getElementById('dark').addEventListener('change', (e) => {
  document.documentElement.classList.toggle('dark', e.target.checked);
});
document.getElementById('doc').addEventListener('change', show);
document.getElementById('gv').addEventListener('change', show);

show();
