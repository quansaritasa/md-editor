'use strict';

/* ================= heading ids for outline links ================= */

// The character classes kept are latin alphanumerics plus CJK and Hangul, so a
// heading in those scripts keeps a readable id instead of collapsing to
// nothing.
function slugifyHeading(text, i) {
  const s = String(text).trim().toLowerCase()
    .replace(/[^a-z0-9一-鿿぀-ゟ゠-ヿ가-힯]+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'section-' + i;
}

// Two headings with the same text slugify identically, and a repeated id means
// getElementById returns the FIRST one — so clicking the second outline row
// scrolls to the wrong heading. Repeats get a numeric suffix.
function uniqueSlug(text, i, taken) {
  const base = slugifyHeading(text, i);
  if (!taken.has(base)) { taken.add(base); return base; }
  let n = 2;
  while (taken.has(base + '-' + n)) n++;
  const id = base + '-' + n;
  taken.add(id);
  return id;
}

// Ids already on the headings are reserved before any are generated, so a
// generated slug can never collide with an authored one.
function assignIds(items) {
  const taken = new Set();
  for (const it of items) if (it.el.id) taken.add(it.el.id);
  items.forEach((it, i) => {
    if (!it.el.id) it.el.id = uniqueSlug(it.text, i, taken);
  });
  return items;
}

module.exports = { slugifyHeading, uniqueSlug, assignIds };
