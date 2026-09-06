'use strict';

/* ================= small shared helpers ================= */
const deps = require('./deps');

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseInline(s) {
  return deps.marked().parseInline(String(s));
}

function stripPTags(s) {
  s = s.trim();
  s = s.replace(/^<p>/, '').replace(/<\/p>$/, '');
  return s.trim();
}

// "my-shot-list" -> "My Shot List". The fallback when a document carries no
// usable title of its own; the caller supplies the stem because only it knows
// which extensions are strippable.
function titleFromStem(stem) {
  return String(stem).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// First level-1 heading, or '' when the document has none.
function titleFromH1(md) {
  const m = String(md).match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

module.exports = { escapeHtml, escapeRegex, parseInline, stripPTags, titleFromStem, titleFromH1 };
