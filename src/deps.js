'use strict';

/* ================= third-party deps =================
   marked, highlight.js and mermaid are PEER dependencies: the bundle never
   imports them, so a host that only needs plain rendering pays nothing for
   mermaid's 3.4 MB. Each is looked up lazily at call time, so load order stops
   mattering — a host may pull mermaid in after md-editor.

   Resolution order per dep: an explicit configure() override, then the global
   the classic <script> builds install (window.marked / window.hljs /
   window.mermaid). */

const overrides = {};

function configure(deps) {
  for (const k of ['marked', 'hljs', 'mermaid']) {
    if (deps && deps[k]) overrides[k] = deps[k];
  }
}

function dep(name) {
  return overrides[name] || (typeof globalThis !== 'undefined' ? globalThis[name] : undefined);
}

// marked is the one hard requirement — every entry point parses markdown.
function marked() {
  const m = dep('marked');
  if (!m) throw new Error('md-editor: marked not found. Load marked before md-editor, or call MdEditor.configure({ marked }).');
  return m;
}

// hljs and mermaid are optional: missing means "skip that step", not an error,
// so a host can ship syntax-highlight-free or diagram-free without branching.
function hljs() { return dep('hljs'); }
function mermaid() { return dep('mermaid'); }

module.exports = { configure, marked, hljs, mermaid };
