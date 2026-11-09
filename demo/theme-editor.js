'use strict';

/* The theme editor page: a theme list on the left, the document on the stage,
   and the attributes that write the override on the right.

   The override is ONE <style> in <head>, appended after the theme link and the
   base sheet, and every rule in it is scoped by #te-preview — an id, so it
   outranks the themes' `.md-editor` rules whatever order they load in. Nothing
   here writes into themes/*.css: what the author keeps is the exported text,
   and the preview is the same builder with a different selector.

   The pieces around this file: theme-editor-read.js measures the theme's own
   values, theme-editor-panel.js draws the rows, theme-editor-picker.js docks the
   vendored colour picker as a popup under a chip, theme-css.js turns overrides into CSS. */

const GROUPS = window.TE_FIELDS;
const TECSS = window.TE_CSS;

const root = document.getElementById('te-preview');
const link = document.getElementById('te-theme-css');
const stage = document.getElementById('te-stage');

const state = {
  theme: 'card',
  dark: false,
  file: '',
  // One override set per mode: every theme carries a light and a dark block,
  // and a colour that reads on ivory is wrong on charcoal.
  over: { light: {}, dark: {} },
};
const mode = () => (state.dark ? 'dark' : 'light');
const over = () => state.over[mode()];

/* ---------- remembered between visits ---------- */
// Theme, mode and both override sets. localStorage can throw (private window,
// blocked site data) or hold junk, so every touch is guarded and the page
// starts fresh when it fails.
const KEY = 'md-editor.theme-editor';
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ theme: state.theme, dark: state.dark, over: state.over }));
  } catch (e) {}
}
function restore() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!s || typeof s !== 'object') return;
    if (MdEditor.themes.includes(s.theme)) state.theme = s.theme;
    state.dark = !!s.dark;
    for (const m of ['light', 'dark']) {
      const o = s.over && s.over[m];
      if (o && typeof o === 'object' && !Array.isArray(o)) state.over[m] = o;
    }
  } catch (e) {}
}

const reader = TE_READ.createReader(root);
const picker = TE_PICKER.createPicker();
const panel = TE_PANEL.createPanel({
  groups: GROUPS,
  box: document.getElementById('te-groups'),
  reader,
  over,
  picker,
  onEdit: (key, value) => {
    over()[key] = value;
    apply();
  },
  onClear: (key) => {
    delete over()[key];
    apply();
  },
});

/* ---------- the override sheet ---------- */
// The stage wears the theme's page colour: without it a 760px column sits on
// the app's grey and reads as a card, not as the page a reader gets. Read from
// the preview, so an overridden --bg reaches the stage as well.
function mirrorStage() {
  stage.style.setProperty('--te-page',
    TECSS.toHex(getComputedStyle(root).getPropertyValue('--bg')) || '');
}

function overrideEl() {
  let el = document.getElementById('te-override');
  if (!el) {
    el = document.createElement('style');
    el.id = 'te-override';
    document.head.appendChild(el);
  }
  return el;
}

// The Changes log: one line per overridden field, "was -> now". "Was" is the
// theme's own value, measured with the override sheet emptied for a moment
// (synchronously, so nothing paints) and then put back.
function fmt(f, v) {
  return f.kind === 'color' ? String(v) : v + 'px';
}
function renderChanges() {
  const keys = Object.keys(over());
  const log = document.getElementById('te-log');
  document.getElementById('te-nchanges').textContent = keys.length ? '· ' + keys.length + ' ' + mode() : '';
  if (!keys.length) { log.value = ''; return; }
  const el = overrideEl();
  const css = el.textContent;
  el.textContent = '';
  const lines = [];
  for (const r of panel.rows) {
    if (!(r.f.k in over())) continue;
    const base = r.f.kind === 'color' ? reader.color(r.g, r.f) : Math.round(reader.length(r.g, r.f));
    const was = base === '' || Number.isNaN(base) ? '?' : fmt(r.f, base);
    lines.push(r.g.label + ' · ' + r.f.label + ': ' + was + ' → ' + fmt(r.f, over()[r.f.k]));
  }
  el.textContent = css;
  log.value = lines.join('\n');
}

function apply() {
  overrideEl().textContent = TECSS.buildCss(GROUPS, over(), '#te-preview', '');
  mirrorStage();
  renderChanges();
  save();
}

function prefill() {
  panel.prefill();
  renderChanges();
  document.getElementById('te-which').textContent = mode();
  mirrorStage();
}

/* ---------- themes, document, export ---------- */
function setTheme(name) {
  state.theme = name;
  save();
  link.setAttribute('href', '../dist/themes/' + name + '.css');
  document.querySelectorAll('.te-theme').forEach((b) => {
    b.classList.toggle('active', b.dataset.theme === name);
  });
  document.getElementById('te-name').textContent = state.file ? state.file + ' · ' + name : name;
}

