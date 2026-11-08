(function () {
'use strict';
/* The colour picker: sixty swatches in one popover, opened from a field's chip
   and closed by picking, by Esc, or by a click anywhere else.

   It knows nothing about fields — a caller hands it `open(anchor, cb)` and gets
   the chosen hex back, which keeps the panel free to decide what a colour
   applies to. */

function createPicker(box, palette) {
  let take = null;
  const groups = new Map();

  for (const c of palette) {
    if (!groups.has(c.g)) {
      const h = document.createElement('h3');
      h.textContent = c.g;
      const grid = document.createElement('div');
      grid.className = 'te-swatch-grid';
      box.append(h, grid);
      groups.set(c.g, grid);
    }
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'te-swatch';
    b.style.background = c.h;
    b.title = c.n + ' · ' + c.h;      // the name is what makes a swatch findable
    b.dataset.hex = c.h;
    b.addEventListener('click', () => {
      box.hidden = true;
      if (take) take(c.h);
    });
    groups.get(c.g).appendChild(b);
  }

  document.addEventListener('mousedown', (e) => {
    if (!box.hidden && !box.contains(e.target) && !e.target.closest('.te-chip')) box.hidden = true;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') box.hidden = true;
  });

  // Below the chip, flipped above it when there is no room, and never off the
  // right edge of the window.
  function open(anchor, cb) {
    take = cb;
    box.hidden = false;
    const r = anchor.getBoundingClientRect();
    const pad = 8;
    const left = Math.max(pad, Math.min(r.left, window.innerWidth - box.offsetWidth - pad));
    const top = r.bottom + 6 + box.offsetHeight > window.innerHeight
      ? Math.max(pad, r.top - box.offsetHeight - 6)
      : r.bottom + 6;
    box.style.left = Math.round(left) + 'px';
    box.style.top = Math.round(top) + 'px';
  }

  return { open };
}

if (typeof module === 'object' && module.exports) module.exports = { createPicker };
else window.TE_PICKER = { createPicker };
})();
