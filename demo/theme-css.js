(function () {
'use strict';
/* The theme editor's one piece of real logic: state -> CSS.

   Pure on purpose — no DOM, no storage, no theme knowledge. The page hands in
   a field schema (theme-fields.js) and the user's overrides; this returns the
   stylesheet, so the preview and the exported file are the SAME text with a
   different selector. Anywhere they differed, the panel would be lying about
   what a reader gets.

   Overrides are sparse: a key that is absent was never touched, so its
   declaration is left out and the theme keeps owning that value. That is what
   makes an export stick to what the author changed instead of freezing a whole
   palette against future theme updates. */

// '#abc' | '#aabbcc' | 'rgb(28, 35, 51)' | 'color(srgb 0.79 0.79 0.80)'
// -> '#1c2333'. Anything else (a keyword, an empty string) answers null, so a
// caller can skip the declaration rather than write CSS it cannot preview.
//
// The color(srgb …) form is not optional: Chromium serialises every resolved
// color-mix() that way, and the themes' derived tokens (--heading-ink,
// --table-head-bg) are mixes — without this branch the panel's colour chip
// would fall back to the prose ink and quietly misreport the theme.
function toHex(value) {
  const s = String(value == null ? '' : value).trim().toLowerCase();
  // A typed colour usually arrives without the hash, so accept both.
  let m = /^#?([0-9a-f]{3,4})$/.exec(s);
  if (m) return '#' + m[1].split('').map((c) => c + c).join('');
  m = /^#?([0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
  if (m) return '#' + m[1];
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?/.exec(s);
  if (m) return rgbHex(m.slice(1, 4), 1, alphaOf(m[4], m[5]));
  m = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%?))?/.exec(s);
  if (m) return rgbHex(m.slice(1, 4), 255, alphaOf(m[4], m[5]));
  return null;
}

// Alpha written as 0.4 or 40% -> 0-1; absent means opaque.
function alphaOf(n, pct) {
  if (n == null) return 1;
  return Math.max(0, Math.min(1, parseFloat(n) / (pct ? 100 : 1)));
}

// mult: 1 for channels already in 0-255, 255 for the 0-1 form.
function rgbHex(parts, mult, a = 1) {
  const two = (v) => (v < 16 ? '0' : '') + v.toString(16);
  const hex = parts.map((n) => two(Math.max(0, Math.min(255, Math.round(parseFloat(n) * mult))))).join('');
  // Opaque stays 6 digits, so existing values are written exactly as before.
  return '#' + hex + (a < 1 ? two(Math.round(a * 255)) : '');
}

// A colour is written as a token when the field has one, so the theme's own
// derivations keep working; otherwise as a declaration on the field's element.
function selectorFor(group, field, root) {
  const sel = field.sel !== undefined ? field.sel : group.sel;
  return root + (sel ? ' ' + sel : '');
}

// groups: theme-fields.js GROUPS
// overrides: { fieldKey: value }     value = '#rrggbb' | number (px)
// selector: '#te-preview' (live preview) or '.md-editor' (export)
// prefix: '' or 'html.dark '  — the export's dark block; the preview shows one
// mode at a time, so it never needs one.
function buildCss(groups, overrides, selector, prefix) {
  const rootSel = (prefix || '') + selector;
  const vars = [];
  const rules = new Map();             // selector -> declarations, first-seen order

  const put = (sel, decl) => {
    if (!rules.has(sel)) rules.set(sel, []);
    rules.get(sel).push(decl);
  };

  for (const g of groups) {
    for (const f of g.fields) {
      if (!overrides || !Object.prototype.hasOwnProperty.call(overrides, f.k)) continue;
      if (f.kind === 'color') {
        const hex = toHex(overrides[f.k]);
        if (!hex) continue;
        if (f.vars) for (const v of f.vars) vars.push('  ' + v + ': ' + hex + ';');
        else put(selectorFor(g, f, rootSel), '  color: ' + hex + ';');
        continue;
      }
      const n = Number(overrides[f.k]);
      if (!Number.isFinite(n)) continue;
      const val = Math.round(n) + 'px';
      if (f.vars) for (const v of f.vars) vars.push('  ' + v + ': ' + val + ';');
      else {
        const sel = selectorFor(g, f, rootSel);
        for (const prop of (f.pair || f.prop).split('|')) put(sel, '  ' + prop + ': ' + val + ';');
      }
    }
  }

  const blocks = [];
  if (vars.length) blocks.push(rootSel + ' {\n' + vars.join('\n') + '\n}');
  for (const [sel, decls] of rules) blocks.push(sel + ' {\n' + decls.join('\n') + '\n}');
  return blocks.join('\n\n');
}

if (typeof module === 'object' && module.exports) module.exports = { toHex, buildCss, selectorFor };
else window.TE_CSS = { toHex, buildCss, selectorFor };

})();