function buildThemes() {
  const box = document.getElementById('te-theme-list');
  for (const name of MdEditor.themes) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'te-theme';
    b.dataset.theme = name;
    b.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    b.addEventListener('click', () => setTheme(name));
    box.appendChild(b);
  }
}

async function show(text, name) {
  state.file = name || 'untitled.md';
  document.getElementById('te-name').textContent = state.file + ' · ' + state.theme;
  await MdEditor.mount(root, text, { docPath: location.href });
  stage.scrollTop = 0;
  apply();
  prefill();
  document.title = state.file + ' — md-editor theme editor';
}

function exportText() {
  const parts = ['/* md-editor theme override — ' + state.theme + '\n'
    + '   Load it after ' + state.theme + '.css. Only the tokens and rules the\n'
    + '   author changed are here; everything else stays the theme\'s own. */'];
  const light = state.over.light;
  const dark = state.over.dark;
  if (Object.keys(light).length) parts.push(TECSS.buildCss(GROUPS, light, '.md-editor', ''));
  if (Object.keys(dark).length) parts.push(TECSS.buildCss(GROUPS, dark, '.md-editor', 'html.dark '));
  return parts.join('\n\n') + '\n';
}

function status(msg, ok) {
  const el = document.getElementById('te-status');
  el.textContent = msg;
  el.classList.toggle('ok', !!ok);
  clearTimeout(status.t);
  status.t = setTimeout(() => { el.textContent = ''; }, 2400);
}

/* ---------- resizable left column ---------- */
const WKEY = 'md-editor.theme-editor.left';
function setLeft(px) {
  document.getElementById('te-main').style.setProperty('--te-left',
    Math.max(140, Math.min(520, Math.round(px))) + 'px');
}
function bindResize() {
  try { const w = Number(localStorage.getItem(WKEY)); if (w) setLeft(w); } catch (e) {}
  const bar = document.getElementById('te-resize');
  const main = document.getElementById('te-main');
  bar.addEventListener('pointerdown', (e) => {
    bar.setPointerCapture(e.pointerId);
    bar.classList.add('drag');
    document.body.classList.add('te-resizing');
  });
  bar.addEventListener('pointermove', (e) => {
    if (bar.hasPointerCapture(e.pointerId)) setLeft(e.clientX - main.getBoundingClientRect().left);
  });
  const end = (e) => {
    bar.classList.remove('drag');
    document.body.classList.remove('te-resizing');
    try { localStorage.setItem(WKEY, parseInt(main.style.getPropertyValue('--te-left'), 10) || ''); } catch (err) {}
  };
  bar.addEventListener('pointerup', end);
  bar.addEventListener('pointercancel', end);
}

function bindBar() {
  bindResize();
  document.getElementById('te-dark').addEventListener('change', (e) => {
    state.dark = e.target.checked;
    document.documentElement.classList.toggle('dark', state.dark);
    picker.setDark(state.dark);
    apply();
    prefill();
  });
  document.getElementById('te-reset').addEventListener('click', () => {
    state.over[mode()] = {};
    apply();
    prefill();
    status('Cleared the ' + mode() + ' changes', true);
  });
  document.getElementById('te-copy').addEventListener('click', async () => {
    const text = exportText();
    try {
      await navigator.clipboard.writeText(text);
      status('CSS copied', true);
      return;
    } catch (e) {}
    // A page opened from disk has no clipboard permission to write to, so the
    // old selection trick is the path that works there.
    let ok = false;
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand('copy');
      ta.remove();
    } catch (e) {}
    status(ok ? 'CSS copied' : 'Clipboard refused — use Download', ok);
  });
  document.getElementById('te-download').addEventListener('click', () => {
    const blob = new Blob([exportText()], { type: 'text/css' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = state.theme + '-override.css';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    status('Saved ' + a.download, true);
  });
  const file = document.getElementById('te-file');
  document.querySelector('label[for="te-file"]').addEventListener('click', (e) => {
    e.preventDefault();
    file.click();
  });
  file.addEventListener('change', async () => {
    const f = file.files && file.files[0];
    if (!f) return;
    const text = await f.text();
    file.value = '';      // so the same file can be opened again
    await show(text, f.name);
  });
}

(function init() {
  document.getElementById('te-ver').textContent = 'v' + MdEditor.version;
  buildThemes();
  panel.build();
  bindBar();
  restore();
  document.getElementById('te-dark').checked = state.dark;
  document.documentElement.classList.toggle('dark', state.dark);
  picker.setDark(state.dark);
  // The sheet's load is the only signal that the new theme's rules are in
  // place; measuring before it fires reads the previous theme's numbers.
  link.addEventListener('load', () => { if (panel.rows.length) prefill(); });
  setTheme(state.theme);
  const doc = window.TE_DOC || { name: 'untitled.md', text: '# Empty\n' };
  show(doc.text, doc.name);
})();
