'use strict';

// A string value that holds a whole log line or an escaped JSON body reads as
// one wall of \n and \". Newlines become a space and double quotes become single
// ones, so the text stays on one line and the result is still valid JSON.
function tidy(v) {
  if (typeof v === 'string') return v.replace(/\s*\n\s*/g, ' ').replace(/"/g, "'");
  if (Array.isArray(v)) return v.map(tidy);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, tidy(x)]));
  return v;
}

function json(text) {
  try { return JSON.stringify(tidy(JSON.parse(text)), null, 2); } catch (e) { return null; }
}

module.exports = { json };
