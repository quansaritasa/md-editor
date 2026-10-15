'use strict';

/* ================= draw a diagram only when it nears the view =================
   mermaid takes 100 ms and more per diagram, and render() used to draw every
   one before it returned — a document with 45 of them stayed blank for six
   seconds. With `mermaidLazy` on, a fence stays a code block until it scrolls
   within `mermaidLazyMargin` of the view, then is drawn. Draws run one at a
   time: mermaid measures text in a shared scratch element, so two at once
   corrupt each other. A newer render() of the same root drops the old watch. */

const watches = new WeakMap(); // root -> IntersectionObserver

// The observer has to watch the element that scrolls: rootMargin only widens
// the observer's own root, so with the viewport as root a diagram just below
// a scrolling viewer's fold would count as hidden until it was on screen.
function scrollParent(el) {
  const win = el.ownerDocument.defaultView;
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    const s = win.getComputedStyle(n);
    if (/(auto|scroll)/.test(s.overflowY + ' ' + s.overflow)) return n;
  }
  return null;
}

function stop(root) {
  const io = watches.get(root);
  if (io) io.disconnect();
  watches.delete(root);
}

// Watches each <pre> and hands it to draw(pre) once it nears the view.
// False when the page has no IntersectionObserver — the caller draws eagerly.
function watch(root, pres, draw, options) {
  stop(root);
  const IO = root.ownerDocument.defaultView && root.ownerDocument.defaultView.IntersectionObserver;
  if (!IO) return false;
  const o = options || {};
  let queue = Promise.resolve();
  const io = new IO((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const pre = e.target;
      // A document replaced while this waited in line has nothing left to draw.
      queue = queue
        .then(() => (pre.isConnected ? draw(pre) : null))
        .catch((err) => console.warn('md-editor: mermaid failed:', err));
    }
  }, { root: scrollParent(root), rootMargin: o.mermaidLazyMargin || '800px 0px' });
  pres.forEach((pre) => io.observe(pre));
  watches.set(root, io);
  return true;
}

module.exports = { watch, stop, scrollParent };
