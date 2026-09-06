'use strict';

/* ================= source editor =================
   A controller around a host-supplied <textarea>. It owns the buffer, what is
   believed to be on disk, and the dirty flag; the host owns every visible
   affordance — which element is showing, what the Save button says, whether the
   file is editable at all. */

const { createAdapter } = require('./adapter');

const SOURCE_CLASS = 'md-editor-source';

function createEditor(config) {
  const c = config || {};
  const ta = c.textarea;
  if (!ta) throw new Error('md-editor: createEditor needs a { textarea }.');
  const adapter = c.adapter || createAdapter();
  ta.classList.add(SOURCE_CLASS);

  let editing = false;
  let dirty = false;
  let path = null;
  let source = '';   // what is believed to be on disk, NOT what is in the buffer

  const fire = (name, a, b) => { if (typeof c[name] === 'function') return c[name](a, b); };

  function setDirty(on) {
    if (dirty === on) return;
    dirty = on;
    fire('onDirty', on);
  }

  async function save() {
    if (!editing || path == null) return 'idle';
    const next = ta.value;
    // Typing and then reverting leaves the buffer equal to disk; writing would
    // bump the file's mtime for no change at all.
    if (next === source) { setDirty(false); return 'unchanged'; }
    try {
      await adapter.writeFile(path, next);
    } catch (e) {
      // `source` is deliberately NOT advanced here. It tracks what is on disk,
      // and pretending the write landed would let a later discard "restore"
      // content that was never saved.
      const raw = e && e.message ? e.message : String(e);
      fire('onError', raw.length > 120 ? raw.slice(0, 120) + '…' : raw, e);
      return 'error';
    }
    source = next;
    setDirty(false);
    fire('onSaved', source);
    return 'saved';
  }

  function onInput() {
    // Compared against disk rather than latched on first keystroke, so undoing
    // an edit back to the saved text clears the dirty marker again.
    setDirty(ta.value !== source);
  }

  function onKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  }

  ta.addEventListener('input', onInput);
  ta.addEventListener('keydown', onKeyDown);

  function open(nextPath, nextSource) {
    path = nextPath;
    source = nextSource == null ? '' : String(nextSource);
    ta.value = source;
    editing = true;
    setDirty(false);
    fire('onStateChange', true);
    // Focused on open so Escape and Cmd+S are live immediately, rather than
    // after the user has clicked into the text once.
    if (c.autofocus !== false) ta.focus();
  }

  // Leaving with unsaved edits saves them, mirroring a preview toggle rather
  // than a discard. onExit hands back the text the host should now render —
  // last-saved on a failed write, never the unsaved buffer.
  //
  // Returns 'idle' when not editing, 'closed' when there was nothing pending,
  // and otherwise whatever the save reported: 'saved', 'unchanged' or 'error'.
  async function close(options) {
    if (!editing) return 'idle';
    let result = 'closed';
    if (dirty && !(options && options.discard)) result = await save();
    editing = false;
    setDirty(false);
    fire('onStateChange', false);
    fire('onExit', source);
    return result;
  }

  function cancel() {
    if (!editing) return;
    editing = false;
    ta.value = source;
    setDirty(false);
    fire('onStateChange', false);
    fire('onExit', source);
  }

  return {
    open, close, cancel, save,
    toggle(nextPath, nextSource) {
      return editing ? close() : (open(nextPath, nextSource), Promise.resolve('opened'));
    },
    isEditing: () => editing,
    isDirty: () => dirty,
    value: () => ta.value,
    source: () => source,
    // After something outside the editor rewrote the file.
    setSource(next) {
      source = next == null ? '' : String(next);
      if (!editing) return;
      ta.value = source;
      setDirty(false);
    },
    destroy() {
      ta.removeEventListener('input', onInput);
      ta.removeEventListener('keydown', onKeyDown);
      ta.classList.remove(SOURCE_CLASS);
    },
  };
}

module.exports = { createEditor, SOURCE_CLASS };
