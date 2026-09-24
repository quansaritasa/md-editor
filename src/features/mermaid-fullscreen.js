'use strict';

/* ================= mermaid fullscreen — a blown-up, steerable copy =================
   The diagram is cloned into an overlay and moved with one transform:
   translate(x, y) scale(s) from the top-left corner. A point p of the diagram
   therefore sits at x + p·s inside the canvas, and the view can be driven from
   code — the minimap and table search both need to say "show me there".

   Every listener this adds to the window or document is removed on close; an
   earlier version left a mousemove handler behind for every diagram opened. */

const focusLib = require('./mermaid-focus');
const minimap = require('./mermaid-minimap');
const search = require('./mermaid-search');
const relations = require('./mermaid-relations');
const { makeBtn, osFullscreen } = require('./mermaid-ui');

const STEP = 1.25;     // one zoom notch, multiplied — even steps at 5% and at 400%
const MIN = 0.05, MAX = 8;
const FIT = 0.95;      // share of the canvas a fitted diagram fills

// Pin the SVG to its drawn size: mermaid ships width="100%" plus a max-width,
// which inside an absolutely placed clone would collapse to nothing.
function pinSize(svg) {
  const vb = svg && svg.viewBox && svg.viewBox.baseVal;
  if (!vb || !vb.width) return;
  svg.style.maxWidth = 'none';
  svg.setAttribute('width', vb.width);
  svg.setAttribute('height', vb.height);
}

function createView(canvas, clone, label) {
  const listeners = [];
  const v = { x: 0, y: 0, s: 1 };
  const apply = () => {
    clone.style.transform = 'translate(' + v.x + 'px,' + v.y + 'px) scale(' + v.s + ')';
    label.textContent = Math.round(v.s * 100) + '%';
    listeners.forEach((fn) => fn(v));
  };
  const size = () => ({ w: clone.offsetWidth || 800, h: clone.offsetHeight || 600 });
  const view = {
    get: () => ({ x: v.x, y: v.y, s: v.s, W: canvas.clientWidth, H: canvas.clientHeight }),
    size,
    onChange(fn) { listeners.push(fn); },
    pan(dx, dy) { v.x += dx; v.y += dy; apply(); },
    // Zoom to `s`, keeping canvas point (cx, cy) fixed under the cursor.
    zoomAt(cx, cy, s) {
      const next = Math.min(MAX, Math.max(MIN, s));
      v.x = cx - ((cx - v.x) / v.s) * next;
      v.y = cy - ((cy - v.y) / v.s) * next;
      v.s = next;
      apply();
    },
    step(dir) { view.zoomAt(canvas.clientWidth / 2, canvas.clientHeight / 2, v.s * Math.pow(STEP, dir)); },
    // Centre diagram point (px, py) in the canvas.
    panTo(px, py) { v.x = canvas.clientWidth / 2 - px * v.s; v.y = canvas.clientHeight / 2 - py * v.s; apply(); },
    fit() {
      const { w, h } = size();
      v.s = Math.min((canvas.clientWidth * FIT) / w, (canvas.clientHeight * FIT) / h) || 1;
      v.x = (canvas.clientWidth - w * v.s) / 2;
      v.y = (canvas.clientHeight - h * v.s) / 2;
      apply();
    },
    // Bring an element of the clone to the centre, zoomed in to at least `minScale`.
    centerOn(el, minScale) {
      const r = el.getBoundingClientRect();
      const c = clone.getBoundingClientRect();
      const px = (r.left + r.width / 2 - c.left) / v.s;
      const py = (r.top + r.height / 2 - c.top) / v.s;
      if (minScale && v.s < minScale) v.s = Math.min(MAX, minScale);
      view.panTo(px, py);
    },
  };
  return view;
}

