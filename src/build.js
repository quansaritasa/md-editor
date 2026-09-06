'use strict';

/* ================= build: markdown source -> document HTML =================
   Pure. No DOM, no globals, no I/O — the whole pipeline is a function of its
   arguments, which is what makes it testable against frozen fixtures.

   Deciding WHICH options a given file deserves is the host's job. This does not
   sniff filenames: a host that wants a header card on SKILL.md asks for one. */

const deps = require('./deps');
const parse = require('./parse');
const transform = require('./transform');
const goodview = require('./goodview');

const DEFAULTS = {
  fallbackStem: '',   // titleizes into a title when the document supplies none
  breaks: true,       // a single newline is a line break, as on GitHub/Obsidian
  postprocess: true,  // false yields marked's output untouched
  extractMeta: false, // read frontmatter / "**Key:** value" into title + meta
  title: '',          // explicit title; only used when extractMeta is off
  transforms: [],     // opt-in extras, see transform.OPTIONAL
};

function build(md, options) {
  const o = Object.assign({}, DEFAULTS, options || {});
  const t = new Set(o.transforms);
  for (const name of t) {
    if (!transform.OPTIONAL.includes(name)) {
      throw new Error('md-editor: unknown transform "' + name + '". Known: ' + transform.OPTIONAL.join(', '));
    }
  }

  let source = md == null ? '' : String(md);
  let title = o.title;
  let meta = {};

  if (t.has('txt-headings')) source = transform.boldTxtHeadings(source);

  if (o.extractMeta) {
    const p = parse.preprocess(source, o.fallbackStem);
    source = p.bodyText;
    title = p.title;
    meta = p.meta;
  }

  let html = deps.marked().parse(source, { breaks: o.breaks });

  if (o.postprocess) html = transform.run(html, { transforms: t, title, meta });
  if (t.has('good-view')) html = goodview.goodViewHtml(html);

  return { html, title, meta };
}

module.exports = { build, DEFAULTS };
