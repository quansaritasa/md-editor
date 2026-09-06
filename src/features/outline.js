'use strict';

/* ================= document outline =================
   Built as a factory rather than a module of globals: the panel elements, the
   scroll container and the document root all belong to the host, and a host may
   well have two of each (a document and a compare pane). */

const fold = require('./outline-fold');
const collapse = require('./collapse');
const slug = require('./outline-slug');

/* a heading lands this far below the scroller top — still inside the observer band */
const TOP_OFFSET = 16;

const DEFAULTS = {
  // With no headings, list the "header:" lines instead. A boolean, or a
  // function when it tracks host state that changes after construction.
  kvLabels: false,
  emptyLabel: 'No headings',
  scrollDuration: [120, 320],
};

function createOutline(config) {
  const c = Object.assign({}, DEFAULTS, config);
  const els = { list: c.list, content: c.content, box: c.actions && c.actions.box };
  let observer = null;
  let animToken = 0;    // cancels the previous animation when a new click arrives
  let lockUntil = 0;    // holds the observer off while a click-scroll is running

  function setActive(link) {
    if (!c.list) return;
    c.list.querySelectorAll('a').forEach((l) => l.classList.remove('outline-active'));
    if (link) link.classList.add('outline-active');
  }

  function reset() {
    if (observer) { observer.disconnect(); observer = null; }
    animToken++;
    lockUntil = 0;
  }

  function clear() {
    reset();
    if (c.list) c.list.innerHTML = '';
    if (c.section) c.section.style.display = 'none';
    // The toggles went with the list, so the expand/collapse pair must not
    // outlive them.
    fold.updateActions(els);
  }

  // Deliberately faster than the browser's behavior:'smooth', which reads as
  // sluggish for a jump the user just asked for by clicking.
  function scrollTo(h) {
    const sc = c.scroller;
    const win = sc.ownerDocument.defaultView;
    const from = sc.scrollTop;
    const delta = h.getBoundingClientRect().top - sc.getBoundingClientRect().top - TOP_OFFSET;
    const max = Math.max(0, sc.scrollHeight - sc.clientHeight);
    const to = Math.min(max, Math.max(0, from + delta));
    const dist = Math.abs(to - from);
    const token = ++animToken;
    if (dist < 2) { sc.scrollTop = to; return; }

    const dur = Math.min(c.scrollDuration[1], Math.max(c.scrollDuration[0], dist * 0.18));
    lockUntil = win.performance.now() + dur + 150;
    const t0 = win.performance.now();
    const step = (now) => {
      if (token !== animToken) return;
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);            // easeOutCubic
      sc.scrollTop = from + (to - from) * e;
      if (p < 1) win.requestAnimationFrame(step);
      else lockUntil = win.performance.now() + 150;
    };
    win.requestAnimationFrame(step);
  }

  function collect() {
    const headings = c.content.querySelectorAll('h2, h3');
    if (headings.length) {
      return Array.from(headings, (h) => ({ el: h, text: h.textContent.trim(), sub: h.tagName === 'H3' }));
    }
    if (!(typeof c.kvLabels === 'function' ? c.kvLabels() : c.kvLabels)) return [];
    // No markdown headings, but every "header: content" line is one — list them
    // so a flat document stays navigable.
    return Array.from(c.content.querySelectorAll('p .kv-label'), (l) => {
      const text = l.textContent.replace(/[:=]\s*$/, '').trim();
      return { el: l.closest('p'), text: text || l.textContent.trim(), sub: false };
    });
  }

  function observe(items) {
    const win = c.scroller.ownerDocument.defaultView;
    if (!win.IntersectionObserver) return;
    const visible = new Set();
    observer = new win.IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) visible.add(e.target.id);
        else visible.delete(e.target.id);
      });
      if (win.performance.now() < lockUntil) return;   // a click-scroll owns the highlight
      if (visible.size === 0) return;
      // First item in DOCUMENT order, independent of callback order.
      for (const it of items) {
        if (visible.has(it.el.id)) {
          setActive(c.list.querySelector('a[href="#' + it.el.id + '"]'));
          break;
        }
      }
    }, { root: c.scroller, rootMargin: '-8px 0px -70% 0px' });
    items.forEach((it) => observer.observe(it.el));
  }

  // An empty outline leaves the panel OPEN and says so. Collapsing it would make
  // the layout jump every time the user moved between a heading-rich file and a
  // flat one.
  function build() {
    reset();
    if (!c.list || !c.section) return 0;
    const items = collect();
    const doc = c.list.ownerDocument;
    c.list.innerHTML = '';
    c.section.style.display = '';
    if (!items.length) {
      const li = doc.createElement('li');
      li.className = 'outline-empty';
      li.textContent = c.emptyLabel;
      c.list.appendChild(li);
      fold.updateActions(els);
      return 0;
    }

    slug.assignIds(items);
    items.forEach((it) => {
      const h = it.el;
      const li = doc.createElement('li');
      const a = doc.createElement('a');
      a.href = '#' + h.id;
      a.textContent = it.text;
      a.className = it.sub ? 'outline-h3' : 'outline-h2';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const tgt = doc.getElementById(h.id) || h;
        if (!tgt) return;
        collapse.revealCollapsedTarget(tgt);   // it may sit in a folded section
        setActive(a);                          // pin it so the observer cannot override
        scrollTo(tgt);
      });
      li.appendChild(a);
      c.list.appendChild(li);
    });

    fold.bindFolding(c.list);
    fold.updateActions(els);
    observe(items);
    return items.length;
  }

  if (c.actions) {
    fold.bindActions({ list: c.list, content: c.content, box: c.actions.box, expand: c.actions.expand, collapse: c.actions.collapse });
  }

  return {
    build, clear, setActive,
    updateActions: () => fold.updateActions(els),
    setAllFolds: (open) => fold.setAllFolds(els, open),
  };
}

module.exports = {
  createOutline, TOP_OFFSET, DEFAULTS,
  slugifyHeading: slug.slugifyHeading, uniqueSlug: slug.uniqueSlug,
};
