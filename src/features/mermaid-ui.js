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

module.exports = { makeBtn, osFullscreen };
