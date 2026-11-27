"""Generates themes/eink.css."""
from .core import *  # noqa: F401,F403

# ─────────────────────────── eink ───────────────────────────
emit('eink', 'Grayscale, serif, no shadows — an e-reader on the desktop',
     # eink is the one theme the accent formula cannot serve: its light accent is
     # near-black and its dark one near-white, so the same mix gives a slab in one
     # mode and nothing in the other. A fixed grey suits a greyscale theme anyway.
     {**COMMON_LIGHT, 'mermaid-bg': '#ffffff', 'mermaid-er-header': '#d6d6d3',
      'book-bg': '#F4F4F2', 'bg': '#F4F4F2', 'surface': '#E9E9E6', 'text': '#111111',
      'text-secondary': '#444444', 'border': '#9A9A96', 'accent': '#111111', 'accent-soft': '#E2E2DF',
      'code-bg': '#E9E9E6', 'code-text': '#111111', 'radius': '0',
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
    font-size: 1.0625rem;
    line-height: 1.7;
    -webkit-font-smoothing: auto;
}}
.md-editor h1, .md-editor h2, .md-editor h3, .md-editor h4 {{ font-family: inherit; font-weight: 700; letter-spacing: 0; }}
.md-editor h1 {{ font-size: 1.9rem; border-bottom: 2px solid var(--text); }}
.md-editor h2 {{ font-size: 1.4rem; border-bottom: 1px solid var(--border); }}
.md-editor .md-eyebrow {{ background: none; border: 1px solid var(--text); color: var(--text); border-radius: 0; }}
.md-editor a {{ text-decoration: underline; text-underline-offset: 2px; }}
.md-editor a:hover {{ background: var(--accent-soft); }}
.md-editor th {{ background: var(--table-head-bg); border-bottom: 2px solid var(--text); }}
.md-editor tr:nth-child(even) td {{ background: color-mix(in srgb, var(--text) 5%, transparent); }}
.md-editor th, .md-editor td {{ border-color: var(--border); }}
.md-editor code {{ border: 1px solid var(--border); }}
.md-editor pre {{ border: 1px solid var(--border); background: var(--surface); }}
/* Syntax colour has nowhere to go on grey paper: weight and slant carry it. */
.md-editor [class*="hljs-"] {{ color: var(--text); }}
.md-editor .hljs-comment, .md-editor .hljs-quote {{ color: var(--text-secondary); font-style: italic; }}
.md-editor .hljs-keyword, .md-editor .hljs-built_in, .md-editor .hljs-title, .md-editor .hljs-section,
.md-editor .hljs-selector-tag, .md-editor .hljs-name {{ font-weight: 700; }}
.md-editor .hljs-string, .md-editor .hljs-attr {{ text-decoration: underline; text-decoration-color: var(--border); text-underline-offset: 2px; }}
.md-editor blockquote, .md-editor .md-blockquotes {{ background: none; border-left: 2px solid var(--text); color: var(--text); font-style: italic; }}
.md-editor .md-blockquotes.md-note {{ border-left-style: dashed; background: var(--surface); font-style: normal; }}
.md-editor .md-blockquotes.md-info {{ border-left-style: double; border-left-width: 5px; background: none; font-style: normal; }}
.md-editor .md-example-box.md-good-box {{ border-left: .25rem solid var(--text); }}
.md-editor .md-example-box.md-bad-box {{ border-left: .25rem dashed var(--text); }}
.md-editor img {{ filter: grayscale(1) contrast(1.05); }}
.md-editor .mermaid-wrapper {{ filter: grayscale(1); }}
.md-editor hr {{ border-top: 1px solid var(--text); }}
.md-editor .md-code-copy-btn, .md-editor .md-code-full-btn, .md-editor .md-code-wrap-btn, .md-editor .md-code-beautify-btn,
.md-editor .mermaid-zoom-btn, .md-editor .mermaid-zoom-label, .md-editor select {{ border-radius: 0; }}
.md-editor {{ --h1-ink: #000000; --h2-ink: #1a1a1a; --h3-ink: #333333; --strong-ink: #000000; }}
html.dark .md-editor {{ --h1-ink: #ffffff; --h2-ink: #f0f0f0; --h3-ink: #d6d6d6; --strong-ink: #ffffff; }}
''')
