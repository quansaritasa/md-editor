'use strict';

/* ================= mermaid search — jump to a table by name =================
   A box in the fullscreen toolbar. Typing lists the matching nodes; Enter (or
   a click) focuses the pick and brings it to the centre, zoomed in far enough
   to read. "/" anywhere in the overlay opens it.

   Keys typed here stop at the box: Escape clears it rather than closing the
   overlay, and a host's own shortcuts never see letters meant for the query. */

const MAX_HITS = 8;
const READ_SCALE = 1; // zoom a jumped-to table is shown at, at least

function rank(nodes, q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const scored = [];
  nodes.forEach((n) => {
    const text = (n.label || n.name).toLowerCase();
    const at = Math.min(...[text, n.name.toLowerCase()].map((t) => {
      const i = t.indexOf(needle);
      return i < 0 ? Infinity : i;
    }));
    if (at !== Infinity) scored.push({ n, at });
  });
  scored.sort((a, b) => a.at - b.at || (a.n.label || a.n.name).localeCompare(b.n.label || b.n.name));
  return scored.slice(0, MAX_HITS).map((s) => s.n);
}

function buildBox(doc) {
  const wrap = doc.createElement('div');
  wrap.className = 'mermaid-search';
  const input = doc.createElement('input');
  input.type = 'search';
  input.className = 'mermaid-search-input';
  input.placeholder = 'Find…  /';
  input.setAttribute('aria-label', 'Find a node in this diagram');
  const list = doc.createElement('ul');
  list.className = 'mermaid-search-list';
  wrap.appendChild(input);
  wrap.appendChild(list);
  // Presses stay in the box: no pan, no focus toggle, no overlay close.
  wrap.addEventListener('mousedown', (e) => e.stopPropagation());
  wrap.addEventListener('click', (e) => e.stopPropagation());
  return { wrap, input, list };
}

function bindKeys(input, s) {
  input.addEventListener('input', () => s.query(input.value));
  input.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      s.move(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      s.pickActive();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (input.value) s.reset(); else input.blur();
    }
  });
}

function attach(controls, focus, view) {
  if (!focus.graph.nodes.length) return null;
  const doc = controls.ownerDocument;
  const { wrap, input, list } = buildBox(doc);
  controls.appendChild(wrap);

  let hits = [], active = 0;
  const render = () => {
    list.textContent = '';
    hits.forEach((n, i) => {
      const li = doc.createElement('li');
      li.textContent = n.label || n.name;
      if (i === active) li.className = 'is-active';
      li.addEventListener('mousedown', (e) => { e.preventDefault(); pick(n); });
      list.appendChild(li);
    });
    list.hidden = !hits.length;
  };
  const pick = (n) => {
    if (!n) return;
    focus.set(n.key);
    view.centerOn(n.el, READ_SCALE);
    input.value = n.label || n.name;
    hits = [];
    render();
    input.blur();
  };
  bindKeys(input, {
    query(q) { hits = rank(focus.graph.nodes, q); active = 0; render(); },
    move(d) { if (hits.length) active = (active + d + hits.length) % hits.length; render(); },
    pickActive() { pick(hits[active]); },
    reset() { input.value = ''; hits = []; render(); },
  });
  render();
  return { open() { input.focus(); input.select(); }, input };
}

module.exports = { attach, rank };
