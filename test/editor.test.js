'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { makePage, tick } = require('./helpers/dom');

const MdEditor = require('../src/index');
MdEditor.configure({ marked: require('marked') });

const PATH = '/docs/guide.md';
const SRC = '# Title\n\nbody\n';

// A textarea plus a recording adapter and callback log, which is all the host
// surface the editor actually touches.
function setup(opts) {
  const p = makePage();
  const ta = p.document.createElement('textarea');
  p.document.body.appendChild(ta);
  const log = [];
  const writes = [];
  const adapter = MdEditor.createAdapter({
    writeFile: async (path, text) => {
      if (opts && opts.failWrite) throw new Error(opts.failWrite);
      writes.push([path, text]);
    },
  });
  const ed = MdEditor.createEditor(Object.assign({
    textarea: ta, adapter,
    onDirty: (d) => log.push('dirty:' + d),
    onSaved: () => log.push('saved'),
    onError: (m) => log.push('error:' + m),
    onStateChange: (on) => log.push('editing:' + on),
    onExit: (s) => log.push('exit:' + JSON.stringify(s)),
  }, opts && opts.config));
  const key = (k, mods) => {
    const e = new p.window.KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, mods));
    ta.dispatchEvent(e);
    return e;
  };
  const typeText = (v) => {
    ta.value = v;
    ta.dispatchEvent(new p.window.Event('input', { bubbles: true }));
  };
  return { p, ta, ed, log, writes, key, typeText };
}

test('createEditor requires a textarea', () => {
  assert.throws(() => MdEditor.createEditor({}), /needs a \{ textarea \}/);
});

test('open loads the source, marks it clean, focuses, and adds the style class', () => {
  const s = setup();
  s.ed.open(PATH, SRC);
  assert.strictEqual(s.ta.value, SRC);
  assert.strictEqual(s.ed.isEditing(), true);
  assert.strictEqual(s.ed.isDirty(), false);
  assert.strictEqual(s.p.document.activeElement, s.ta, 'focused so Esc and Cmd+S are live at once');
  assert.ok(s.ta.classList.contains('md-editor-source'));
  assert.deepStrictEqual(s.log, ['editing:true']);
});

test('editing marks dirty, and reverting to the saved text clears it again', () => {
  const s = setup();
  s.ed.open(PATH, SRC);
  s.typeText(SRC + 'more');
  assert.strictEqual(s.ed.isDirty(), true);
  s.typeText(SRC);
  assert.strictEqual(s.ed.isDirty(), false, 'undoing back to disk is not a pending change');
  assert.deepStrictEqual(s.log, ['editing:true', 'dirty:true', 'dirty:false']);
});

test('save writes through the adapter and reports saved', async () => {
  const s = setup();
  s.ed.open(PATH, SRC);
  s.typeText('changed\n');
  assert.strictEqual(await s.ed.save(), 'saved');
  assert.deepStrictEqual(s.writes, [[PATH, 'changed\n']]);
  assert.strictEqual(s.ed.source(), 'changed\n', 'disk state advanced');
  assert.strictEqual(s.ed.isDirty(), false);
});

test('saving an unchanged buffer writes nothing', async () => {
  const s = setup();
  s.ed.open(PATH, SRC);
  assert.strictEqual(await s.ed.save(), 'unchanged');
  assert.deepStrictEqual(s.writes, [], 'no write, so no pointless mtime bump');
});

test('a failed write does NOT advance the believed disk state', async () => {
  const s = setup({ failWrite: 'EACCES: permission denied' });
  s.ed.open(PATH, SRC);
  s.typeText('unsaved edit\n');
  assert.strictEqual(await s.ed.save(), 'error');
  assert.strictEqual(s.ed.source(), SRC, 'still the last text actually on disk');
  assert.strictEqual(s.ed.isDirty(), true, 'and still pending');
  assert.ok(s.log.some((l) => l.startsWith('error:EACCES')));
});

test('a long error message is truncated before it reaches the host', async () => {
  const s = setup({ failWrite: 'x'.repeat(400) });
  s.ed.open(PATH, SRC);
  s.typeText('y');
  await s.ed.save();
  const err = s.log.find((l) => l.startsWith('error:'));
  assert.ok(err.length < 140, 'got ' + err.length + ' chars');
  assert.ok(err.endsWith('…'));
});

test('the default adapter refuses to save rather than pretending to', async () => {
  const p = makePage();
  const ta = p.document.createElement('textarea');
  p.document.body.appendChild(ta);
  const errs = [];
  const ed = MdEditor.createEditor({ textarea: ta, onError: (m) => errs.push(m) });
  ed.open(PATH, SRC);
  ta.value = 'x';
  assert.strictEqual(await ed.save(), 'error');
  assert.match(errs[0], /read-only/);
});

test('Cmd+S and Ctrl+S both save; Escape discards', async () => {
  for (const mods of [{ metaKey: true }, { ctrlKey: true }]) {
    const s = setup();
    s.ed.open(PATH, SRC);
    s.typeText('edited\n');
    const e = s.key('s', mods);
    assert.strictEqual(e.defaultPrevented, true, 'the browser Save dialog is suppressed');
    await tick();
    assert.deepStrictEqual(s.writes, [[PATH, 'edited\n']]);
  }
  const s = setup();
  s.ed.open(PATH, SRC);
  s.typeText('edited\n');
  s.key('Escape');
  assert.strictEqual(s.ed.isEditing(), false);
  assert.deepStrictEqual(s.writes, [], 'Escape does not write');
  assert.strictEqual(s.ta.value, SRC, 'buffer restored to the saved text');
});

