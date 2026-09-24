'use strict';

/* ================= mermaid theme — one fixed diagram palette =================
   mermaid paints nodes, rows and lines from its own palette and bakes the
   result into each SVG's <style>, keyed by the SVG's id — so no theme rule can
   reach them afterwards. The only way to colour a diagram is to hand mermaid
   the colours BEFORE it draws.

   Diagrams used to be tinted from the page theme's --accent, which drew every
   node, subgraph and label in that one hue. They now share one fixed palette
   in every theme: mint nodes with teal borders, gold edge labels, blue
   subgraphs, slate lines, dark ink. Only the three base colours are given;
   mermaid's 'base' theme derives the subgraph, label and table-row shades from
   them, so none of those is set here. Every theme already keeps diagrams on
   light paper (--mermaid-bg), in dark mode too, so the palette stays readable
   everywhere. mermaid-branch.js adds more hues per flowchart branch.

   Colours are resolved by the browser (a probe element's computed colour), so
   the paper may be a var(). mermaid's colour maths only understands plain
   colours, hence the conversion to hex. */

const INK = '#1f2937';
const BG = 'var(--mermaid-bg, #f6f8fa)';

// mermaid themeVariable -> CSS colour expression
const PALETTE = {
  background: BG,
  primaryColor: '#e6f4f1',
  primaryBorderColor: '#0f766e',
  secondaryColor: '#f6d078',
  tertiaryColor: '#78b3f6',
  lineColor: '#475569',
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

// themeVariables for mermaid, or null when the colours cannot be resolved —
// mermaid's defaults then stand.
function themeVars(root, makeResolver) {
  const win = root && root.ownerDocument && root.ownerDocument.defaultView;
  if (!win || !win.getComputedStyle) return null;
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
