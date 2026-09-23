'use strict';

/* ================= mermaid minimap — where am I in this diagram? =================
   A thumbnail of the whole diagram in the canvas corner, with a frame showing
   the part the canvas currently shows. Clicking or dragging on it moves the
   view there, so a user zoomed in on one table never loses the big picture.

   The thumbnail is a second clone of the diagram, scaled down once; only the
   frame moves as the view changes. */

const BOX_W = 220, BOX_H = 160;

function buildBox(doc, clone, w, h, m) {
  const box = doc.createElement('div');
  box.className = 'mermaid-minimap';
  box.style.width = Math.round(w * m) + 'px';
  box.style.height = Math.round(h * m) + 'px';
  const thumb = clone.cloneNode(true);
  thumb.classList.remove('mermaid-fullscreen-diagram');
  thumb.classList.add('mermaid-minimap-diagram');
  thumb.style.transform = 'scale(' + m + ')';
  const frame = doc.createElement('div');
  frame.className = 'mermaid-minimap-frame';
  box.appendChild(thumb);
  box.appendChild(frame);
  return { box, thumb, frame };
}

// Clipped to the thumbnail: zoomed out past the whole diagram, the frame
// would otherwise run off the box and its border vanish.
function frameDrawer(canvas, frame, bw, bh, m) {
  return (v) => {
    const x0 = Math.max(0, (-v.x / v.s) * m), y0 = Math.max(0, (-v.y / v.s) * m);
    const x1 = Math.min(bw, ((canvas.clientWidth - v.x) / v.s) * m);
    const y1 = Math.min(bh, ((canvas.clientHeight - v.y) / v.s) * m);
    frame.style.left = x0 + 'px';
    frame.style.top = y0 + 'px';
    frame.style.width = Math.max(0, x1 - x0) + 'px';
    frame.style.height = Math.max(0, y1 - y0) + 'px';
  };
}

// Press or drag on the box: box pixels -> diagram point, centred. Returns detach.
function bindJump(box, view, m) {
  const win = box.ownerDocument.defaultView;
  const jump = (e) => {
    const r = box.getBoundingClientRect();
    view.panTo((e.clientX - r.left) / m, (e.clientY - r.top) / m);
  };
  let dragging = false;
  box.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    jump(e);
  });
  box.addEventListener('click', (e) => e.stopPropagation());
  const onMove = (e) => { if (dragging) jump(e); };
  const onUp = () => { dragging = false; };
  win.addEventListener('mousemove', onMove);
  win.addEventListener('mouseup', onUp);
  return () => {
    win.removeEventListener('mousemove', onMove);
    win.removeEventListener('mouseup', onUp);
  };
}

function attach(canvas, clone, view) {
  const { w, h } = view.size();
  const m = Math.min(BOX_W / w, BOX_H / h);
  if (!isFinite(m) || m <= 0) return null;
  const { box, thumb, frame } = buildBox(canvas.ownerDocument, clone, w, h, m);
  canvas.appendChild(box);
  view.onChange(frameDrawer(canvas, frame, w * m, h * m, m));
  return { svg: thumb.querySelector('svg'), detach: bindJump(box, view, m) };
}

module.exports = { attach };
