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

module.exports = { makeBtn };
