'use strict';

/* ================= outline folding =================
   Fold the sub-entries under an outline heading. It runs over the FINISHED
   list, so any builder gets it from one implementation as long as the shape
   matches: one <li> per row, a.outline-h2 for a heading and a.outline-h3 for
   anything nested under it. A host with a second source of rows — a book's
   table of contents, say — reuses this by producing that same shape.

   This folds the PANEL only. The document keeps its own folding, so a crowded
   outline can be tidied without hiding what is being read. */

function bindFolding(list) {
  if (!list) return 0;
  const doc = list.ownerDocument;
  const rows = Array.from(list.children);
  let n = 0;
  rows.forEach((li, i) => {
    if (!li.querySelector('a.outline-h2')) return;
    const kids = [];
    for (let j = i + 1; j < rows.length; j++) {
      if (rows[j].querySelector('a.outline-h2')) break; // the next heading ends this group
      kids.push(rows[j]);
    }
    if (!kids.length) return;  // nothing nested under it — no toggle
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'outline-toggle';
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Collapse sub-headings');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Collapse sub-headings' : 'Expand sub-headings');
      for (const k of kids) k.hidden = !open;
    });
    li.classList.add('outline-parent');
    li.insertBefore(btn, li.firstChild);
    n++;
  });
  return n;
}

// Driven by clicking the existing toggles rather than by hiding rows directly:
// each toggle's handler owns which elements belong to its heading, and
// re-deriving that here is exactly how the two would drift apart.
function clickToggles(scope, sel, open) {
  if (!scope) return 0;
  let n = 0;
  for (const btn of scope.querySelectorAll(sel)) {
    if ((btn.getAttribute('aria-expanded') === 'true') === open) continue; // already there
    btn.click();
    n++;
  }
  return n;
}

// Folds BOTH halves at once: the outline's heading groups and the document's
// own sections. Folding only the panel leaves the document untouched behind it,
// which is not what "collapse all headings" means. Returns how many toggles
// actually changed, so a caller can tell "nothing to do" from "did nothing".
function setAllFolds(els, open) {
  return clickToggles(els.list, '.outline-toggle', open)
    + clickToggles(els.content, '.sec-toggle', open);
}

// The controls stay on the title row for every document. Hiding them when
// nothing was foldable sounded tidy and read as "the feature is missing" — most
// documents are flat, so most of the time they simply were not there. Disabled
// and dimmed instead: still visible, still obviously part of the panel, and
// honest about having nothing to do.
function updateActions(els) {
  const box = els.box;
  if (!box) return false;
  // Either half being foldable is enough: a flat document can still have
  // sections to collapse with nothing nested in the outline.
  const any = !!((els.list && els.list.querySelector('.outline-toggle'))
    || (els.content && els.content.querySelector('.sec-toggle')));
  box.classList.toggle('outline-actions-off', !any);
  for (const b of box.querySelectorAll('button')) b.disabled = !any;
  return any;
}

// The title row sits above the list, so a click here must not also count as
// clicking whatever heading is underneath.
function bindActions(els) {
  const stop = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); fn(); };
  if (els.expand) els.expand.addEventListener('click', stop(() => setAllFolds(els, true)));
  if (els.collapse) els.collapse.addEventListener('click', stop(() => setAllFolds(els, false)));
}

module.exports = { bindFolding, setAllFolds, updateActions, bindActions, clickToggles };
