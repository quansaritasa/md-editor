'use strict';

/* ================= mermaid zoom / pan / fullscreen ================= */

// The overlay is parented into the MOUNT element rather than <body>, because
// the rule that styles it is scoped there — move it out and it loses every
// style. Its `position: fixed; z-index: 9999` is what lifts it above host
// chrome. That holds only while the mount element creates no stacking context:
// give it a transform, filter or opacity and a blown-up diagram is trapped
// behind it.
function overlayHost(root, options) {
  return (options && options.overlayParent) || root;
}

function makeBtn(doc, text, action) {
  const b = doc.createElement('button');
  b.className = 'mermaid-zoom-btn';
  b.type = 'button';
  b.textContent = text;
  b.addEventListener('click', (e) => { e.stopPropagation(); action(); });
  return b;
}

function init(root, options) {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  root.querySelectorAll('.mermaid-wrapper').forEach((wrap) => {
    if (wrap.dataset.zoomReady) return;
    wrap.dataset.zoomReady = '1';
    const el = wrap.querySelector('.mermaid');
    if (!el) return;

    let scale = 1, offX = 0, offY = 0;
    const zoomLabel = doc.createElement('span');
    zoomLabel.className = 'mermaid-zoom-label';
    zoomLabel.textContent = '100%';
    const update = () => {
      scale = Math.max(0.1, scale);
      el.style.transform = 'translate(' + offX + 'px,' + offY + 'px) scale(' + scale + ')';
      el.style.transformOrigin = 'top left';
      wrap.style.height = (el.getBoundingClientRect().height * 1.15) + 'px';
      zoomLabel.textContent = Math.round(scale * 100) + '%';
    };
    // Point-anchored zoom: the point under the cursor stays put while the scale
    // changes. transformOrigin is 'top left', so scaling alone makes the diagram
    // drift and the user has to pan after every step. offsetLeft/Top is el's
    // UNTRANSFORMED position inside wrap, which is its offsetParent.
    const zoomAt = (cx, cy, delta) => {
      const next = Math.max(0.1, scale + delta);
      const lx = (cx - el.offsetLeft - offX) / scale;
      const ly = (cy - el.offsetTop - offY) / scale;
      offX = cx - el.offsetLeft - lx * next;
      offY = cy - el.offsetTop - ly * next;
      scale = next;
      update();
    };
    // A button has no cursor to anchor to, so it anchors at the visible centre.
    const zoomCenter = (delta) => zoomAt(wrap.clientWidth / 2, wrap.clientHeight / 2, delta);

    const controls = doc.createElement('div');
    controls.className = 'mermaid-zoom-controls';
    controls.appendChild(makeBtn(doc, '−', () => zoomCenter(-0.3)));
    controls.appendChild(makeBtn(doc, '⊕', () => { scale = 1; offX = 0; offY = 0; update(); }));
    controls.appendChild(zoomLabel);
    controls.appendChild(makeBtn(doc, '+', () => zoomCenter(0.3)));
    controls.appendChild(makeBtn(doc, '⛶', () => openFullscreen(el, overlayHost(root, options))));
    wrap.appendChild(controls);

    let panning = false, px = 0, py = 0;
    wrap.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      panning = true;
      px = e.clientX; py = e.clientY;
      wrap.style.cursor = 'grabbing';
    });
    win.addEventListener('mousemove', (e) => {
      if (!panning) return;
      offX += e.clientX - px;
      offY += e.clientY - py;
      px = e.clientX; py = e.clientY;
      update();
    });
    win.addEventListener('mouseup', () => {
      if (!panning) return;
      panning = false;
      wrap.style.cursor = 'grab';
    });
    wrap.addEventListener('wheel', (e) => {
      // Both Ctrl and Cmd: on macOS the reflex is Cmd, and the rest of the app
      // accepts either.
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const r = wrap.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, -Math.sign(e.deltaY) * 0.3);
    }, { passive: false });
  });
}

function openFullscreen(el, parent) {
  const doc = parent.ownerDocument;
  const win = doc.defaultView;
  const overlay = doc.createElement('div');
  overlay.className = 'mermaid-fullscreen-overlay';
  const canvas = doc.createElement('div');
  canvas.className = 'mermaid-fullscreen-canvas';
  const clone = el.cloneNode(true);
  clone.style.transform = 'none';

  let fsScale = 1, fsX = 0, fsY = 0;
  const fsLabel = doc.createElement('span');
  fsLabel.className = 'mermaid-zoom-label';
  fsLabel.textContent = '100%';
  const fsUpdate = () => {
    fsScale = Math.max(0.1, fsScale);
    clone.style.transform = 'translate(' + fsX + 'px,' + fsY + 'px) scale(' + fsScale + ')';
    clone.style.transformOrigin = 'center center';
    fsLabel.textContent = Math.round(fsScale * 100) + '%';
  };
  const autoFit = () => {
    clone.style.transform = 'none';
    const rect = clone.getBoundingClientRect();
    const natW = rect.width || 800;
    const natH = rect.height || 600;
    fsScale = Math.min((win.innerWidth * 0.85) / natW, (win.innerHeight * 0.85) / natH);
    fsX = 0; fsY = 0;
    fsUpdate();
  };
  canvas.appendChild(clone);
  const fsControls = doc.createElement('div');
  fsControls.className = 'mermaid-zoom-controls';
  fsControls.style.top = '16px';
  fsControls.style.right = '16px';
  fsControls.appendChild(makeBtn(doc, '−', () => { fsScale -= 1.5; fsUpdate(); }));
  fsControls.appendChild(makeBtn(doc, '⊕', () => autoFit()));
  fsControls.appendChild(fsLabel);
  fsControls.appendChild(makeBtn(doc, '+', () => { fsScale += 1.5; fsUpdate(); }));
  canvas.appendChild(fsControls);
  overlay.appendChild(canvas);
  parent.appendChild(overlay);
  autoFit();

  const close = () => { overlay.remove(); doc.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
  doc.addEventListener('keydown', onKey);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  let fsPanning = false, fspx = 0, fspy = 0;
  canvas.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    fsPanning = true;
    fspx = e.clientX; fspy = e.clientY;
    canvas.style.cursor = 'grabbing';
  });
  win.addEventListener('mousemove', (e) => {
    if (!fsPanning) return;
    fsX += e.clientX - fspx;
    fsY += e.clientY - fspy;
    fspx = e.clientX; fspy = e.clientY;
    fsUpdate();
  });
  win.addEventListener('mouseup', () => { fsPanning = false; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey)) { fsY -= e.deltaY; fsUpdate(); return; }
    e.preventDefault();
    const rect = clone.getBoundingClientRect();
    const c0x = rect.x + rect.width / 2 - fsX;    // centre before any translation
    const c0y = rect.y + rect.height / 2 - fsY;
    const vx = (e.clientX - c0x - fsX) / fsScale; // vector from the centre, original units
    const vy = (e.clientY - c0y - fsY) / fsScale;
    const next = Math.max(0.1, fsScale - Math.sign(e.deltaY) * 1.5);
    fsX = e.clientX - c0x - vx * next;
    fsY = e.clientY - c0y - vy * next;
    fsScale = next;
    fsUpdate();
  }, { passive: false });

  return { close };
}

module.exports = { init, openFullscreen };
