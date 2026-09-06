'use strict';

/* ================= opt-in document transforms =================
   Every function here invents markup that plain markdown has no syntax for:
   a title card, question cards, example boxes, labelled table cells. The
   bundled themes style all of it, but none of it is standard, so each one sits
   behind its own flag and stays off unless a host asks for it. */

const { escapeHtml, escapeRegex, parseInline, stripPTags } = require('./util');

// The header card repeats the document title, so the <h1> the body already
// carries has to go or it shows up twice.
function stripDuplicateTitleHeading(html, title) {
  const titleHtml = parseInline(title).trim();
  const re = new RegExp('^\\s*<h1>' + escapeRegex(titleHtml) + '</h1>\\s*');
  return html.replace(re, '');
}

// "Section: Title" splits into an eyebrow above the title. URLs are exempt —
// "https://x" would otherwise break at its own colon.
function buildHeader(title, metadata) {
  let eyebrow = '';
  let cleanTitle = title;
  if (title.includes(': ') && !title.includes('http://') && !title.includes('https://')) {
    const idx = title.indexOf(': ');
    eyebrow = title.slice(0, idx).trim();
    cleanTitle = title.slice(idx + 2).trim();
  }
  const lines = ['<section class="header">'];
  if (eyebrow) lines.push('  <div class="eyebrow">' + escapeHtml(eyebrow) + '</div>');
  lines.push('  <h1>' + parseInline(cleanTitle) + '</h1>');
  if (metadata && Object.keys(metadata).length) {
    lines.push('  <div class="meta">');
    for (const k of Object.keys(metadata)) {
      const v = metadata[k];
      const valHtml = v ? parseInline(escapeHtml(String(v))) : '';
      lines.push('    <div class="meta-item"><span class="meta-label">' + escapeHtml(String(k)) + ':</span> ' + valHtml + '</div>');
    }
    lines.push('  </div>');
  }
  lines.push('</section>');
  return lines.join('\n');
}

// A cell holding only "- a<br>- b" is a list the table syntax could not express.
// Anything else is left exactly as authored.
function normalizeTableCellContent(tdContent) {
  const parts = tdContent.split(/<br\s*\/?>/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return tdContent;
  const items = [];
  for (const part of parts) {
    const m = part.match(/^[-*•]\s+(.+)$/s);
    if (!m) return tdContent;
    items.push(m[1].trim());
  }
  return '<ul>' + items.map((i) => '<li>' + i + '</li>').join('') + '</ul>';
}

// data-label lets a narrow screen restack a table into cards without losing
// which column each value came from.
function addDataLabels(html) {
  return html.replace(/<table>.*?<\/table>/gs, (table) => {
    const headers = [...table.matchAll(/<th>(.*?)<\/th>/gs)].map((m) => m[1].replace(/<.*?>/gs, '').trim());
    if (!headers.length) return table;
    const rows = [...table.matchAll(/<tr>(.*?)<\/tr>/gs)].map((m) => m[1]);
    const newRows = [];
    for (const rowHtml of rows) {
      if (rowHtml.includes('<th>')) { newRows.push(rowHtml); continue; }
      const tds = [...rowHtml.matchAll(/<td>(.*?)<\/td>/gs)].map((m) => m[1]);
      let newRow = rowHtml;
      tds.forEach((tdContent, index) => {
        if (index < headers.length) {
          const label = escapeHtml(headers[index]);
          const norm = normalizeTableCellContent(tdContent);
          newRow = newRow.replace('<td>' + tdContent + '</td>', '<td data-label="' + label + '">' + norm + '</td>');
        }
      });
      newRows.push(newRow);
    }
    let out = table;
    rows.forEach((oldRow, i) => {
      out = out.replace('<tr>' + oldRow + '</tr>', '<tr>' + newRows[i] + '</tr>');
    });
    return out;
  });
}

function buildQaCard(inner) {
  const qMatch = inner.match(/(<strong>Q\d+:.*?)(?:<strong>A|A:)/s);
  if (!qMatch) return null;
  const qContent = stripPTags(qMatch[1]);
  const aMarker = inner.includes('<strong>A') ? '<strong>A' : 'A:';
  const aStart = qMatch.index + qMatch[0].length - aMarker.length;
  const aContent = stripPTags(inner.slice(aStart));
  return '<div class="block-card"><p class="q">' + qContent + '</p><p class="a">' + aContent + '</p></div>';
}

// Only a section whose heading mentions "Question(s)" is eligible, and only if
// its list items actually parse as Q/A pairs; otherwise the section is returned
// untouched.
function wrapQaCards(html) {
  return html.replace(/<section class="section">\s*<h2>[^<]*Questions?[^<]*<\/h2>.*?<\/section>/gs, (section) => {
    const items = [...section.matchAll(/<li>(.*?)<\/li>/gs)].map((m) => m[1]);
    const cards = items.map(buildQaCard).filter(Boolean);
    if (!cards.length) return section;
    const headingMatch = section.match(/(<h2>[^<]*Questions?[^<]*<\/h2>)/);
    if (!headingMatch) return section;
    const afterHeading = section.slice(headingMatch.index + headingMatch[0].length);
    const ulIdx = afterHeading.indexOf('<ul>');
    const prefix = ulIdx > 0 ? afterHeading.slice(0, ulIdx).trim() : '';
    const grid = '<div class="block-grid">\n' + cards.join('\n') + '\n</div>';
    const prefixBlock = prefix ? prefix + '\n' : '';
    return '<section class="section">\n' + headingMatch[1] + '\n' + prefixBlock + grid + '\n</section>';
  });
}

// Under an "Example" heading, ✅/❌ list items become paired do/don't boxes.
function wrapExampleBoxes(html) {
  return html.replace(/<h4>Example<\/h4>.*?(?=<h[234]>|<\/section>)/gs, (block) => {
    const items = [];
    const re = /<li>(✅.*?)<\/li>|<li>(❌.*?)<\/li>/gs;
    let m;
    while ((m = re.exec(block))) {
      const raw = m[1] !== undefined ? m[1] : m[2];
      items.push({ raw, kind: m[1] !== undefined ? 'good' : 'bad', content: raw.trim() });
    }
    if (!items.length) return block;
    const boxes = items.map((it) => {
      const klass = it.kind === 'good' ? 'example-box good-box' : 'example-box bad-box';
      return '<div class="' + klass + '"><p>' + it.content + '</p></div>';
    });
    let remaining = block;
    for (const it of items) remaining = remaining.replace('<li>' + it.raw + '</li>', '');
    remaining = remaining.replace(/<ul>\s*<\/ul>/g, '');
    const exampleHeading = remaining.match(/<h4>Example<\/h4>/);
    if (exampleHeading) {
      const insertPos = exampleHeading.index + exampleHeading[0].length;
      remaining = remaining.slice(0, insertPos) + '\n' + boxes.join('\n') + '\n' + remaining.slice(insertPos);
    }
    return remaining;
  });
}

// A table right under a "Fields" heading is a key/type/description reference,
// which the themes lay out differently from a data table.
function wrapFieldTables(html) {
  return html.replace(/(<h[23]>[^<]*[Ff]ields[^<]*<\/h[23]>\s*)(<table)/g, '$1<table class="fields"');
}

module.exports = {
  stripDuplicateTitleHeading, buildHeader, normalizeTableCellContent,
  addDataLabels, buildQaCard, wrapQaCards, wrapExampleBoxes, wrapFieldTables,
};
