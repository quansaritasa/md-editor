#!/usr/bin/env python3
"""Regenerate the eight generated themes into themes/.

Usage: python3 tools/gen_themes.py

Each file = header comment + light tokens + hljs tweaks + dark tokens
+ modern.css's component rules (buttons, tables, mermaid — shared boilerplate)
+ a per-theme override block that reshapes typography and a few components.

The outputs are committed. Edit a palette or an override block HERE, rerun,
and commit both — hand-editing themes/<name>.css is lost on the next run.
card/modern/glass/claude are hand-maintained and untouched by this script.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'themes'
modern = (ROOT / 'modern.css').read_text()
# Everything from the first typography rule onward is the shared body.
BODY = modern[modern.index('.md-editor {\n    font-family:'):]

# BODY is sliced out of modern.css, so it arrives carrying modern's own spacing.
# The eight generated palette themes run tighter than modern: their section gap
# is 12px against modern's 32px, and an h2 outside a section falls back to a
# wider top margin. Both deltas are applied here rather than hand-edited into
# each generated file, so re-running this tool reproduces what is committed
# instead of quietly reverting to modern's numbers.
_RHYTHM_AT = BODY.index('/* \u2500\u2500 Section rhythm')
SECTION_RHYTHM = BODY[_RHYTHM_AT:].rstrip('\n')
BODY = BODY[:_RHYTHM_AT].rstrip('\n').replace(
    '    margin: 32px 0 14px;\n    padding-bottom: 6px;',
    '    margin: 52px 0 14px;\n    padding-bottom: 6px;')
# The block trails the per-theme overrides so a theme can reshape .section and
# still have the gap land last.
SECTION_RHYTHM = SECTION_RHYTHM.replace('.md-editor .section { margin-bottom: 32px; }',
                                        '.md-editor .section { margin-bottom: 12px; }')

MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Times New Roman", serif'
SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'

TOKENS = ['book-bg', 'mermaid-bg', 'bg', 'surface', 'text', 'text-secondary', 'border',
          'accent', 'accent-soft', 'code-bg', 'code-text', 'radius', 'max-w',
          'note-amber', 'note-amber-lt', 'note-amber-border',
          'info-blue', 'info-blue-lt', 'info-blue-border', 'fields-key']


def block(sel, d):
    lines = [f'{sel} {{']
    for k in TOKENS:
        if k in d:
            lines.append(f'    --{k}: {d[k]};')
    lines.append('}')
    return '\n'.join(lines)


def emit(name, desc, light, dark, hl_light, hl_dark, overrides):
    parts = [f'/* theme-{name}.css — {desc} */',
             block('.md-editor', light),
             f'.md-editor .hljs-string {{ color: {hl_light[0]}; }}',
             f'.md-editor .hljs-attr {{ color: {hl_light[1]}; }}',
             block('html.dark .md-editor', dark),
             f'html.dark .md-editor .hljs-string {{ color: {hl_dark[0]}; }}',
             f'html.dark .md-editor .hljs-attr {{ color: {hl_dark[1]}; }}',
             BODY.rstrip('\n'),
             f'/* ── {name}: typography and component reshaping ── */',
             overrides.strip('\n'), '', SECTION_RHYTHM, '']
    (ROOT / f'{name}.css').write_text('\n'.join(parts))
    print(name, (ROOT / f'{name}.css').stat().st_size)


COMMON_LIGHT = {'mermaid-bg': '#f6f8fa', 'max-w': '900px'}

# ─────────────────────────── terminal ───────────────────────────
emit('terminal', 'Monospace, phosphor accents, dark-first console feel',
     {**COMMON_LIGHT, 'book-bg': '#F1F1EA', 'bg': '#F7F7F2', 'surface': '#ECEEE7', 'text': '#1F2A22',
      'text-secondary': '#5F6F62', 'border': '#CFD6CD', 'accent': '#0B7A3B', 'accent-soft': '#E1F0E5',
      'code-bg': '#ECEEE7', 'code-text': '#8A5A00', 'radius': '0px',
      'note-amber': '#7A5200', 'note-amber-lt': '#F6EFD8', 'note-amber-border': '#B58900',
      'info-blue': '#1F5E8A', 'info-blue-lt': '#E2ECF3', 'info-blue-border': '#3C82B4', 'fields-key': '#0B7A3B'},
     {'book-bg': '#0E130F', 'bg': '#0B0F0C', 'surface': '#111813', 'text': '#D5E3D0',
      'text-secondary': '#7D9A7A', 'border': '#22301F', 'accent': '#58D68D', 'accent-soft': '#12301C',
      'code-bg': '#111813', 'code-text': '#F0C674',
      'note-amber': '#F0C674', 'note-amber-lt': '#241D07', 'note-amber-border': '#B58900',
      'info-blue': '#8ABEEB', 'info-blue-lt': '#0E1B27', 'info-blue-border': '#3C82B4', 'fields-key': '#58D68D'},
     ('#0B7A3B', '#8A5A00'), ('#A3BE8C', '#F0C674'),
     f'''
.md-editor {{
    font-family: {MONO};
    font-size: 15px;
    line-height: 1.6;
}}
.md-editor h1, .md-editor h2, .md-editor h3, .md-editor h4 {{
    font-family: inherit;
    font-weight: 700;
    letter-spacing: 0;
    border-bottom: none;
}}
/* Headings keep their Markdown hashes — the prompt is the decoration. */
.md-editor h1::before {{ content: "# "; color: var(--accent); }}
.md-editor h2::before {{ content: "## "; color: var(--accent); }}
.md-editor h3::before {{ content: "### "; color: var(--accent); }}
.md-editor h4::before {{ content: "#### "; color: var(--accent); }}
.md-editor h1 {{ font-size: 1.6rem; padding-bottom: 10px; border-bottom: 1px dashed var(--border); }}
.md-editor h2 {{ font-size: 1.25rem; margin: 44px 0 12px; padding-bottom: 6px; border-bottom: 1px dashed var(--border); }}
.md-editor h3 {{ font-size: 1.05rem; }}
.md-editor h4 {{ font-size: 0.95rem; }}
.md-editor .eyebrow {{ border-radius: 0; background: none; border: 1px solid var(--accent); padding: 2px 8px; }}
.md-editor a {{ text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 3px; }}
.md-editor a:hover {{ text-decoration-style: solid; background: var(--accent-soft); }}
.md-editor strong {{ color: var(--accent); font-weight: 700; }}
.md-editor code {{ font-size: 0.95em; padding: 1px 5px; border: 1px solid var(--border); }}
.md-editor pre {{ font-size: 0.9rem; border-left: 3px solid var(--accent); }}
.md-editor pre code {{ font-size: inherit; }}
.md-editor blockquote, .md-editor .blockquotes {{ background: none; border-left: 3px solid var(--text-secondary); color: var(--text-secondary); }}
.md-editor blockquote p::before {{ content: "> "; color: var(--text-secondary); }}
.md-editor th {{ text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.78rem; }}
.md-editor tr:nth-child(even) td {{ background: none; }}
.md-editor hr {{ border-top: 1px dashed var(--border); }}
.md-editor ul {{ list-style: none; margin-left: 4px; }}
.md-editor ul > li {{ padding-left: 18px; position: relative; }}
.md-editor ul > li::before {{ content: "-"; position: absolute; left: 0; color: var(--accent); }}
.md-editor ul ul > li::before {{ content: "·"; }}
.md-editor .code-copy-btn, .md-editor .code-full-btn, .md-editor .code-wrap-btn,
.md-editor .mermaid-zoom-btn, .md-editor .mermaid-zoom-label, .md-editor select, .md-editor .theme-btn {{
    border-radius: 0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}}
''')

# ─────────────────────────── catppuccin ───────────────────────────
emit('catppuccin', 'Catppuccin Latte (light) and Mocha (dark) palettes',
     {**COMMON_LIGHT, 'mermaid-bg': '#eff1f5', 'book-bg': '#EFF1F5', 'bg': '#eff1f5', 'surface': '#e6e9ef', 'text': '#4c4f69',
      'text-secondary': '#6c6f85', 'border': '#ccd0da', 'accent': '#1e66f5', 'accent-soft': '#dce4fb',
      'code-bg': '#e6e9ef', 'code-text': '#ea76cb', 'radius': '8px',
      'note-amber': '#df8e1d', 'note-amber-lt': '#f8ecd6', 'note-amber-border': '#df8e1d',
      'info-blue': '#1e66f5', 'info-blue-lt': '#dce4fb', 'info-blue-border': '#7287fd', 'fields-key': '#40a02b'},
     {'book-bg': '#1E1E2E', 'bg': '#1e1e2e', 'surface': '#181825', 'text': '#cdd6f4',
      'text-secondary': '#a6adc8', 'border': '#313244', 'accent': '#89b4fa', 'accent-soft': '#26304a',
      'code-bg': '#181825', 'code-text': '#f5c2e7',
      'note-amber': '#f9e2af', 'note-amber-lt': '#2e2a24', 'note-amber-border': '#f9e2af',
      'info-blue': '#89b4fa', 'info-blue-lt': '#1f2637', 'info-blue-border': '#b4befe', 'fields-key': '#a6e3a1'},
     ('#40a02b', '#df8e1d'), ('#a6e3a1', '#f9e2af'),
     '''
.md-editor h1 { color: #8839ef; border-bottom: none; }
html.dark .md-editor h1 { color: #cba6f7; }
.md-editor h2 { color: var(--accent); border-bottom: 1px solid var(--border); }
.md-editor h3 { color: #179299; }
html.dark .md-editor h3 { color: #94e2d5; }
.md-editor .eyebrow { background: #8839ef; color: #eff1f5; }
html.dark .md-editor .eyebrow { background: #cba6f7; color: #1e1e2e; }
.md-editor th { background: var(--surface); color: var(--accent); }
.md-editor blockquote, .md-editor .blockquotes { border-left-width: 4px; }
.md-editor .example-box.good-box { border-left-color: #40a02b; }
.md-editor .example-box.bad-box { border-left-color: #d20f39; }
html.dark .md-editor .example-box.good-box { border-left-color: #a6e3a1; }
html.dark .md-editor .example-box.bad-box { border-left-color: #f38ba8; }
.md-editor pre { border-radius: 10px; }
''')

# ─────────────────────────── eink ───────────────────────────
emit('eink', 'Grayscale, serif, no shadows — an e-reader on the desktop',
     {**COMMON_LIGHT, 'mermaid-bg': '#ffffff', 'book-bg': '#F4F4F2', 'bg': '#F4F4F2', 'surface': '#E9E9E6', 'text': '#111111',
      'text-secondary': '#444444', 'border': '#9A9A96', 'accent': '#111111', 'accent-soft': '#E2E2DF',
      'code-bg': '#E9E9E6', 'code-text': '#111111', 'radius': '0px',
      'note-amber': '#111111', 'note-amber-lt': '#E9E9E6', 'note-amber-border': '#444444',
      'info-blue': '#111111', 'info-blue-lt': '#F4F4F2', 'info-blue-border': '#111111', 'fields-key': '#111111'},
     {'book-bg': '#121212', 'bg': '#121212', 'surface': '#1E1E1E', 'text': '#E6E6E6',
      'text-secondary': '#B0B0B0', 'border': '#5A5A5A', 'accent': '#E6E6E6', 'accent-soft': '#2A2A2A',
      'code-bg': '#1E1E1E', 'code-text': '#E6E6E6',
      'note-amber': '#E6E6E6', 'note-amber-lt': '#1E1E1E', 'note-amber-border': '#B0B0B0',
      'info-blue': '#E6E6E6', 'info-blue-lt': '#121212', 'info-blue-border': '#E6E6E6', 'fields-key': '#E6E6E6'},
     ('#333333', '#111111'), ('#CCCCCC', '#E6E6E6'),
     f'''
.md-editor {{
    font-family: {SERIF};
    font-size: 17px;
    line-height: 1.7;
    -webkit-font-smoothing: auto;
}}
.md-editor h1, .md-editor h2, .md-editor h3, .md-editor h4 {{ font-family: inherit; font-weight: 700; letter-spacing: 0; }}
.md-editor h1 {{ font-size: 1.9rem; border-bottom: 2px solid var(--text); }}
.md-editor h2 {{ font-size: 1.4rem; border-bottom: 1px solid var(--border); }}
.md-editor .eyebrow {{ background: none; border: 1px solid var(--text); color: var(--text); border-radius: 0; }}
.md-editor a {{ text-decoration: underline; text-underline-offset: 2px; }}
.md-editor a:hover {{ background: var(--accent-soft); }}
.md-editor th {{ background: none; border-bottom: 2px solid var(--text); }}
.md-editor tr:nth-child(even) td {{ background: none; }}
.md-editor th, .md-editor td {{ border-color: var(--border); }}
.md-editor code {{ font-size: 0.85em; border: 1px solid var(--border); }}
.md-editor pre {{ border: 1px solid var(--border); background: var(--surface); }}
/* Syntax colour has nowhere to go on grey paper: weight and slant carry it. */
.md-editor [class*="hljs-"] {{ color: var(--text); }}
.md-editor .hljs-comment, .md-editor .hljs-quote {{ color: var(--text-secondary); font-style: italic; }}
.md-editor .hljs-keyword, .md-editor .hljs-built_in, .md-editor .hljs-title, .md-editor .hljs-section,
.md-editor .hljs-selector-tag, .md-editor .hljs-name {{ font-weight: 700; }}
.md-editor .hljs-string, .md-editor .hljs-attr {{ text-decoration: underline; text-decoration-color: var(--border); text-underline-offset: 2px; }}
.md-editor blockquote, .md-editor .blockquotes {{ background: none; border-left: 2px solid var(--text); color: var(--text); font-style: italic; }}
.md-editor .blockquotes.note {{ border-left-style: dashed; background: var(--surface); font-style: normal; }}
.md-editor .blockquotes.info {{ border-left-style: double; border-left-width: 5px; background: none; font-style: normal; }}
.md-editor .example-box.good-box {{ border-left: 4px solid var(--text); }}
.md-editor .example-box.bad-box {{ border-left: 4px dashed var(--text); }}
.md-editor img {{ filter: grayscale(1) contrast(1.05); }}
.md-editor .mermaid-wrapper {{ filter: grayscale(1); }}
.md-editor hr {{ border-top: 1px solid var(--text); }}
.md-editor .code-copy-btn, .md-editor .code-full-btn, .md-editor .code-wrap-btn,
.md-editor .mermaid-zoom-btn, .md-editor .mermaid-zoom-label, .md-editor select, .md-editor .theme-btn {{ border-radius: 0; }}
''')

# ─────────────────────────── editorial ───────────────────────────
emit('editorial', 'Newspaper — display serif headings, hairline rules, drop cap',
     {**COMMON_LIGHT, 'mermaid-bg': '#ffffff', 'book-bg': '#FBF8F2', 'bg': '#FFFDF9', 'surface': '#F5F1EA', 'text': '#1A1A1A',
      'text-secondary': '#5C5C5C', 'border': '#C9C4BA', 'accent': '#A31621', 'accent-soft': '#F8E9EA',
      'code-bg': '#F0ECE4', 'code-text': '#1A1A1A', 'radius': '2px',
      'note-amber': '#6B4E00', 'note-amber-lt': '#F7F0DC', 'note-amber-border': '#B58900',
      'info-blue': '#1F3A5F', 'info-blue-lt': '#E9EEF4', 'info-blue-border': '#1F3A5F', 'fields-key': '#1F5E3A'},
     {'book-bg': '#1E1C19', 'bg': '#1A1917', 'surface': '#24221F', 'text': '#ECE7DD',
      'text-secondary': '#A39E93', 'border': '#3B3834', 'accent': '#E0616B', 'accent-soft': '#3A2224',
      'code-bg': '#24221F', 'code-text': '#ECE7DD',
      'note-amber': '#F0D27A', 'note-amber-lt': '#2B2619', 'note-amber-border': '#B58900',
      'info-blue': '#A9C4E4', 'info-blue-lt': '#1C2430', 'info-blue-border': '#5B84B1', 'fields-key': '#9CCFA8'},
     ('#1F5E3A', '#A31621'), ('#9CCFA8', '#E0616B'),
     f'''
.md-editor {{
    font-family: {SERIF};
    font-size: 18px;
    line-height: 1.65;
    -webkit-font-smoothing: auto;
}}
.md-editor h1, .md-editor h2, .md-editor h3, .md-editor h4 {{ font-family: inherit; }}
.md-editor .header {{ text-align: center; border-bottom: 3px double var(--text); padding-bottom: 20px; }}
.md-editor .header h1 {{ border-bottom: none; }}
.md-editor .meta {{ justify-content: center; font-style: italic; }}
.md-editor .eyebrow {{ background: none; border-top: 1px solid var(--text); border-bottom: 1px solid var(--text); border-radius: 0; color: var(--text); letter-spacing: 0.2em; padding: 3px 0; }}
.md-editor h1 {{ font-size: 2.8rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; text-align: center; border-bottom: 3px double var(--text); padding-bottom: 14px; margin-bottom: 20px; }}
.md-editor h2 {{ font-size: 1.6rem; font-weight: 700; letter-spacing: -0.01em; border-bottom: none; border-top: 1px solid var(--border); padding-top: 14px; margin-top: 44px; }}
.md-editor h3 {{ font-size: 1.05rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }}
.md-editor h4 {{ font-style: italic; font-weight: 600; font-size: 1.05rem; }}
/* The opening paragraph gets a drop cap, the way a front-page column does. */
.md-editor h1 + p::first-letter, .md-editor .header + p::first-letter {{
    float: left; font-size: 3.6em; line-height: 0.8; padding: 6px 8px 0 0; font-weight: 800; color: var(--accent);
}}
.md-editor p {{ text-align: justify; hyphens: auto; }}
.md-editor li {{ text-align: left; }}
.md-editor a {{ text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; color: var(--text); }}
.md-editor a:hover {{ color: var(--accent); }}
.md-editor strong {{ font-weight: 700; }}
.md-editor blockquote {{ border-left: none; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: none; text-align: center; font-style: italic; font-size: 1.2em; line-height: 1.5; padding: 18px 28px; color: var(--text); border-radius: 0; margin: 24px 0; }}
.md-editor blockquote p {{ text-align: center; }}
.md-editor table {{ font-size: 0.92rem; font-family: {SANS}; }}
.md-editor th, .md-editor td {{ border-left: none; border-right: none; }}
.md-editor th {{ background: none; border-top: 2px solid var(--text); border-bottom: 1px solid var(--text); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; }}
.md-editor tr:nth-child(even) td {{ background: none; }}
.md-editor code {{ font-size: 0.82em; }}
.md-editor pre {{ font-size: 0.82rem; border: none; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); border-radius: 0; }}
.md-editor hr {{ border: none; text-align: center; margin: 36px 0; }}
.md-editor hr::after {{ content: "❦"; color: var(--text-secondary); font-size: 1.2rem; }}
.md-editor .example-box, .md-editor .block-card {{ font-family: {SANS}; font-size: 0.95rem; }}
''')

# ─────────────────────────── blossom ───────────────────────────
emit('blossom', 'Blossom — soft pink paper, raspberry accents, rounded edges',
     {**COMMON_LIGHT, 'mermaid-bg': '#fff5f8', 'book-bg': '#FFF5F8', 'bg': '#FFF5F8', 'surface': '#FDE9F0', 'text': '#3D2430',
      'text-secondary': '#8A6B78', 'border': '#F2CEDD', 'accent': '#C2255C', 'accent-soft': '#FCE0EB',
      'code-bg': '#FDE9F0', 'code-text': '#A61E4D', 'radius': '12px',
      'note-amber': '#B54708', 'note-amber-lt': '#FFF1E3', 'note-amber-border': '#F0B27A',
      'info-blue': '#7048A8', 'info-blue-lt': '#F3ECFB', 'info-blue-border': '#C4A7E7', 'fields-key': '#C2255C'},
     {'book-bg': '#1E1419', 'bg': '#1E1419', 'surface': '#2A1B23', 'text': '#F6E4EC',
      'text-secondary': '#C09FB0', 'border': '#432E38', 'accent': '#F783AC', 'accent-soft': '#3A2129',
      'code-bg': '#2A1B23', 'code-text': '#FFA8C5',
      'note-amber': '#F0B27A', 'note-amber-lt': '#33210F', 'note-amber-border': '#B54708',
      'info-blue': '#C4A7E7', 'info-blue-lt': '#241A33', 'info-blue-border': '#7048A8', 'fields-key': '#F783AC'},
     ('#0B7285', '#C2255C'), ('#63C8B0', '#F783AC'),
     '''
.md-editor h1 { color: var(--accent); border-bottom: 2px solid var(--accent-soft); }
.md-editor h2 { color: var(--accent); border-bottom: 1px solid var(--border); }
.md-editor h3 { color: var(--accent); }
.md-editor .header { border-bottom: 1px solid var(--border); }
.md-editor .eyebrow { border-radius: 999px; letter-spacing: 0.08em; font-weight: 600; }
.md-editor a { text-decoration-color: var(--accent-soft); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.md-editor a:hover { text-decoration-color: var(--accent); }
.md-editor th { background: var(--accent-soft); color: var(--accent); }
.md-editor tr:nth-child(even) td { background: var(--surface); }
.md-editor code { border-radius: 6px; }
.md-editor pre { border-radius: var(--radius); }
.md-editor blockquote, .md-editor .blockquotes { border-left-width: 4px; border-radius: 0 var(--radius) var(--radius) 0; }
.md-editor .example-box, .md-editor .block-card, .md-editor .mermaid-wrapper { border-radius: var(--radius); }
.md-editor hr { border: none; text-align: center; margin: 36px 0; }
.md-editor hr::after { content: "❀"; color: var(--accent); font-size: 1.1rem; }
.md-editor .code-copy-btn, .md-editor .code-full-btn, .md-editor .code-wrap-btn,
.md-editor .mermaid-zoom-btn, .md-editor .mermaid-zoom-label, .md-editor select, .md-editor .theme-btn {
    border-radius: 999px;
}
''')

# ─────────────────────────── nord ───────────────────────────
emit('nord', 'Nord — arctic, bluish palette',
     {**COMMON_LIGHT, 'mermaid-bg': '#ECEFF4', 'book-bg': '#ECEFF4', 'bg': '#ECEFF4', 'surface': '#E5E9F0', 'text': '#2E3440',
      'text-secondary': '#4C566A', 'border': '#D8DEE9', 'accent': '#5E81AC', 'accent-soft': '#DFE6EF',
      'code-bg': '#E5E9F0', 'code-text': '#BF616A', 'radius': '4px',
      'note-amber': '#7A5A12', 'note-amber-lt': '#F4EDDC', 'note-amber-border': '#EBCB8B',
      'info-blue': '#3B5F8A', 'info-blue-lt': '#E1EAF2', 'info-blue-border': '#81A1C1', 'fields-key': '#4E7A3A'},
     {'book-bg': '#2E3440', 'bg': '#2E3440', 'surface': '#3B4252', 'text': '#ECEFF4',
      'text-secondary': '#D8DEE9', 'border': '#434C5E', 'accent': '#88C0D0', 'accent-soft': '#3B4A5A',
      'code-bg': '#3B4252', 'code-text': '#D08770',
      'note-amber': '#EBCB8B', 'note-amber-lt': '#3D3A30', 'note-amber-border': '#EBCB8B',
      'info-blue': '#8FBCBB', 'info-blue-lt': '#33414A', 'info-blue-border': '#81A1C1', 'fields-key': '#A3BE8C'},
     ('#4E7A3A', '#7A5A12'), ('#A3BE8C', '#EBCB8B'),
     '''
.md-editor h1 { color: #5E81AC; border-bottom: 2px solid var(--border); }
html.dark .md-editor h1 { color: #88C0D0; }
.md-editor h2 { border-bottom: 1px solid var(--border); }
.md-editor h3 { color: #5E81AC; }
html.dark .md-editor h3 { color: #81A1C1; }
.md-editor .eyebrow { background: #5E81AC; color: #ECEFF4; }
html.dark .md-editor .eyebrow { background: #88C0D0; color: #2E3440; }
.md-editor th { color: var(--accent); }
.md-editor .example-box.good-box { border-left-color: #A3BE8C; }
.md-editor .example-box.bad-box { border-left-color: #BF616A; }
''')

# ─────────────────────────── gruvbox ───────────────────────────
emit('gruvbox', 'Gruvbox — warm retro palette',
     {**COMMON_LIGHT, 'mermaid-bg': '#FBF1C7', 'book-bg': '#FBF1C7', 'bg': '#FBF1C7', 'surface': '#EBDBB2', 'text': '#3C3836',
      'text-secondary': '#665C54', 'border': '#D5C4A1', 'accent': '#076678', 'accent-soft': '#E4DFC0',
      'code-bg': '#EBDBB2', 'code-text': '#AF3A03', 'radius': '3px',
      'note-amber': '#B57614', 'note-amber-lt': '#F4E8C1', 'note-amber-border': '#D79921',
      'info-blue': '#076678', 'info-blue-lt': '#E6E5C6', 'info-blue-border': '#458588', 'fields-key': '#79740E'},
     {'book-bg': '#282828', 'bg': '#282828', 'surface': '#3C3836', 'text': '#EBDBB2',
      'text-secondary': '#A89984', 'border': '#504945', 'accent': '#83A598', 'accent-soft': '#3A4442',
      'code-bg': '#3C3836', 'code-text': '#FE8019',
      'note-amber': '#FABD2F', 'note-amber-lt': '#3D3521', 'note-amber-border': '#D79921',
      'info-blue': '#83A598', 'info-blue-lt': '#2F3A3A', 'info-blue-border': '#458588', 'fields-key': '#B8BB26'},
     ('#79740E', '#B57614'), ('#B8BB26', '#FABD2F'),
     '''
.md-editor h1 { color: #9D0006; border-bottom: 2px solid var(--border); }
html.dark .md-editor h1 { color: #FB4934; }
.md-editor h2 { color: #79740E; border-bottom: 1px solid var(--border); }
html.dark .md-editor h2 { color: #B8BB26; }
.md-editor h3 { color: #B57614; }
html.dark .md-editor h3 { color: #FABD2F; }
.md-editor .eyebrow { background: #AF3A03; color: #FBF1C7; }
html.dark .md-editor .eyebrow { background: #FE8019; color: #282828; }
.md-editor strong { color: #9D0006; }
html.dark .md-editor strong { color: #FB4934; }
.md-editor .example-box.good-box { border-left-color: #79740E; }
.md-editor .example-box.bad-box { border-left-color: #9D0006; }
html.dark .md-editor .example-box.good-box { border-left-color: #B8BB26; }
html.dark .md-editor .example-box.bad-box { border-left-color: #FB4934; }
''')

# ─────────────────────────── solarized ───────────────────────────
emit('solarized', 'Solarized — light and dark, the classic pair',
     {**COMMON_LIGHT, 'mermaid-bg': '#FDF6E3', 'book-bg': '#FDF6E3', 'bg': '#FDF6E3', 'surface': '#EEE8D5', 'text': '#586E75',
      'text-secondary': '#839496', 'border': '#D9D2BC', 'accent': '#268BD2', 'accent-soft': '#E1E8DA',
      'code-bg': '#EEE8D5', 'code-text': '#D33682', 'radius': '4px',
      'note-amber': '#8A6700', 'note-amber-lt': '#F4EBC9', 'note-amber-border': '#B58900',
      'info-blue': '#1D6FA8', 'info-blue-lt': '#E1E8DA', 'info-blue-border': '#268BD2', 'fields-key': '#6C7B00'},
     {'book-bg': '#002B36', 'bg': '#002B36', 'surface': '#073642', 'text': '#93A1A1',
      'text-secondary': '#657B83', 'border': '#0E4553', 'accent': '#268BD2', 'accent-soft': '#0A3F52',
      'code-bg': '#073642', 'code-text': '#CB4B16',
      'note-amber': '#B58900', 'note-amber-lt': '#0F3A3A', 'note-amber-border': '#B58900',
      'info-blue': '#4FA3DC', 'info-blue-lt': '#0A3F52', 'info-blue-border': '#268BD2', 'fields-key': '#859900'},
     ('#2AA198', '#B58900'), ('#2AA198', '#B58900'),
     '''
.md-editor h1, .md-editor h2, .md-editor h3, .md-editor h4, .md-editor strong, .md-editor th { color: #073642; }
html.dark .md-editor h1, html.dark .md-editor h2, html.dark .md-editor h3, html.dark .md-editor h4,
html.dark .md-editor strong, html.dark .md-editor th { color: #EEE8D5; }
.md-editor h1 { border-bottom: 2px solid var(--border); }
.md-editor h2 { color: #268BD2; }
html.dark .md-editor h2 { color: #268BD2; }
.md-editor h3 { color: #2AA198; }
html.dark .md-editor h3 { color: #2AA198; }
.md-editor .eyebrow { background: #B58900; color: #FDF6E3; }
html.dark .md-editor .eyebrow { background: #B58900; color: #002B36; }
.md-editor .example-box.good-box { border-left-color: #859900; }
.md-editor .example-box.bad-box { border-left-color: #DC322F; }
''')
