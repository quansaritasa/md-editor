'use strict';

const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
// HTML only: these hold text whose whitespace means something, so they pass through whole.
const RAW = '<(script|style|pre|textarea)\\b[\\s\\S]*?<\\/\\1\\s*>|';
const TOKEN = '<!--[\\s\\S]*?-->|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>|<\\?[\\s\\S]*?\\?>|<![^>]*>'
  + '|<\\/?[\\w:.-]+(?:"[^"]*"|\'[^\']*\'|[^>"\'])*>|[^<]+|<';

const isRaw = (t) => /^<(script|style|pre|textarea)\b[\s\S]*<\/\1\s*>$/i.test(t);
const isClose = (t) => t.startsWith('</');
const isOpen = (t) => /^<[\w:]/.test(t) && !t.endsWith('/>');
const nameOf = (t) => (/^<\/?([\w:.-]+)/.exec(t) || [])[1];
const isText = (t) => t[0] !== '<' || t === '<';

// Markup re-indented one tag per line; an element holding only a short text stays
// on one line.
function xml(text, html) {
  const toks = (text.match(new RegExp((html ? RAW : '') + TOKEN, 'gi')) || [])
    .map((t) => (isText(t) ? t.replace(/\s+/g, ' ').trim() : t))
    .filter(Boolean);
  const lines = [];
  let depth = 0;
  const push = (s) => lines.push('  '.repeat(Math.max(depth, 0)) + s);
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (isText(t)) { push(t); continue; }
    if (isClose(t)) { depth--; push(t); continue; }
    if (!isOpen(t) || (html && (VOID.has(nameOf(t).toLowerCase()) || isRaw(t)))) { push(t); continue; }
    const n = toks[i + 1];
    const c = toks[i + 2];
    const same = (x) => x && isClose(x) && nameOf(x) === nameOf(t);
    if (same(n)) { push(t + n); i += 1; continue; }
    if (n && isText(n) && same(c)) { push(t + n + c); i += 2; continue; }
    push(t);
    depth++;
  }
  return lines.join('\n');
}

module.exports = { xml };
