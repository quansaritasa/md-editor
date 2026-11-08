'use strict';

/* The theme editor page: a theme list on the left, the document on the stage,
   and the attributes that write the override on the right.

   The override is ONE <style> in <head>, appended after the theme link and the
   base sheet, and every rule in it is scoped by #te-preview — an id, so it
   outranks the themes' `.md-editor` rules whatever order they load in. Nothing
   here writes into themes/*.css: what the author keeps is the exported text,
   and the preview is the same builder with a different selector.

   The pieces around this file: theme-editor-read.js measures the theme's own
   values, theme-editor-panel.js draws the rows, theme-editor-palette.js is the
   sixty-swatch picker, theme-css.js turns overrides into CSS. */

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

const reader = TE_READ.createReader(root);
const picker = TE_PICKER.createPicker(document.getElementById('te-palette'), window.TE_PALETTE);
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
});

/* ---------- the override sheet ---------- */
// The stage wears the theme's page colour: without it a 760px column sits on
// the app's grey and reads as a card, not as the page a reader gets. Read from
// the preview, so an overridden --bg reaches the stage as well.
function mirrorStage() {
  stage.style.setProperty('--te-page',
    TECSS.toHex(getComputedStyle(root).getPropertyValue('--bg')) || '');
}

function apply() {
  let el = document.getElementById('te-override');
  if (!el) {
    el = document.createElement('style');
    el.id = 'te-override';
    document.head.appendChild(el);
  }
  el.textContent = TECSS.buildCss(GROUPS, over(), '#te-preview', '');
  mirrorStage();
}

function prefill() {
  panel.prefill();
  document.getElementById('te-which').textContent = mode();
  mirrorStage();
}

/* ---------- themes, document, export ---------- */
function setTheme(name) {
  state.theme = name;
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

function bindBar() {
  document.getElementById('te-dark').addEventListener('change', (e) => {
    state.dark = e.target.checked;
    document.documentElement.classList.toggle('dark', state.dark);
    apply();
    prefill();
  });
  document.getElementById('te-reset').addEventListener('click', () => {
    state.over[mode()] = {};
    apply();
    prefill();
    status('Cleared the ' + mode() + ' overrides', true);
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
  // The sheet's load is the only signal that the new theme's rules are in
  // place; measuring before it fires reads the previous theme's numbers.
  link.addEventListener('load', () => { if (panel.rows.length) prefill(); });
  setTheme('card');
  const doc = window.TE_DOC || { name: 'untitled.md', text: '# Empty\n' };
  show(doc.text, doc.name);
})();
