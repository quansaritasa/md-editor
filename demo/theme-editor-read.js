(function () {
'use strict';
/* Reading a theme's OWN values, so the panel can show the numbers a theme
   actually ships instead of blanks the author has to guess at.

   A theme states some values as custom properties and others as plain
   declarations, and the property may be a color-mix() or a var() chain that
   only the browser can resolve — so nothing here parses CSS text. Tokens are
   handed to a throwaway element inside the preview, which inherits the
   theme's properties, and the computed colour is read back. */

function createReader(root) {
  // Inside the mount element, so inherited custom properties resolve here.
  function probe() {
    let el = document.getElementById('te-probe');
    if (!el) {
      el = document.createElement('span');
      el.id = 'te-probe';
      el.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden';
      root.appendChild(el);
    }
    return el;
  }

  function resolveHex(raw) {
    if (!raw) return '';
    const p = probe();
    p.style.color = '';
    p.style.color = raw;
    const hex = TE_CSS.toHex(getComputedStyle(p).color);
    p.style.color = '';
    return hex;
  }

  function targetOf(g, f) {
    const sel = f.sel !== undefined ? f.sel : g.sel;
    return sel ? root.querySelector(sel) : root;
  }

  function color(g, f) {
    const c = getComputedStyle(root);
    for (const v of f.vars || []) {
      const hex = resolveHex(c.getPropertyValue(v).trim());
      if (hex) return hex;
    }
    // No such token in this theme: measure the element the field is about.
    // `fb` names a better one where the group's selector is only a stand-in.
    const el = f.fb ? root.querySelector(f.fb) : targetOf(g, f);
    if (!el) return '';
    const s = getComputedStyle(el);
    return TE_CSS.toHex(s.backgroundColor) || TE_CSS.toHex(s.color);
  }

  function length(g, f) {
    const c = getComputedStyle(root);
    for (const v of f.vars || []) {
      const n = parseFloat(c.getPropertyValue(v));
      if (Number.isFinite(n)) return n;
    }
    const el = targetOf(g, f);
    if (!el) return NaN;
    const prop = (f.pair || f.prop).split('|')[0];
    const camel = prop.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
    return parseFloat(getComputedStyle(el)[camel]);
  }

  return { resolveHex, color, length };
}

if (typeof module === 'object' && module.exports) module.exports = { createReader };
else window.TE_READ = { createReader };
})();