test('close saves pending edits and hands the host the text to render', async () => {
  const s = setup();
  s.ed.open(PATH, SRC);
  s.typeText('kept\n');
  assert.strictEqual(await s.ed.close(), 'saved');
  assert.deepStrictEqual(s.writes, [[PATH, 'kept\n']]);
  assert.strictEqual(s.log[s.log.length - 1], 'exit:"kept\\n"');
});

test('close after a failed write hands back the last saved text, not the buffer', async () => {
  const s = setup({ failWrite: 'disk full' });
  s.ed.open(PATH, SRC);
  s.typeText('never landed\n');
  assert.strictEqual(await s.ed.close(), 'error');
  assert.strictEqual(s.log[s.log.length - 1], 'exit:' + JSON.stringify(SRC),
    'the host must not re-render content that was never saved');
});

test('close({discard:true}) throws the edits away', async () => {
  const s = setup();
  s.ed.open(PATH, SRC);
  s.typeText('gone\n');
  assert.strictEqual(await s.ed.close({ discard: true }), 'closed');
  assert.deepStrictEqual(s.writes, []);
});

test('toggle opens, then closes; a clean close reports closed, a dirty one reports the save', async () => {
  const s = setup();
  assert.strictEqual(await s.ed.toggle(PATH, SRC), 'opened');
  assert.strictEqual(s.ed.isEditing(), true);
  assert.strictEqual(await s.ed.toggle(), 'closed', 'nothing pending, so no save was attempted');
  assert.strictEqual(s.ed.isEditing(), false);
  assert.deepStrictEqual(s.writes, []);

  await s.ed.toggle(PATH, SRC);
  s.typeText('edited\n');
  assert.strictEqual(await s.ed.toggle(), 'saved');
  assert.deepStrictEqual(s.writes, [[PATH, 'edited\n']]);
});

test('save and close are inert when not editing', async () => {
  const s = setup();
  assert.strictEqual(await s.ed.save(), 'idle');
  assert.strictEqual(await s.ed.close(), 'idle');
  s.ed.cancel();
  assert.deepStrictEqual(s.log, []);
});

test('setSource adopts an outside write and clears the dirty flag', () => {
  const s = setup();
  s.ed.open(PATH, SRC);
  s.typeText('local\n');
  s.ed.setSource('from elsewhere\n');
  assert.strictEqual(s.ta.value, 'from elsewhere\n');
  assert.strictEqual(s.ed.isDirty(), false);
});

test('destroy unhooks the listeners', () => {
  const s = setup();
  s.ed.open(PATH, SRC);
  s.ed.destroy();
  s.typeText('after destroy');
  assert.strictEqual(s.ed.isDirty(), false, 'input no longer tracked');
  assert.ok(!s.ta.classList.contains('md-editor-source'));
});

test('autofocus:false leaves focus where it was', () => {
  const s = setup({ config: { autofocus: false } });
  s.ed.open(PATH, SRC);
  assert.notStrictEqual(s.p.document.activeElement, s.ta);
});

/* ---------- find in source ---------- */

function findSetup(value, opts) {
  const p = makePage();
  const ta = p.document.createElement('textarea');
  ta.value = value;
  p.document.body.appendChild(ta);
  const after = [];
  const f = MdEditor.createSourceFind(Object.assign({ textarea: ta, onAfterFocus: () => after.push(1) }, opts));
  return { p, ta, f, after };
}

test('createSourceFind requires a textarea', () => {
  assert.throws(() => MdEditor.createSourceFind({}), /needs a \{ textarea \}/);
});

test('search counts case-insensitive matches and focus selects one', () => {
  const s = findSetup('Alpha beta ALPHA gamma alpha');
  assert.strictEqual(s.f.search('alpha'), 3);
  assert.strictEqual(s.f.focus(1), true);
  assert.deepStrictEqual([s.ta.selectionStart, s.ta.selectionEnd], [11, 16]);
  assert.strictEqual(s.ta.value.slice(11, 16), 'ALPHA');
});

test('a query is matched literally, not as a pattern', () => {
  const s = findSetup('a.b and axb');
  assert.strictEqual(s.f.search('a.b'), 1, '"." must not match "x"');
});

test('overlapping runs advance past each match', () => {
  const s = findSetup('aaaa');
  assert.strictEqual(s.f.search('aa'), 2);
});

test('an empty query and a miss both clear the results', () => {
  const s = findSetup('hello');
  s.f.search('hello');
  assert.strictEqual(s.f.search(''), 0);
  assert.strictEqual(s.f.search('zzz'), 0);
  assert.strictEqual(s.f.count(), 0);
});

test('focus outside the range list is refused', () => {
  const s = findSetup('one');
  s.f.search('one');
  assert.strictEqual(s.f.focus(-1), false);
  assert.strictEqual(s.f.focus(5), false);
});

test('focus hands the caret back to the host on the next frame', async () => {
  const s = findSetup('one two one');
  s.f.search('one');
  s.f.focus(0);
  assert.strictEqual(s.after.length, 0, 'not synchronously — the selection must scroll first');
  await new Promise((r) => setTimeout(r, 30));
  assert.strictEqual(s.after.length, 1);
});

test('hitting the cap is reported rather than passed off as a total', () => {
  const s = findSetup('x'.repeat(50), { cap: 10 });
  assert.strictEqual(s.f.search('x'), 10);
  assert.strictEqual(s.f.capped(), true, 'a host can show "10+" instead of a wrong 10');
  s.f.search('zzz');
  assert.strictEqual(s.f.capped(), false, 'reset on the next search');
});

test('clear drops the ranges', () => {
  const s = findSetup('one one');
  s.f.search('one');
  s.f.clear();
  assert.strictEqual(s.f.count(), 0);
  assert.deepStrictEqual(s.f.ranges(), []);
});
