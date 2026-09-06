'use strict';

/* ================= HTML post-processing =================
   Three steps always run once post-processing is on, because the themes and the
   collapse/outline features are written against the markup they produce:
   sections, code blocks, blockquotes. Everything else is opt-in and lives in
   transform-cards.js. */

const cards = require('./transform-cards');

// Standalone [BRACKET HEADING] lines become real headings. Runs on the markdown
// SOURCE, not the HTML, so marked still sees a well-formed document.
function boldTxtHeadings(md) {
  // Merge "LABEL:" + single value line into "LABEL: VALUE" so key-value pairs
  // (e.g. "OUTFIT:\n[USER_OUTFIT]", "MOOD:\nAUTO") stay on one line.
  md = md.replace(/(^|\n)([^\n:]+):[ \t]*\n[ \t]*([^\n]+)[ \t]*(?=\n[ \t]*\n|\n*$)/g, '$1$2: $3');
  return md.replace(/^[ \t]*\[([^\]]+)\][ \t]*$/gm, '<h2 class="txt-head">[$1]</h2>\n');
}

// Opt-in: a card layout uses <h2> boundaries as its dividers, so a document
// written with --- rules between the same sections would draw them twice.
function stripHorizontalRules(html) {
  return html.replace(/\s*<hr\s*\/?>\s*/gi, '\n');
}

// Split at every <h2> so each run of content becomes one addressable block —
// what the themes paint and what section-collapse folds.
function wrapSections(html) {
  html = html.trim();
  if (!html) return '';
  const chunks = html.split(/(?=<h2(?:\s|>))/);
  return chunks.filter((c) => c.trim()).map((c) => '<section class="section">\n' + c.trim() + '\n</section>').join('\n');
}

// The buttons are emitted unwired; the code-blocks feature binds them later.
// Mermaid fences are skipped — they get replaced by an SVG, not decorated.
function wrapCodeBlocks(html) {
  return html.replace(/<pre><code(?: class="([^"]*)")?>(.*?)<\/code><\/pre>/gs, (match, classes, codeHtml) => {
    if (classes && classes.includes('language-mermaid')) return match;
    const button = '<button class="code-full-btn" type="button" style="display:none" aria-label="Copy code with _pre/_post prompt">Copy Full</button>'
      + '<button class="code-wrap-btn" type="button" aria-label="Toggle wrap">Wrap</button>'
      + '<button class="code-copy-btn" type="button" aria-label="Copy code">Copy</button>';
    const codeClassAttr = classes && classes.trim() ? ' class="' + classes.trim() + '"' : '';
    return '<div class="code-block">' + button + '<pre><code' + codeClassAttr + '>' + codeHtml + '</code></pre></div>';
  });
}

// A blockquote opening with a bolded Note/Warning or Info/Tip label is an
// admonition; the extra class is what colours it.
function wrapBlockquotes(html) {
  return html.replace(/<blockquote>(.*?)<\/blockquote>/gs, (m, inner) => {
    let extraClass = '';
    if (/<p>\s*<strong>\s*(?:⚠️\s*)?(?:Note|Warning|Warn)\s*[:：]?\s*<\/strong>/i.test(inner)) extraClass = ' note';
    else if (/<p>\s*<strong>\s*(?:ℹ️\s*)?(?:Info|Information|Tip)\s*[:：]?\s*<\/strong>/i.test(inner)) extraClass = ' info';
    return '<div class="blockquotes' + extraClass + '">' + inner + '</div>';
  });
}

const OPTIONAL = ['txt-headings', 'strip-hr', 'header', 'data-labels', 'qa-cards', 'example-boxes', 'field-tables', 'good-view'];

// Step order is load-bearing: sections must exist before the Q&A pass can find
// one, and the header card is prepended only after sections are wrapped so it
// never becomes a section itself.
function run(html, ctx) {
  const t = ctx.transforms;
  const title = ctx.title || '';
  const meta = ctx.meta || {};
  const hasHeader = t.has('header') && !!(title || Object.keys(meta).length);

  if (hasHeader) html = cards.stripDuplicateTitleHeading(html, title);
  if (t.has('strip-hr')) html = stripHorizontalRules(html);
  html = wrapSections(html);
  if (hasHeader) html = cards.buildHeader(title, meta) + '\n' + html;
  if (t.has('data-labels')) html = cards.addDataLabels(html);
  if (t.has('qa-cards')) html = cards.wrapQaCards(html);
  if (t.has('example-boxes')) html = cards.wrapExampleBoxes(html);
  if (t.has('field-tables')) html = cards.wrapFieldTables(html);
  html = wrapCodeBlocks(html);
  html = wrapBlockquotes(html);
  return html;
}

module.exports = {
  OPTIONAL, run, boldTxtHeadings, stripHorizontalRules, wrapSections, wrapCodeBlocks, wrapBlockquotes,
};
