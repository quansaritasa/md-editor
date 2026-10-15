'use strict';

/* ================= callouts: GitHub alerts and ::: containers =================
   Two spellings of the same thing, a titled box around ordinary markdown:

     > [!NOTE]                 :::tip Optional title       ::: warning
     > Body, any markdown.     Body, any markdown.         Body.
                               :::                         :::

   The alert is GitHub's (NOTE, TIP, IMPORTANT, WARNING, CAUTION). The
   container is the CommonMark generic-directive form as VitePress, Docusaurus
   and remark-directive write it: a name, then an optional `[label]`, `{k=v}`
   attributes or a bare title. More colons nest — the outer fence is longer.
   Only the container form is read: inline `:name` and leaf `::name` fire on
   ordinary prose (`see:this`), and almost nothing writes them.

   Both render as <div class="callout callout-NAME">; an unknown name is a
   plain titled box, so its content still reads. `details` folds. */

const KINDS = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution', info: 'Info', danger: 'Danger' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// `{type=chart title="A b" .wide #id}` -> { type: 'chart', title: 'A b' }.
// Classes and ids are dropped: a document must not reach the host's own.
function parseAttrs(s) {
  const out = {};
  const re = /([\w-]+)=(?:"([^"]*)"|'([^']*)'|([^\s"'}]+))/g;
  let m;
  while ((m = re.exec(s || ''))) out[m[1].toLowerCase()] = m[2] != null ? m[2] : m[3] != null ? m[3] : m[4];
  return out;
}

function box(name, title, attrs, body) {
  const data = Object.keys(attrs).map((k) => ' data-' + k + '="' + esc(attrs[k]) + '"').join('');
  const cls = 'callout callout-' + esc(name);
  if (name === 'details') {
    return '<details class="' + cls + '"' + data + '><summary class="callout-title">'
      + esc(title || 'Details') + '</summary>\n' + body + '</details>\n';
  }
  const head = title ? '<p class="callout-title">' + esc(title) + '</p>\n' : '';
  return '<div class="' + cls + '"' + data + '>\n' + head + body + '</div>\n';
}

const ALERT_HEAD = /^ {0,3}>[ \t]*\[!(note|tip|important|warning|caution)\][ \t]*(?:\n|$)/i;

const alert = {
  name: 'callout',
  level: 'block',
  // No start(): a blockquote already ends the paragraph above it, and the
  // lexer tries extensions first at every block boundary.
  tokenizer(src) {
    const head = ALERT_HEAD.exec(src);
    if (!head) return;
    const lines = src.slice(head[0].length).split('\n');
    let n = 0;
    while (n < lines.length && /^ {0,3}>/.test(lines[n])) n++;
    const quoted = lines.slice(0, n);
    const raw = head[0] + quoted.join('\n') + (n < lines.length && n ? '\n' : '');
    const body = quoted.map((l) => l.replace(/^ {0,3}> ?/, '')).join('\n');
    const kind = head[1].toLowerCase();
    return { type: 'callout', raw, kind, title: KINDS[kind], attrs: {}, tokens: this.lexer.blockTokens(body, []) };
  },
  renderer(t) {
    return box(t.kind, t.title, t.attrs, this.parser.parse(t.tokens));
  },
};

const OPEN = /^ {0,3}(:{3,})[ \t]*([A-Za-z][\w-]*)[ \t]*(?:\[([^\]\n]*)\])?[ \t]*(?:\{([^}\n]*)\})?[ \t]*([^\n]*)(?:\n|$)/;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

// The body's line count up to its closing fence: a line of at least as many
// colons and nothing else. A same-length opener inside nests, and code fences
// are skipped so a `:::` in a code sample never closes anything. -1: unclosed.
function closeAt(lines, colons) {
  let depth = 0;
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const f = FENCE.exec(l);
    if (fence) { if (f && f[1][0] === fence[0] && f[1].length >= fence.length) fence = null; continue; }
    if (f) { fence = f[1]; continue; }
    const c = /^ {0,3}(:{3,})[ \t]*(\S*)/.exec(l);
    if (!c || c[1].length !== colons) continue;
    if (c[2]) depth++;
    else if (depth) depth--;
    else return i;
  }
  return -1;
}

const container = {
  name: 'container',
  level: 'block',
  // Lets `:::` end a paragraph with no blank line before it. indexOf, not a
  // regex: the lexer calls this with the whole rest of the document.
  start(src) {
    if (src.startsWith(':::')) return 0;
    const i = src.indexOf('\n:::');
    return i === -1 ? undefined : i + 1;
  },
  tokenizer(src) {
    const open = OPEN.exec(src);
    if (!open) return;
    const lines = src.slice(open[0].length).split('\n');
    const end = closeAt(lines, open[1].length);
    if (end === -1) return; // an unclosed fence stays text rather than eating the document
    const body = lines.slice(0, end).join('\n');
    const raw = open[0] + lines.slice(0, end + 1).join('\n') + (end + 1 < lines.length ? '\n' : '');
    const kind = open[2].toLowerCase();
    const attrs = parseAttrs(open[4]);
    const title = (open[3] || open[5] || attrs.title || KINDS[kind] || '').trim();
    delete attrs.title;
    return { type: 'container', raw, kind, title, attrs, tokens: this.lexer.blockTokens(body, []) };
  },
  renderer(t) {
    return box(t.kind, t.title, t.attrs, this.parser.parse(t.tokens));
  },
};

const EXTENSIONS = [alert, container];
const installed = new WeakSet();

// Registered on whichever marked the host handed over, once per instance.
function install(marked) {
  if (!marked || typeof marked.use !== 'function' || installed.has(marked)) return;
  installed.add(marked);
  marked.use({ extensions: EXTENSIONS });
}

module.exports = { install, EXTENSIONS, parseAttrs };
