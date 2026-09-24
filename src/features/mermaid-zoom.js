'use strict';

/* ================= mermaid zoom / pan / fullscreen ================= */

const { makeBtn, panBatcher, setDragLayer } = require('./mermaid-ui');
const { openFullscreen } = require('./mermaid-fullscreen');
const focusLib = require('./mermaid-focus');

// The overlay is parented into the MOUNT element rather than <body>, because
// the rule that styles it is scoped there — move it out and it loses every
// style. Its `position: fixed; z-index: 9999` is what lifts it above host
// chrome. That holds only while the mount element creates no stacking context:
// give it a transform, filter or opacity and a blown-up diagram is trapped
// behind it.
function overlayHost(root, options) {
  return (options && options.overlayParent) || root;
}

// The inline view: one transform on the diagram, the wrapper's height following it.
function inlineView(wrap, el, label) {
  const v = { scale: 1, offX: 0, offY: 0 };
  el.style.transformOrigin = 'top left';
  const place = () => {
    el.style.transform = 'translate(' + v.offX + 'px,' + v.offY + 'px) scale(' + v.scale + ')';
  };
  // Only a scale change can change the height; a pan skips the measuring,
  // which forced a full layout on every mouse move.
  const update = () => {
    v.scale = Math.max(0.1, v.scale);
    place();
    wrap.style.height = (el.getBoundingClientRect().height * 1.15) + 'px';
    label.textContent = Math.round(v.scale * 100) + '%';
  };
  // Point-anchored zoom: the point under the cursor stays put while the scale
  // changes. transformOrigin is 'top left', so scaling alone makes the diagram
  // drift and the user has to pan after every step. offsetLeft/Top is el's
  // UNTRANSFORMED position inside wrap, which is its offsetParent.
  const zoomAt = (cx, cy, delta) => {
    const next = Math.max(0.1, v.scale + delta);
    const lx = (cx - el.offsetLeft - v.offX) / v.scale;
    const ly = (cy - el.offsetTop - v.offY) / v.scale;
    v.offX = cx - el.offsetLeft - lx * next;
    v.offY = cy - el.offsetTop - ly * next;
    v.scale = next;
    update();
  };
  return {
    zoomAt,
    // A button has no cursor to anchor to, so it anchors at the visible centre.
    zoomCenter: (delta) => zoomAt(wrap.clientWidth / 2, wrap.clientHeight / 2, delta),
    reset() { v.scale = 1; v.offX = 0; v.offY = 0; update(); },
    pan(dx, dy) { v.offX += dx; v.offY += dy; place(); },
  };
}

function bindInlinePointer(wrap, el, win, view) {
  let panning = false, px = 0, py = 0;
  const batch = panBatcher(win, (dx, dy) => view.pan(dx, dy));
  wrap.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    panning = true;
    px = e.clientX; py = e.clientY;
    setDragLayer(el, true);
    wrap.style.cursor = 'grabbing';
  });
  win.addEventListener('mousemove', (e) => {
    if (!panning) return;
    batch.add(e.clientX - px, e.clientY - py);
    px = e.clientX; py = e.clientY;
  });
  win.addEventListener('mouseup', () => {
    if (!panning) return;
    panning = false;
    batch.flush();
    setDragLayer(el, false);
    wrap.style.cursor = 'grab';
  });
  wrap.addEventListener('wheel', (e) => {
    // Both Ctrl and Cmd: on macOS the reflex is Cmd, and the rest of the app
    // accepts either.
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    batch.flush();
    const r = wrap.getBoundingClientRect();
    view.zoomAt(e.clientX - r.left, e.clientY - r.top, -Math.sign(e.deltaY) * 0.3);
  }, { passive: false });
}

// Click a table to light it and its neighbours. Read lazily: most diagrams
// are never clicked. Re-read when the SVG was swapped — a theme change
// redraws the diagram in place (mermaid.refreshTheme).
function bindInlineFocus(wrap, el) {
  let focus = null, svg = null;
  focusLib.bindClicks(wrap, {
    get graph() {
      const now = el.querySelector('svg');
      if (!focus || svg !== now) { svg = now; focus = focusLib.create([now]); }
      return focus.graph;
    },
    get key() { return focus && focus.key; },
    toggle(n) { focus.toggle(n); },
    clear() { if (focus) focus.clear(); },
  });
}

function setupWrapper(wrap, root, options) {
  const doc = root.ownerDocument;
  const el = wrap.querySelector('.mermaid');
  if (!el) return;
  const label = doc.createElement('span');
  label.className = 'mermaid-zoom-label';
  label.textContent = '100%';
  const view = inlineView(wrap, el, label);

  const controls = doc.createElement('div');
  controls.className = 'mermaid-zoom-controls';
  controls.appendChild(makeBtn(doc, '−', () => view.zoomCenter(-0.3)));
  controls.appendChild(makeBtn(doc, '⊕', () => view.reset()));
  controls.appendChild(label);
  controls.appendChild(makeBtn(doc, '+', () => view.zoomCenter(0.3)));
  controls.appendChild(makeBtn(doc, '⛶', () => openFullscreen(el, overlayHost(root, options))));
  wrap.appendChild(controls);

  bindInlineFocus(wrap, el);
  bindInlinePointer(wrap, el, doc.defaultView, view);
}

function init(root, options) {
  root.querySelectorAll('.mermaid-wrapper').forEach((wrap) => {
    if (wrap.dataset.zoomReady) return;
    wrap.dataset.zoomReady = '1';
    setupWrapper(wrap, root, options);
  });
}

module.exports = { init, openFullscreen };
