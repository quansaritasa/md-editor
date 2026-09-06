'use strict';

/* ================= find inside the source editor =================
   The counterpart to searching rendered HTML: a textarea has no nodes to mark
   up, so matches are index ranges and a hit is shown by selecting it.

   Shaped to the same four calls a DOM search engine offers — search, focus,
   clear, count — so a host can hold one find bar over both and swap engines
   depending on whether it is editing. */

const CAP = 5000;

function createSourceFind(config) {
  const c = config || {};
  const ta = c.textarea;
  if (!ta) throw new Error('md-editor: createSourceFind needs a { textarea }.');
  const cap = c.cap || CAP;

  let ranges = [];
  let capped = false;

  return {
    // Case-insensitive plain-text search; a query is treated literally, so a
    // user typing "a.b" looks for "a.b" and not for any three characters.
    search(query) {
      ranges = [];
      capped = false;
      if (!query) return 0;
      const hay = ta.value.toLowerCase();
      const needle = String(query).toLowerCase();
      let idx = 0;
      while (idx < hay.length) {
        idx = hay.indexOf(needle, idx);
        if (idx === -1) break;
        if (ranges.length >= cap) { capped = true; break; }
        ranges.push([idx, idx + needle.length]);
        idx += needle.length;
      }
      return ranges.length;
    },

    focus(index) {
      if (index < 0 || index >= ranges.length) return false;
      const [start, end] = ranges[index];
      ta.focus();
      ta.setSelectionRange(start, end);
      // Selecting requires focus, which takes it away from whatever the user is
      // typing the query into. The host gets it back on the next frame, once
      // the browser has finished scrolling the selection into view.
      if (c.onAfterFocus) {
        const win = ta.ownerDocument.defaultView;
        const raf = (win && win.requestAnimationFrame) || ((f) => setTimeout(f, 0));
        raf(() => c.onAfterFocus());
      }
      return true;
    },

    clear() { ranges = []; capped = false; },
    count: () => ranges.length,
    // True when the search stopped at the cap, so a host can show "5000+"
    // rather than presenting a truncated total as if it were complete.
    capped: () => capped,
    ranges: () => ranges.slice(),
  };
}

module.exports = { createSourceFind, CAP };
