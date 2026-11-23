'use strict';

const BLOCK = /(?:^|[\s:-])[|>][+-]?\d*\s*(?:#.*)?$/;

// Re-indents every level to 2 spaces. Each original indent is mapped to a level
// through a stack; a "- " also registers the column its content starts at, so
// the keys that follow line up under it. Block scalars (| and >) move as a unit.
function yaml(text) {
  const out = [];
  let stack = [];
  let block = null; // { col, base, first }
  for (const raw of text.replace(/^\t+/gm, (t) => '  '.repeat(t.length)).split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line) { if (out.length && out[out.length - 1] !== '') out.push(''); continue; }
    const ind = line.length - line.trimStart().length;
    if (block) {
      if (ind > block.col) {
        if (block.first === null) block.first = ind;
        out.push(' '.repeat(Math.max(block.base + ind - block.first, block.base)) + line.trimStart());
        continue;
      }
      block = null;
    }
    if (/^(---|\.\.\.)(\s|$)/.test(line)) { stack = []; out.push(line); continue; }
    while (stack.length && stack[stack.length - 1].orig > ind) stack.pop();
    const top = stack[stack.length - 1];
    let level;
    if (top && top.orig === ind) level = top.level;
    else { level = top ? top.level + 1 : 0; if (!line.trimStart().startsWith('#')) stack.push({ orig: ind, level }); }
    const own = level;
    let rest = line.trimStart();
    let col = ind;
    let prefix = '';
    let m;
    while ((m = /^-( +|$)/.exec(rest))) {
      rest = rest.slice(m[0].length);
      col += m[0].length;
      level++;
      prefix += '- ';
      stack.push({ orig: col, level });
    }
    rest = rest.replace(/^([^\s#'"{[][^:#]*?):[ \t]{2,}(?=\S)/, '$1: ');
    out.push('  '.repeat(own) + (prefix + rest).trimEnd());
    if (BLOCK.test(rest)) block = { col, base: level * 2 + 2, first: null };
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}

module.exports = { yaml };
