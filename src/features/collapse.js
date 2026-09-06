'use strict';

/* ================= collapsible sections =================
   A +/− toggle left of every h2, so a long document folds down to its outline.
   Whether a document gets them is the host's call — this always binds when
   asked, and binding nothing is how a document keeps its plain appearance.

   Two document shapes have to work. Post-processed markdown puts each h2 chunk
   in <section class="section">, so a heading's range is its siblings inside
   that section. A document rendered without post-processing has no wrappers at
   all — its headings sit in one flat run — so there the range is "everything up
   to the next h2".

   Collapsing sets .hidden on the elements in that range. Nothing is moved or
   re-parented: a new container would sit outside the theme CSS, the find bar
   and the scroll memory, none of which asked for one. */

// The elements a heading's toggle hides, in document order.
function sectionRange(h) {
  const out = [];
  const parent = h.parentElement;
  const wrapped = !!(parent && parent.classList.contains('section'));
  for (let el = h.nextElementSibling; el; el = el.nextElementSibling) {
    if (!wrapped && el.tagName === 'H2') break; // flat run: the next heading ends this one
    out.push(el);
  }
  return out;
}

function setSectionOpen(h, range, open) {
  const btn = h.querySelector('.sec-toggle');
  if (btn) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Collapse section' : 'Expand section');
  }
  h.classList.toggle('sec-collapsed', !open);
  for (const el of range) el.hidden = !open;
}

// An outline click can target a heading inside a folded section. Unfold it
// rather than scrolling to something the user cannot see.
function revealCollapsedTarget(el) {
  if (!el || !el.hidden) return;
  const parent = el.parentElement;
  let h = null;
  if (parent && parent.classList.contains('section')) {
    h = parent.querySelector('h2');
  } else {
    for (let p = el.previousElementSibling; p; p = p.previousElementSibling) {
      if (p.tagName === 'H2') { h = p; break; }
    }
  }
  if (h) setSectionOpen(h, sectionRange(h), true);
}

// Returns how many toggles were added, so a caller can tell "nothing foldable"
// from "already bound".
function bind(root) {
  const doc = root.ownerDocument;
  let n = 0;
  for (const h of root.querySelectorAll('h2')) {
    if (h.querySelector('.sec-toggle')) continue; // already bound
    const range = sectionRange(h);
    if (!range.length) continue;                  // an empty section has nothing to fold
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'sec-toggle';
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Collapse section');
    // No text node on purpose — the glyph is a CSS ::before. A "−" character
    // here would land in h2.textContent, which the outline labels and the
    // browser's own find both read.
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setSectionOpen(h, range, btn.getAttribute('aria-expanded') !== 'true');
    });
    h.insertBefore(btn, h.firstChild);
    n++;
  }
  return n;
}

module.exports = { bind, sectionRange, setSectionOpen, revealCollapsedTarget };
