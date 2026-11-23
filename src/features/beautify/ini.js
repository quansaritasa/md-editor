'use strict';

const COMMENT = /^\s*([#;]|\/\/)/;
const SECTION = /^\s*\[[^\]]*\]\s*$/;
const KEY = /^([^=:#;\s[][^=]*?)\s*=\s*(.*)$/;

// Settings files: trailing space gone, blank runs collapsed, `key=value` spaced
// as `key = value` and a blank line before each [section]. Lines that are not a
// key (a TOML array row, a continuation) keep their indent.
function ini(text, spaced) {
  const out = [];
  let inString = false;
  for (const raw of text.split('\n')) {
    let line = raw.replace(/\s+$/, '');
    const quotes = (line.match(/"""|'''/g) || []).length;
    if (inString) { out.push(line); if (quotes % 2) inString = false; continue; }
    if (quotes % 2) inString = true;
    if (!line.trim()) { if (out.length && out[out.length - 1] !== '') out.push(''); continue; }
    if (COMMENT.test(line)) line = line.trim();
    else if (SECTION.test(line)) {
      line = line.trim();
      if (out.length && out[out.length - 1] !== '' && spaced) out.push('');
    } else {
      const m = KEY.exec(line.trim());
      if (m) line = spaced ? m[1] + ' = ' + m[2] : m[1] + '=' + m[2];
    }
    out.push(line);
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}

module.exports = { ini };
