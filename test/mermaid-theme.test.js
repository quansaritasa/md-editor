'use strict';

/* Diagram colours follow the page theme. Its own file: configure() installs a
   mermaid stand-in at module level, which must not leak into other tests.
   jsdom resolves no colours, so the theme reader is stubbed where the render
   path is under test; the colour conversion is tested on its own. */

const test = require('node:test');
const assert = require('node:assert');
const { makePage } = require('./helpers/dom');

const MdEditor = require('../src/index');
const mermaidTheme = require('../src/features/mermaid-theme');
const mermaid = require('../src/features/mermaid');

function stubMermaid() {
  const calls = { init: [], renders: 0 };
  return {
    calls,
    initialize(cfg) { calls.init.push(cfg); },
    async render(id) {
      calls.renders++;
      return { svg: '<svg id="' + id + '"><g class="node" id="' + id + '-flowchart-A-0"></g></svg>' };
    },
  };
}

let palette = null;
mermaidTheme.themeVars = () => palette; // stands in for the browser's colour resolver

test('toHex reads the forms a browser reports a computed colour in', () => {
  assert.strictEqual(mermaidTheme.toHex('rgb(31, 41, 55)'), '#1f2937');
  assert.strictEqual(mermaidTheme.toHex('rgba(255, 0, 16, 0.5)'), '#ff0010');
  assert.strictEqual(mermaidTheme.toHex('color(srgb 1 0.5 0)'), '#ff8000');
  assert.strictEqual(mermaidTheme.toHex('color(srgb 0.2 0.4 0.6 / 0.3)'), '#336699');
  assert.strictEqual(mermaidTheme.toHex('red'), null);
});

test('a theme switch redraws the diagrams in its colours; no switch, no redraw', async () => {
  const p = makePage();
  const m = stubMermaid();
  MdEditor.configure({ marked: require('marked'), mermaid: m });

  palette = { primaryColor: '#aaaaaa' };
  await MdEditor.mount(p.content, '```mermaid\ngraph TD\n  A-->B\n```\n', { idSeed: 1 });
  const dia = p.content.querySelector('.mermaid');
  assert.ok(dia && dia.getAttribute('data-mermaid-src').includes('A-->B'), 'source kept for a redraw');
  assert.strictEqual(m.calls.init.at(-1).themeVariables.primaryColor, '#aaaaaa');

  const before = m.calls.renders;
  assert.strictEqual(await mermaid.refreshTheme(p.content), 0, 'same colours: nothing redrawn');
  assert.strictEqual(m.calls.renders, before);

  palette = { primaryColor: '#bbbbbb' };
  const oldSvg = dia.querySelector('svg');
  assert.strictEqual(await mermaid.refreshTheme(p.content), 1);
  assert.strictEqual(m.calls.init.at(-1).themeVariables.primaryColor, '#bbbbbb');
  assert.notStrictEqual(dia.querySelector('svg'), oldSvg, 'diagram redrawn in place');
  assert.ok(p.content.querySelector('.mermaid-wrapper > .mermaid-zoom-controls'), 'zoom controls survive');
});

test("the host's mermaidConfig colours win over the theme's", async () => {
  const p = makePage();
  const m = stubMermaid();
  MdEditor.configure({ marked: require('marked'), mermaid: m });
  palette = { primaryColor: '#cccccc', lineColor: '#111111' };
  await MdEditor.mount(p.content, '```mermaid\ngraph TD\n  A-->B\n```\n', {
    idSeed: 2, mermaidConfig: { themeVariables: { primaryColor: '#ff0000' } },
  });
  const tv = m.calls.init.at(-1).themeVariables;
  assert.strictEqual(tv.primaryColor, '#ff0000');
  assert.strictEqual(tv.lineColor, '#111111');
});

test('no theme loaded: mermaid keeps its defaults', () => {
  const p = makePage();
  // A fresh copy of the module: the one above has its reader stubbed.
  delete require.cache[require.resolve('../src/features/mermaid-theme')];
  const fresh = require('../src/features/mermaid-theme');
  assert.strictEqual(fresh.themeVars(p.content), null, 'no --accent on the page');
});
