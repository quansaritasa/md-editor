'use strict';

/* ================= mount: document HTML into a live element =================
   Everything here is document-internal — link targets, pictures, diagrams,
   code blocks. The outline and section folding are NOT done here: they need
   panel elements only the host knows about, so the host wires them after. */

const { createAdapter } = require('./adapter');
const { build } = require('./build');
const mermaid = require('./features/mermaid');
const codeblocks = require('./features/codeblocks');

// One adapter round trip per picture and per link, all in flight at once: a
// doc-heavy page used to pay for them one after another.
async function resolveDocPaths(root, docPath, adapter) {
  const images = [...root.querySelectorAll('img')].map(async (img) => {
    const raw = img.getAttribute('src');
    if (raw) img.src = await adapter.resolveFile(docPath, raw);
  });
  const links = [...root.querySelectorAll('a')].map(async (a) => {
    const raw = a.getAttribute('href');
    if (!raw) return;
    if (/^https?:\/\//i.test(raw) || /^[a-z]+:/i.test(raw) || raw.startsWith('#')) {
      a.setAttribute('href', raw);
      return;
    }
    a.dataset.path = await adapter.resolvePath(docPath, raw);
    a.setAttribute('href', await adapter.resolveFile(docPath, raw));
  });
  await Promise.all([...images, ...links]);
}

// onNavigate receives the resolved path of an in-document link and decides what
// opening it means; without one, the adapter hands it to the OS. beforeOpen is
// for hosts that must tear something down first — a compare overlay that should
// close rather than navigate inside one of its panes. A web link never fires
// it: opening a browser is no reason to close what the user was reading.
function bindLinks(root, options) {
  const o = options || {};
  const adapter = o.adapter || createAdapter();
  const onNavigate = o.onNavigate || ((p) => adapter.openExternal(p));
  root.querySelectorAll('a').forEach((a) => {
    // Assignment, not addEventListener: re-binding a re-rendered document must
    // replace the old handler rather than stack a second one on top.
    a.onclick = (e) => {
      e.preventDefault();
      const href = a.getAttribute('href') || '';
      if (/^https?:\/\//i.test(href)) { adapter.openExternal(href); return; }
      const p = a.dataset.path;
      if (!p) return;
      if (o.beforeOpen) o.beforeOpen();
      onNavigate(p, a);
    };
  });
}

/* The class every theme rule is scoped to. Applied by mount() so a host is free
   to name its element anything: scoping to a literal id would force every host
   to adopt that id, and would make two mounted documents impossible. */
const ROOT_CLASS = 'md-editor';

const MOUNT_DEFAULTS = {
  docPath: '',        // resolves relative links and pictures; '' skips that pass
  links: true,
  mermaid: true,      // no-op when the mermaid peer is absent
  highlight: true,    // no-op when the highlight.js peer is absent
  codeBlocks: true,
  editableCode: false,
};

async function mount(root, md, options) {
  const o = Object.assign({}, MOUNT_DEFAULTS, options || {});
  const adapter = o.adapter || createAdapter();
  const doc = build(md, o);

  root.classList.add(ROOT_CLASS);
  // Good View is a rendering choice, so its CSS gate belongs on the document
  // rather than on a class the host has to remember to set on <body>.
  root.classList.toggle('good-view', (o.transforms || []).indexOf('good-view') !== -1);

  root.innerHTML = doc.html;
  if (o.docPath) await resolveDocPaths(root, o.docPath, adapter);
  if (o.links) bindLinks(root, o);
  // Diagrams first: mermaid REPLACES its <pre> with an <svg>, so highlighting
  // before it would decorate markup that is about to be thrown away.
  if (o.mermaid) await mermaid.render(root, o);
  if (o.highlight) mermaid.highlight(root);
  if (o.codeBlocks) codeblocks.bind(root, Object.assign({ adapter }, o));

  return doc;
}

module.exports = { mount, resolveDocPaths, bindLinks, MOUNT_DEFAULTS, ROOT_CLASS };
