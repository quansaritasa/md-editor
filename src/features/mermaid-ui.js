'use strict';

/* Small DOM helpers the mermaid zoom, fullscreen and search pieces share. */

function makeBtn(doc, text, action, title) {
  const b = doc.createElement('button');
  b.className = 'mermaid-zoom-btn';
  b.type = 'button';
  b.textContent = text;
  if (title) b.title = title;
  b.addEventListener('click', (e) => { e.stopPropagation(); action(); });
  return b;
}

// Put `el` into the OS's fullscreen and report the way out. The browser owns
// Esc while fullscreen, so leaving it by any route — Esc, F11, the OS — calls
// onExit once. onEnter runs when the element really filled the screen, which
// is when a view sized to it should re-fit. A host without the Fullscreen API,
// or one that refuses (no user gesture, a sandboxed frame), keeps the overlay
// as it is. Returns a function that leaves fullscreen if still in it.
function osFullscreen(el, onEnter, onExit) {
  const doc = el.ownerDocument;
  if (typeof el.requestFullscreen !== 'function') return () => {};
  let inside = false;
  const onChange = () => {
    if (doc.fullscreenElement === el) { inside = true; onEnter(); return; }
    if (!inside) return;
    inside = false;
    doc.removeEventListener('fullscreenchange', onChange);
    onExit();
  };
  doc.addEventListener('fullscreenchange', onChange);
  Promise.resolve().then(() => el.requestFullscreen()).catch(() => doc.removeEventListener('fullscreenchange', onChange));
  return () => {
    doc.removeEventListener('fullscreenchange', onChange);
    if (doc.fullscreenElement === el && doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
  };
}

// A mouse or trackpad reports moves faster than the screen redraws — often
// several per frame — and every pan used to restyle and repaint the diagram.
// Sum the deltas and pan once per frame; flush() applies what is pending now.
function panBatcher(win, pan) {
  const raf = win && win.requestAnimationFrame
    ? (f) => win.requestAnimationFrame(f) : (f) => setTimeout(f, 16);
  let dx = 0, dy = 0, queued = false;
  const flush = () => {
    queued = false;
    const x = dx, y = dy;
    dx = 0; dy = 0;
    if (x || y) pan(x, y);
  };
  return {
    add(x, y) {
      dx += x; dy += y;
      if (!queued) { queued = true; raf(flush); }
    },
    flush,
  };
}

// While dragging, the diagram gets its own compositor layer, so moving it
// only shifts pixels already drawn instead of repainting every table and
// label. Only while dragging: a layer kept through a zoom stays rasterised at
// the old scale and turns blurry.
function setDragLayer(el, on) {
  el.style.willChange = on ? 'transform' : '';
}

module.exports = { makeBtn, osFullscreen, panBatcher, setDragLayer };
