'use strict';

/* ================= code block Copy / Wrap / Copy Full ================= */

const { createAdapter } = require('../adapter');

function flash(btn, text, revertTo, ok) {
  btn.textContent = text;
  if (ok) btn.classList.add('copied');
  setTimeout(() => { btn.textContent = revertTo; btn.classList.remove('copied'); }, 1500);
}

function codeOf(btn) {
  const block = btn.closest('.code-block');
  return block ? block.querySelector('pre code') : null;
}

async function copy(win, text) {
  if (!win.navigator || !win.navigator.clipboard) throw new Error('no clipboard');
  await win.navigator.clipboard.writeText(text);
}

async function readInject(adapter, docPath) {
  if (!docPath || typeof adapter.readInject !== 'function') return null;
  try { return await adapter.readInject(docPath); } catch (e) {
    console.error('md-editor: readInject failed:', e);
    return null;
  }
}

// "Copy Full" only means anything when a _pre or _post snippet sits beside the
// document; with neither on disk it copies exactly what Copy copies, so it stays
// hidden rather than sitting there as a duplicate. The markup ships it hidden
// and this reveals it once the check comes back.
async function syncFullButtons(root, adapter, docPath) {
  const btns = root.querySelectorAll('.code-full-btn');
  if (!btns.length) return false;
  const inject = await readInject(adapter, docPath);
  const has = !!(inject && ((inject.pre && inject.pre.trim()) || (inject.post && inject.post.trim())));
  btns.forEach((b) => { b.style.display = has ? '' : 'none'; });
  return has;
}

const BIND_DEFAULTS = {
  docPath: '',        // '' leaves Copy Full hidden: there is nothing to inject
  editableCode: false,
  fullButton: true,
};

// A read-only secondary view (a compare pane, say) passes editableCode:false and
// fullButton:false: "Copy Full" there would splice in the OTHER document's
// _pre/_post, and an editable code block in a pane edits nothing.
function bind(root, options) {
  const o = Object.assign({}, BIND_DEFAULTS, options || {});
  const adapter = o.adapter || createAdapter();
  const win = root.ownerDocument.defaultView;

  root.querySelectorAll('.code-copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = codeOf(btn);
      if (!code) return;
      const text = (code.textContent || '').replace(/[\r\n]+$/, '');
      try { await copy(win, text); flash(btn, 'Copied', 'Copy', true); }
      catch (e) { flash(btn, 'Copy failed', 'Copy', false); }
    });
  });

  root.querySelectorAll('.code-full-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = codeOf(btn);
      if (!code) return;
      const codeText = (code.textContent || '').replace(/[\r\n]+$/, '').trim();
      const inject = await readInject(adapter, o.docPath);
      const parts = [];
      if (inject && inject.pre) parts.push(inject.pre.trim());
      parts.push(codeText);
      if (inject && inject.post) parts.push(inject.post.trim());
      try { await copy(win, parts.join('\n\n')); flash(btn, 'Copied', 'Copy Full', true); }
      catch (e) { flash(btn, 'Copy failed', 'Copy Full', false); }
    });
  });

  if (o.fullButton) syncFullButtons(root, adapter, o.docPath);
  if (o.editableCode) {
    root.querySelectorAll('.code-block pre code').forEach((code) => code.setAttribute('contenteditable', 'true'));
  }

  // Wrapping starts ON: a long line scrolled off-screen reads as truncated.
  root.querySelectorAll('.code-wrap-btn').forEach((btn) => {
    const code = codeOf(btn);
    if (!code) return;
    const setWrap = (on) => {
      code.style.whiteSpace = on ? 'pre-wrap' : '';
      code.style.wordBreak = on ? 'break-word' : '';
      btn.textContent = on ? 'Unwrap' : 'Wrap';
      btn.classList.toggle('active', on);
    };
    setWrap(true);
    btn.addEventListener('click', () => setWrap(code.style.whiteSpace !== 'pre-wrap'));
  });
}

module.exports = { bind, syncFullButtons, BIND_DEFAULTS };
