'use strict';

/* ================= good view =================
   A reading mode for line-oriented text: every line becomes its own paragraph,
   and a leading "header:" on a line is highlighted. Whether it is on is the
   host's business — these functions are pure and always transform. */

// With breaks:true a single newline is a <br>, so a file with no blank lines
// collapses into ONE <p> and the p + p spacing rule never applies. Splitting at
// each <br> is what restores per-line spacing. A trailing <br> before </p> is
// left alone: it separates nothing.
function splitBrLines(html) {
  return html.replace(/<p>[\s\S]*?<\/p>/g, (p) =>
    p.replace(/<br[^>]*>(?!\s*<\/p>)/g, '</p><p>')
  );
}

// Highlight the leading "header" of every "header<sep> content" line. A header
// is either [bracketed] or starts with a capital; the separator is ':' or '='.
// So "[LIGHTING]: x", "Lighting: x" and "Lighting = x" all count, while
// "lighting: x" stays plain. URLs, paths and dotted names are never headers.
function highlightKvLabels(html) {
  return html.replace(/<p>[\s\S]*?<\/p>/g, (p) =>
    p.replace(/(<p[^>]*>|<br[^>]*>)(?:\[([^\]<>]{1,60})\]([ \t]*)([:=])|([^<>\[\]\n]{1,60}?)([:=]))[ \t]+(?=[^<>\s])/g, (m, lead, bLabel, bSpace, bSep, pLabel, pSep) => {
      const label = bLabel !== undefined ? '[' + bLabel + ']' : pLabel;
      const sep = bLabel !== undefined ? bSpace + bSep : pSep;
      if (bLabel === undefined && !/^[A-ZÀ-Þ]/.test(label)) return m; // unbracketed headers start capitalized
      if (/^[a-z][a-z0-9+.-]*:\/\//i.test(label)) return m; // URL scheme
      if (/[\/.]/.test(label)) return m;                    // paths / dotted names
      return lead + '<span class="kv-label">' + label + sep + '</span> ';
    })
  );
}

function goodViewHtml(html) {
  if (typeof html !== 'string') return html;
  return highlightKvLabels(splitBrLines(html));
}

module.exports = { splitBrLines, highlightKvLabels, goodViewHtml };
