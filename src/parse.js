'use strict';

/* ================= pre-process (title + metadata) =================
   Two ways a document can carry a title and metadata:
     - YAML-ish frontmatter fenced by --- lines, or
     - a leading "# Title" followed by "**Key:** value" lines.
   Both are read here and stripped from the body, so the caller renders the
   prose alone and lays the title out itself. */

function parseFrontmatter(mdText) {
  const lines = mdText.split('\n');
  let start = -1;
  if (lines.length && lines[0].trim() === '---') start = 0;
  else if (lines.length && lines[0].startsWith('# ')) {
    for (let i = 1; i < lines.length; i++) {
      const s = lines[i].trim();
      if (!s) continue;
      start = (s === '---') ? i : -1;
      break;
    }
  }
  if (start === -1) return { body: mdText, frontmatter: {} };
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { end = i; break; }
  }
  if (end === -1) return { body: mdText, frontmatter: {} };
  const fm = {};
  let currentKey = '';
  for (let i = start + 1; i < end; i++) {
    const stripped = lines[i].trim();
    if (!stripped) continue;
    let m = stripped.match(/^\s*-\s*(?:"(.+?)"|(.+))\s*$/);
    if (m && currentKey) {
      const item = m[1] || m[2];
      const existing = fm[currentKey] || '';
      fm[currentKey] = existing + (existing ? ', ' : '') + item.trim();
      continue;
    }
    m = stripped.match(/^([\w-]+):\s+(.+)$/);
    if (m) {
      currentKey = m[1];
      let value = m[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      fm[currentKey] = value;
      continue;
    }
    m = stripped.match(/^([\w-]+):\s*$/);
    if (m) { currentKey = m[1]; fm[currentKey] = ''; }
  }
  const body = lines.slice(0, start).concat(lines.slice(end + 1)).join('\n');
  return { body, frontmatter: fm };
}

function extractMetadata(mdText) {
  const lines = mdText.split('\n');
  let title = '';
  const metadata = {};
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const stripped = lines[i].trim();
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(stripped)) break;
    if (stripped.startsWith('# ') && !title) title = stripped.slice(2).trim();
    const m = stripped.match(/^\*\*(.+?):\*\*\s+(.+)$/);
    if (m) metadata[m[1].trim()] = m[2].trim();
  }
  return { title, metadata };
}

function stripHeaderMetadataBlock(mdText, title, metadata) {
  if (!title && Object.keys(metadata).length === 0) return mdText;
  const lines = mdText.split('\n');
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  const preserved = [];
  while (i < lines.length && lines[i].trim().startsWith('>')) { preserved.push(lines[i]); i++; }
  while (i < lines.length && !lines[i].trim()) { preserved.push(lines[i]); i++; }
  if (title && i < lines.length && lines[i].trim() === '# ' + title) {
    i++;
    while (i < lines.length && !lines[i].trim()) i++;
  }
  let consumedMetadata = false;
  while (i < lines.length) {
    const stripped = lines[i].trim();
    if (!stripped) { i++; continue; }
    const m = stripped.match(/^\*\*(.+?):\*\*\s+(.+)$/);
    if (!m || !(m[1].trim() in metadata)) break;
    consumedMetadata = true;
    i++;
  }
  if (consumedMetadata) {
    while (i < lines.length && !lines[i].trim()) i++;
    if (i < lines.length && /^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i].trim())) {
      i++;
      while (i < lines.length && !lines[i].trim()) i++;
    }
  }
  const remaining = lines.slice(i).join('\n');
  return preserved.length ? preserved.join('\n') + '\n' + remaining : remaining;
}

// Frontmatter wins outright: a document that declares one is trusted to lay out
// its own opening, so no "# Title" / "**Key:** value" scraping runs on it.
function preprocess(mdText, fallbackStem) {
  const { body, frontmatter } = parseFrontmatter(mdText);
  let title, metadata, bodyText;
  if (Object.keys(frontmatter).length) {
    title = ''; metadata = {};
    bodyText = body;
  } else {
    const em = extractMetadata(body);
    title = em.title; metadata = em.metadata;
    bodyText = stripHeaderMetadataBlock(body, title, metadata);
  }
  if (!title) title = String(fallbackStem).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  bodyText = stripHeaderMetadataBlock(bodyText, title, metadata);
  return { bodyText, title, meta: { ...metadata, ...frontmatter } };
}

module.exports = { parseFrontmatter, extractMetadata, stripHeaderMetadataBlock, preprocess };
