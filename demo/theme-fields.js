(function () {
'use strict';
/* What the theme editor's right panel can change, as data.

   Two ways a field reaches the page, and the difference matters:

   - `vars: [...]` sets a custom property on the mount element. Every theme
     reads its colours from tokens, so one declaration repaints every surface
     that token feeds — the honest unit for a colour, and it keeps the theme's
     own derivations (a table head mixed from --text, say) working.
   - `prop` / `pair` writes a real declaration on the selector the group names.
     Sizes, paddings and margins are NOT tokens in any theme: modern.css says
     `h2 { margin: 32px 0 14px }` and claude.css says `2.5rem 0 0.75rem`, so a
     token would have nothing to feed. A rule is also what a heading's colour
     needs, because themes derive it differently (--heading-ink in one,
     --accent in another).

   `sel` on a field overrides the group's selector; an empty string means the
   mount element itself. Keys are the state's keys: they appear in the panel's
   DOM ids and in the exported CSS comment, so they are lowercase and stable. */

function heading(id, label, sel) {
  return {
    id,
    label,
    sel,
    fields: [
      { k: id + 'Size', label: 'Text size', kind: 'length', prop: 'font-size', min: 12, max: 72, step: 1 },
      { k: id + 'Color', label: 'Text colour', kind: 'color', prop: 'color' },
      { k: id + 'PadTop', label: 'Padding top', kind: 'length', prop: 'padding-top', min: 0, max: 60, step: 1 },
      { k: id + 'PadBottom', label: 'Padding bottom', kind: 'length', prop: 'padding-bottom', min: 0, max: 60, step: 1 },
      { k: id + 'MarginTop', label: 'Margin top', kind: 'length', prop: 'margin-top', min: 0, max: 80, step: 1 },
      { k: id + 'MarginBottom', label: 'Margin bottom', kind: 'length', prop: 'margin-bottom', min: 0, max: 80, step: 1 },
    ],
  };
}

const GROUPS = [
  {
    id: 'surface',
    label: 'Surface & colour',
    sel: '',
    fields: [
      { k: 'bg', label: 'Page background', kind: 'color', vars: ['--bg'] },
      { k: 'surface', label: 'Card surface', kind: 'color', vars: ['--surface', '--surface-2'] },
      { k: 'text', label: 'Body text', kind: 'color', vars: ['--text'] },
      { k: 'muted', label: 'Muted text', kind: 'color', vars: ['--muted', '--text-secondary'] },
      { k: 'border', label: 'Border', kind: 'color', vars: ['--border'] },
      { k: 'accent', label: 'Accent', kind: 'color', vars: ['--accent'] },
      { k: 'radius', label: 'Corner radius', kind: 'length', vars: ['--radius'], min: 0, max: 40, step: 1 },
    ],
  },
  {
    id: 'layout',
    label: 'Page layout',
    sel: '',
    fields: [
      { k: 'width', label: 'Column width', kind: 'length', prop: 'max-width', min: 420, max: 1400, step: 10 },
      { k: 'padX', label: 'Padding left / right', kind: 'length', pair: 'padding-left|padding-right', min: 0, max: 160, step: 4 },
      { k: 'padTop', label: 'Padding top', kind: 'length', prop: 'padding-top', min: 0, max: 200, step: 4 },
      { k: 'padBottom', label: 'Padding bottom', kind: 'length', prop: 'padding-bottom', min: 0, max: 200, step: 4 },
      { k: 'marginTop', label: 'Page margin top', kind: 'length', prop: 'margin-top', min: 0, max: 160, step: 4 },
      { k: 'marginBottom', label: 'Page margin bottom', kind: 'length', prop: 'margin-bottom', min: 0, max: 160, step: 4 },
    ],
  },
  heading('h1', 'Heading 1', 'h1'),
  heading('h2', 'Heading 2', 'h2'),
  heading('h3', 'Heading 3', 'h3'),
  {
    id: 'body',
    label: 'Body text',
    sel: 'p',
    fields: [
      // The library's text size is the mount element's font-size: everything
      // sized in em (tables, code) follows it, and headings do not, because
      // themes size those in rem. Same model as MdEditor.createTheme.
      { k: 'pSize', label: 'Text size', kind: 'length', sel: '', prop: 'font-size', min: 11, max: 28, step: 1 },
      { k: 'pLine', label: 'Line height', kind: 'length', prop: 'line-height', min: 12, max: 48, step: 1 },
      { k: 'pPadTop', label: 'Padding top', kind: 'length', prop: 'padding-top', min: 0, max: 40, step: 1 },
      { k: 'pPadBottom', label: 'Padding bottom', kind: 'length', prop: 'padding-bottom', min: 0, max: 40, step: 1 },
      { k: 'pMarginTop', label: 'Margin top', kind: 'length', prop: 'margin-top', min: 0, max: 60, step: 1 },
      { k: 'pMarginBottom', label: 'Margin bottom', kind: 'length', prop: 'margin-bottom', min: 0, max: 60, step: 1 },
    ],
  },
  {
    id: 'code',
    label: 'Code',
    sel: '',
    fields: [
      { k: 'codeBg', label: 'Inline background', kind: 'color', vars: ['--code-bg'] },
      { k: 'codeText', label: 'Inline text', kind: 'color', vars: ['--code-text'] },
      { k: 'preBg', label: 'Block background', kind: 'color', vars: ['--pre-bg'] },
      { k: 'preText', label: 'Block text', kind: 'color', vars: ['--pre-text'] },
      { k: 'codeSize', label: 'Block text size', kind: 'length', sel: 'pre code', prop: 'font-size', min: 10, max: 22, step: 1 },
    ],
  },
  {
    id: 'table',
    label: 'Table',
    sel: 'table',
    fields: [
      // `fb` is the element to measure when a theme has no such token — the
      // generated palettes stripe rows from --surface instead of a table token,
      // so the panel would otherwise prefill a grey that is not on screen.
      { k: 'thBg', label: 'Header background', kind: 'color', vars: ['--table-head-bg', '--th-bg'], fb: 'th' },
      { k: 'rowBg', label: 'Even row background', kind: 'color', vars: ['--table-even-row'], fb: 'tbody tr:nth-child(even) td' },
      { k: 'tableBorder', label: 'Border', kind: 'color', vars: ['--table-border'], fb: 'table' },
    ],
  },
  {
    id: 'link',
    label: 'Link',
    sel: 'a',
    fields: [
      { k: 'linkColor', label: 'Link colour', kind: 'color', vars: ['--link-ink'] },
    ],
  },
];

if (typeof module === 'object' && module.exports) module.exports = { GROUPS };
else window.TE_FIELDS = GROUPS;

})();
