'use strict';

/* ================= code block Beautify ================= */

const { json } = require('./json');
const { xml } = require('./xml');
const { yaml } = require('./yaml');
const { ini } = require('./ini');
const { css, conf } = require('./braces');

const FORMATTERS = {
  json,
  xml: (t) => xml(t, false),
  html: (t) => xml(t, true),
  yaml,
  ini: (t) => ini(t, true),
  env: (t) => ini(t, false),
  conf: (t) => (t.includes('{') ? conf(t) : ini(t, true)),
  css,
};

const ALIASES = {
  json: 'json', xml: 'xml', svg: 'xml', xsl: 'xml', xslt: 'xml', plist: 'xml', xhtml: 'html',
  html: 'html', htm: 'html', yaml: 'yaml', yml: 'yaml',
  ini: 'ini', toml: 'ini', cfg: 'ini', properties: 'env', env: 'env', dotenv: 'env',
  conf: 'conf', config: 'conf', nginx: 'conf', css: 'css',
};

// The fence's language decides; a fence with none is sniffed only where the
// opening character is unambiguous. null means "no formatter for this block".
function kindOf(code) {
  const m = /(?:^|\s)language-([\w+-]+)/.exec(code.className || '');
  if (m) return ALIASES[m[1].toLowerCase()] || null;
  const c = (code.textContent || '').trimStart()[0];
  return c === '{' || c === '[' ? 'json' : c === '<' ? 'xml' : null;
}

// Tidied text, or null when the text does not parse as its kind.
function beautify(text, kind) {
  const fn = FORMATTERS[kind];
  if (!fn || !text.trim()) return null;
  return fn(text.trim());
}

module.exports = { beautify, kindOf };
