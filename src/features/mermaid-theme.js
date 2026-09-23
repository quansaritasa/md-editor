'use strict';

/* ================= mermaid theme — diagram colours from the page theme =================
   mermaid paints nodes, rows and lines from its own palette and bakes the
   result into each SVG's <style>, keyed by the SVG's id — so no theme rule can
   reach them afterwards. The only way to theme a diagram is to hand mermaid
   the colours BEFORE it draws.

   Every theme keeps diagrams on light paper (--mermaid-bg), in dark mode too,
   and forces dark ink on their text. So the palette stays light: fills are the
   paper tinted with --accent, borders and lines are --accent darkened toward
   that ink, and text stays ink. Table rows alternate two faint tints under a
   stronger header tint. Each theme reads as its own colour; none
   loses contrast.

   Colours are resolved by the browser (a probe element's computed colour), so
   a theme may write them as hex, var() or color-mix(). mermaid's colour maths
   only understands plain colours, hence the conversion to hex. */

const INK = '#1f2937';
const BG = 'var(--mermaid-bg, #f6f8fa)';
const ink = (p) => 'color-mix(in srgb, var(--accent) ' + p + '%, ' + INK + ')';
// Tints start from the accent pulled toward the ink: a dark mode's accent is a
// pastel made for dark paper, and a pastel tint of light paper is just paper.
const tint = (p) => 'color-mix(in srgb, ' + ink(70) + ' ' + p + '%, ' + BG + ')';

// mermaid themeVariable -> CSS colour expression
const PALETTE = {
  background: BG,
  mainBkg: tint(14),
  primaryColor: tint(14),
  secondaryColor: tint(22),
  tertiaryColor: tint(6),
  primaryBorderColor: ink(60),
  secondaryBorderColor: ink(60),
  tertiaryBorderColor: ink(60),
  nodeBorder: ink(60),
  clusterBkg: tint(6),
  clusterBorder: ink(60),
  lineColor: ink(45),
  edgeLabelBackground: BG,
  // table rows (ER entities): mermaid 11 reads rowOdd/rowEven; the
  // attributeBackground pair is what older releases read
  rowOdd: tint(3),
  rowEven: tint(8),
  attributeBackgroundColorOdd: tint(3),
  attributeBackgroundColorEven: tint(8),
};
const TEXT = ['primaryTextColor', 'secondaryTextColor', 'tertiaryTextColor', 'textColor', 'titleColor'];

const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');

// "rgb(1, 2, 3)" | "rgba(…)" | "color(srgb 0.1 0.2 0.3)" -> "#010203"; else null
function toHex(css) {
  const s = String(css || '').trim();
  let m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(s);
  if (m) return '#' + hex2(+m[1]) + hex2(+m[2]) + hex2(+m[3]);
  m = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(s);
  if (m) return '#' + hex2(m[1] * 255) + hex2(m[2] * 255) + hex2(m[3] * 255);
  return null;
}

// The browser's own resolver: set the expression as a colour, read it back.
function browserResolver(root) {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const probe = doc.createElement('span');
  probe.style.display = 'none';
  root.appendChild(probe);
  return {
    resolve(expr) {
      probe.style.color = '';
      probe.style.color = expr;
      return probe.style.color ? toHex(win.getComputedStyle(probe).color) : null;
    },
    done() { probe.remove(); },
  };
}

// themeVariables for mermaid, or null when no theme is loaded yet (no
// --accent) or the colours cannot be resolved — mermaid's defaults then stand.
function themeVars(root, makeResolver) {
  const win = root && root.ownerDocument && root.ownerDocument.defaultView;
  if (!win || !win.getComputedStyle) return null;
  if (!win.getComputedStyle(root).getPropertyValue('--accent').trim()) return null;
  const r = (makeResolver || browserResolver)(root);
  try {
    const out = {};
    for (const k of Object.keys(PALETTE)) {
      const v = r.resolve(PALETTE[k]);
      if (!v) return null;
      out[k] = v;
    }
    TEXT.forEach((k) => { out[k] = INK; });
    return out;
  } finally {
    if (r.done) r.done();
  }
}

module.exports = { themeVars, toHex, PALETTE };