function bindPointer(canvas, view, win) {
  let drag = null;
  const onMove = (e) => {
    if (!drag) return;
    view.pan(e.clientX - drag.x, e.clientY - drag.y);
    drag = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => { drag = null; canvas.style.cursor = 'grab'; };
  canvas.addEventListener('mousedown', (e) => {
    if (e.target.closest('button, input, .mermaid-zoom-controls, .mermaid-minimap')) return;
    drag = { x: e.clientX, y: e.clientY };
    canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (!(e.ctrlKey || e.metaKey)) { view.pan(-e.deltaX, -e.deltaY); return; }
    const r = canvas.getBoundingClientRect();
    const s = view.get().s * Math.pow(STEP, -Math.sign(e.deltaY));
    view.zoomAt(e.clientX - r.left, e.clientY - r.top, s);
  }, { passive: false });
  win.addEventListener('mousemove', onMove);
  win.addEventListener('mouseup', onUp);
  return () => { win.removeEventListener('mousemove', onMove); win.removeEventListener('mouseup', onUp); };
}

// Overlay > canvas > (diagram clone, controls). Nothing is wired yet.
function buildShell(el, parent) {
  const doc = parent.ownerDocument;
  const overlay = doc.createElement('div');
  overlay.className = 'mermaid-fullscreen-overlay';
  const canvas = doc.createElement('div');
  canvas.className = 'mermaid-fullscreen-canvas';
  const clone = el.cloneNode(true);
  clone.classList.add('mermaid-fullscreen-diagram');
  clone.style.transform = '';
  pinSize(clone.querySelector('svg'));
  const label = doc.createElement('span');
  label.className = 'mermaid-zoom-label';
  const controls = doc.createElement('div');
  controls.className = 'mermaid-zoom-controls';
  controls.style.top = '16px';
  controls.style.right = '16px';
  canvas.appendChild(clone);
  canvas.appendChild(controls);
  overlay.appendChild(canvas);
  parent.appendChild(overlay);
  return { doc, overlay, canvas, clone, label, controls };
}

// Esc peels one layer at a time: a focused table first, then the overlay.
function keyHandler(focus, finder, close) {
  return (e) => {
    if (e.target.closest && e.target.closest('.mermaid-search')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      if (focus.key) focus.clear(); else close();
    } else if (e.key === '/' && finder) {
      e.preventDefault();
      finder.open();
    }
  };
}

function openFullscreen(el, parent) {
  const sh = buildShell(el, parent);
  const { doc, overlay, canvas, clone, controls } = sh;
  const view = createView(canvas, clone, sh.label);
  const map = minimap.attach(canvas, clone, view);
  const focus = focusLib.create([clone.querySelector('svg'), map && map.svg]);
  focusLib.bindClicks(canvas, focus, '.mermaid-zoom-controls, .mermaid-minimap, .mermaid-relations');
  const finder = search.attach(controls, focus, view);
  // ER only: the panel's model comes from the source mermaid.render kept on el.
  const svg = clone.querySelector('svg');
  const rel = svg && svg.classList.contains('erDiagram')
    ? relations.attach(canvas, focus, view, el.getAttribute('data-mermaid-src')) : null;
  controls.appendChild(makeBtn(doc, '−', () => view.step(-1)));
  controls.appendChild(makeBtn(doc, '⊕', () => view.fit()));
  controls.appendChild(sh.label);
  controls.appendChild(makeBtn(doc, '+', () => view.step(1)));
  view.fit();

  const unbind = bindPointer(canvas, view, doc.defaultView);
  let leaveOs = () => {};
  const close = () => {
    leaveOs();
    overlay.remove();
    doc.removeEventListener('keydown', onKey);
    unbind();
    if (map) map.detach();
    if (rel) rel.detach();
  };
  const onKey = keyHandler(focus, finder, close);
  doc.addEventListener('keydown', onKey);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  // The canvas grows to the whole screen once there, so fit again; leaving
  // OS fullscreen (Esc is the browser's then) closes the view with it.
  leaveOs = osFullscreen(overlay, () => view.fit(), close);
  return { close, view, focus, relations: rel };
}

module.exports = { openFullscreen, createView };
