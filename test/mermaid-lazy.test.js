'use strict';

/* Its own file: configure() writes to module-level state, see mermaid.test.js. */

const test = require('node:test');
const assert = require('node:assert');
const { makePage } = require('./helpers/dom');

const MdEditor = require('../src/index');

const TWO = '```mermaid\ngraph TD; A-->B\n```\n\ntext\n\n```mermaid\ngraph TD; C-->D\n```\n';

// jsdom has no IntersectionObserver; this one lets a test say which targets
// scrolled into view.
function fakeObserver(window) {
  const made = [];
  window.IntersectionObserver = class {
    constructor(cb, opts) { this.cb = cb; this.opts = opts; this.targets = new Set(); made.push(this); }
    observe(t) { this.targets.add(t); }
    unobserve(t) { this.targets.delete(t); }
    disconnect() { this.targets.clear(); this.gone = true; }
    show(t) { this.cb([{ target: t, isIntersecting: true }]); }
  };
  return made;
}

function setup() {
  const p = makePage();
  const drawn = [];
  MdEditor.configure({
    marked: require('marked'),
    mermaid: { initialize() {}, async render(id, src) { drawn.push(src); return { svg: '<svg></svg>' }; } },
  });
  return { p, drawn };
}

const settle = () => new Promise((r) => setTimeout(r, 0));

test('mermaidLazy draws a diagram only once it is seen', async () => {
  const { p, drawn } = setup();
  const made = fakeObserver(p.window);
  await MdEditor.mount(p.content, TWO, { idSeed: 1, mermaidLazy: true });
  assert.strictEqual(drawn.length, 0, 'nothing drawn up front');
  const io = made[0];
  assert.strictEqual(io.opts.root, p.viewer, 'watches the scrolling viewer, not the viewport');
  const second = [...io.targets][1];
  io.show(second);
  await settle();
  assert.deepStrictEqual(drawn, ['graph TD; C-->D']);
  assert.strictEqual(p.content.querySelectorAll('.mermaid-wrapper').length, 1);
  assert.strictEqual(p.content.querySelectorAll('code.language-mermaid').length, 1, 'the unseen one stays code');
});

test('a newer render drops the old watch', async () => {
  const { p } = setup();
  const made = fakeObserver(p.window);
  await MdEditor.mount(p.content, TWO, { idSeed: 1, mermaidLazy: true });
  await MdEditor.mount(p.content, 'no diagrams\n', { idSeed: 2, mermaidLazy: true });
  assert.ok(made[0].gone);
});

test('without IntersectionObserver, mermaidLazy draws everything as before', async () => {
  const { p, drawn } = setup();
  await MdEditor.mount(p.content, TWO, { idSeed: 1, mermaidLazy: true });
  assert.strictEqual(drawn.length, 2);
});
