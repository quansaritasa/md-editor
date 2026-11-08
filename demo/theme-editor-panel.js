(function () {
'use strict';
/* The right panel: one row per attribute, grouped and collapsible.

   A row shows the value that is actually rendering — the author's override if
   there is one, otherwise the theme's own number, read from the preview. Only
   a field the author touches is written to the override map, which is what
   keeps an export to the changes instead of freezing a whole palette.

   The panel owns no state of its own: `over()` reads the page's override map
   and `onEdit` writes into it, so switching theme or light/dark is the page's
   move and this module just repaints. */

function createPanel(opts) {
  const groups = opts.groups;
  const rows = [];

  function paintChip(r, hex) {
    r.inner.style.background = hex || 'transparent';
    r.chip.title = hex || 'Pick a colour';
  }

  function mark(r) {
    const dirty = Object.prototype.hasOwnProperty.call(opts.over(), r.f.k);
    r.el.classList.toggle('dirty', dirty);
    const box = opts.box.querySelector('.te-group[data-group="' + r.g.id + '"]');
    if (!box) return;
    let n = 0;
    for (const f of r.g.fields) {
      if (Object.prototype.hasOwnProperty.call(opts.over(), f.k)) n++;
    }
    box.classList.toggle('dirty', n > 0);
    box.querySelector('.te-count').textContent = n ? n + ' changed' : '';
  }

  function edit(r, value) {
    opts.onEdit(r.f.k, value);
    mark(r);
  }

  function row(g, f) {
    const el = document.createElement('div');
    el.className = 'te-row';
    const lab = document.createElement('label');
    lab.textContent = f.label;
    lab.htmlFor = 'te-in-' + f.k;
    const ctl = document.createElement('div');
    ctl.className = 'te-ctl';
    el.append(lab, ctl);

    const r = { g, f, el };
    if (f.kind === 'color') {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'te-chip';
      const inner = document.createElement('span');
      chip.appendChild(inner);
      const text = document.createElement('input');
      text.type = 'text';
      text.spellcheck = false;
      text.id = 'te-in-' + f.k;
      // The picker hands back a hex; the text field takes one too, so a value
      // copied out of another theme can be pasted straight in.
      chip.addEventListener('click', () => opts.picker.open(chip, (hex) => {
        text.value = hex;
        paintChip(r, hex);
        edit(r, hex);
      }));
      text.addEventListener('input', () => {
        const hex = TE_CSS.toHex(text.value);
        if (hex) { paintChip(r, hex); edit(r, hex); }
      });
      text.addEventListener('blur', () => paint(r));
      ctl.append(chip, text);
      Object.assign(r, { chip, inner, text });
    } else {
      const range = document.createElement('input');
      range.type = 'range';
      range.min = f.min; range.max = f.max; range.step = f.step || 1;
      const num = document.createElement('input');
      num.type = 'number';
      num.id = 'te-in-' + f.k;
      num.min = f.min; num.max = f.max; num.step = f.step || 1;
      range.addEventListener('input', () => {
        num.value = range.value;
        edit(r, Number(range.value));
      });
      num.addEventListener('input', () => {
        if (num.value === '') return;
        range.value = num.value;
        edit(r, Number(num.value));
      });
      ctl.append(range, num);
      Object.assign(r, { range, num });
    }
    rows.push(r);
    return el;
  }

  function build() {
    for (const g of groups) {
      const d = document.createElement('details');
      d.className = 'te-group';
      d.dataset.group = g.id;
      d.open = g.id === 'surface' || g.id === 'layout';
      const s = document.createElement('summary');
      s.textContent = g.label;
      const c = document.createElement('span');
      c.className = 'te-count';
      s.appendChild(c);
      d.append(s);
      for (const f of g.fields) d.appendChild(row(g, f));
      opts.box.appendChild(d);
    }
  }

  function paint(r) {
    const stored = opts.over()[r.f.k];
    if (r.f.kind === 'color') {
      const hex = (stored != null && TE_CSS.toHex(stored)) || opts.reader.color(r.g, r.f);
      r.text.value = hex || '';
      paintChip(r, hex);
    } else {
      const n = stored != null ? Number(stored) : opts.reader.length(r.g, r.f);
      const v = Number.isFinite(n) ? Math.round(n) : '';
      r.num.value = v;
      r.range.value = v === '' ? r.range.min : v;
    }
    mark(r);
  }

  function prefill() {
    for (const r of rows) paint(r);
  }

  return { rows, build, prefill };
}

if (typeof module === 'object' && module.exports) module.exports = { createPanel };
else window.TE_PANEL = { createPanel };
})();
