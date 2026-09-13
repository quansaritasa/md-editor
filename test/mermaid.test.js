'use strict';

/* Its own file: configure() writes to module-level state that cannot be
   cleared, so a mermaid stand-in installed here would leak into any other test
   sharing the process. node --test gives each file its own. */

const test = require('node:test');
const assert = require('node:assert');
const { makePage } = require('./helpers/dom');

const MdEditor = require('../src/index');

// Behaves the way the real mermaid does on a diagram it cannot parse: it still
// DRAWS the error, into a scratch element it appends to <body> as 'd' + the
// render id, and only then throws.
function failingMermaid(doc) {
  return {
    initialize() {},
    async render(id) {
      const scratch = doc.createElement('div');
      scratch.id = 'd' + id;
      scratch.textContent = 'Syntax error in text';
      doc.body.appendChild(scratch);
      throw new Error('Parse error on line 2');
    },
  };
}

function setup() {
  const p = makePage();
  MdEditor.configure({ marked: require('marked'), mermaid: failingMermaid(p.document) });
  return p;
}

test('a diagram that fails to parse leaves no error graphic behind', async () => {
  const p = setup();
  await MdEditor.mount(p.content, '```mermaid\nnot a diagram\n```\n', { idSeed: 1 });
  assert.strictEqual(p.document.querySelectorAll('[id^="dmmd-"]').length, 0, 'scratch element removed');
  assert.ok(!p.document.body.textContent.includes('Syntax error in text'), 'error graphic gone from the page');
});

// The case that surfaced it: the error was stranded on <body> by one file and
// then sat on top of every file opened afterwards, including files holding no
// diagram at all — which never reached the render loop to clean anything up.
test('opening a document with no diagram clears a stranded error graphic', async () => {
  const p = setup();
  const stray = p.document.createElement('div');
  stray.id = 'dmmd-0-123';
  stray.textContent = 'Syntax error in text';
  p.document.body.appendChild(stray);

  await MdEditor.mount(p.content, '# Just text\n\nno diagrams here\n', {});
  assert.strictEqual(p.document.querySelectorAll('[id^="dmmd-"]').length, 0, 'stray swept');
});

test('an element the host owns is never swept', async () => {
  const p = setup();
  const mine = p.document.createElement('div');
  mine.id = 'dashboard';
  p.document.body.appendChild(mine);
  await MdEditor.mount(p.content, '# Text\n', {});
  assert.ok(p.document.getElementById('dashboard'), 'host element untouched');
});
