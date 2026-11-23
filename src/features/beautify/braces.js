'use strict';

const STRINGS = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;

// One declaration or brace per line, so the indenter below has lines to work on.
function reflow(text) {
  let out = '';
  let paren = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== c) j += text[j] === '\\' ? 2 : 1;
      out += text.slice(i, j + 1); i = j; continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      const j = text.indexOf('*/', i + 2);
      const end = j < 0 ? text.length : j + 2;
      out += '\n' + text.slice(i, end) + '\n'; i = end - 1; continue;
    }
    if (c === '(') paren++;
    if (c === ')') paren = Math.max(paren - 1, 0);
    if (c === '{') out += ' {\n';
    else if (c === '}') out += '\n}\n';
    else if (c === ';' && !paren) out += ';\n';
    else out += c;
  }
  return out;
}

function indent(lines, hashComments) {
  const out = [];
  let depth = 0;
  for (const line of lines) {
    let code = line.replace(STRINGS, '');
    if (hashComments) code = code.replace(/#.*$/, '');
    const closes = (code.match(/}/g) || []).length;
    const opens = (code.match(/{/g) || []).length;
    const lead = (/^}+/.exec(code.trim()) || [''])[0].length;
    out.push('  '.repeat(Math.max(depth - lead, 0)) + line);
    depth = Math.max(depth + opens - closes, 0);
  }
  return out;
}

// CSS: rules and declarations on their own lines, `prop: value`, blank line between rules.
function css(text) {
  const lines = reflow(text).split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean)
    .map((l) => (l.endsWith('{') || l[0] === '}' ? l : l.replace(/^([\w-]+)\s*:\s*/, '$1: ')));
  const out = [];
  indent(lines, false).forEach((l, i, all) => {
    out.push(l);
    if (l === '}' && all[i + 1] !== undefined) out.push('');
  });
  return out.join('\n');
}

// Brace-style config (nginx and friends): only the indent is redone, line by line.
function conf(text) {
  const lines = text.split('\n').map((l) => l.trim());
  const out = [];
  for (const l of indent(lines, true)) {
    if (l.trim() === '' && out.length && out[out.length - 1] === '') continue;
    out.push(l.trim() === '' ? '' : l);
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}

module.exports = { css, conf };
