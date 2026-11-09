(function () {
'use strict';
/* The colour picker, a popup opened under a colour chip.

   It is the vendored color-picker in `popover` mode: one slot, full size (palettes shown), closed until a
   caller `open()`s it on an anchor. It knows nothing about fields — a caller
   `point()`s it at a colour with a label and a callback, and every edit the
   user makes after that goes back through the callback. Pointing it somewhere
   else must not read as an edit, which is what `quiet` is for: `setColors`
   fires `onChange` too. */

function createPicker() {
  let take = null;
  let quiet = false;

  const cp = new ColorPicker({
    mode: 'popover',
    initialColors: { color: '#000000' },
    onChange: (colors) => { if (!quiet && take) take(colors.color); },
  });

  // The picker's own reset goes back to its construction colour, which means
  // nothing here: the field's initial colour is the theme's, i.e. no override.
  // So the click is taken before the library sees it and handed to the caller.
  let undo = null;
  const title = cp.root.querySelector('h2');
  cp.root.querySelector('.cp-reset-btn').addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    if (undo) undo();
  }, true);

  return {
    // Show `hex` for the field called `label`; later edits call `cb(hex)`,
    // and the reset button calls `reset()`.
    point(label, hex, cb, reset) {
      undo = reset || null;
      take = null;
      title.textContent = 'Colour · ' + label;
      quiet = true;
      if (hex) cp.setColors({ color: hex });
      quiet = false;
      take = cb;
    },
    // Show the popup under `anchor`; it closes itself on Esc or an outside click.
    open(anchor) { cp.open(anchor); },
    setDark(dark) {
      cp.root.dataset.theme = dark ? 'dark' : 'light';
    },
  };
}

if (typeof module === 'object' && module.exports) module.exports = { createPicker };
else window.TE_PICKER = { createPicker };
})();
