"""Generates themes/terminal.css."""
from .core import *  # noqa: F401,F403

# ─────────────────────────── terminal ───────────────────────────
emit('terminal', 'Monospace, phosphor accents, dark-first console feel',
     {**COMMON_LIGHT, 'book-bg': '#F1F1EA', 'bg': '#F7F7F2', 'surface': '#ECEEE7', 'text': '#1F2A22',
      'text-secondary': '#5F6F62', 'border': '#CFD6CD', 'accent': '#0B7A3B', 'accent-soft': '#E1F0E5',
      'code-bg': '#ECEEE7', 'code-text': '#8A5A00', 'radius': '0',
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
    font-size: .9375rem;
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
.md-editor h1 {{ font-size: 1.6rem; padding-bottom: .75rem; border-bottom: 1px dashed var(--border); }}
.md-editor h2 {{ font-size: 1.25rem; margin: 2.75rem 0 .75rem; padding-bottom: .5rem; border-bottom: 1px dashed var(--border); }}
.md-editor h3 {{ font-size: 1.05rem; }}
.md-editor h4 {{ font-size: 0.95rem; }}
.md-editor .md-eyebrow {{ border-radius: 0; background: none; border: 1px solid var(--accent); padding: .125rem .5rem; }}
.md-editor a {{ text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 3px; }}
.md-editor a:hover {{ text-decoration-style: solid; background: var(--accent-soft); }}
.md-editor strong {{ color: var(--accent); font-weight: 700; }}
.md-editor code {{ padding: .125rem .25rem; border: 1px solid var(--border); }}
.md-editor pre {{ font-size: 0.9rem; border-left: .1875rem solid var(--accent); }}
.md-editor pre code {{ font-size: inherit; }}
.md-editor blockquote, .md-editor .md-blockquotes {{ background: none; border-left: .1875rem solid var(--text-secondary); color: var(--text-secondary); }}
.md-editor blockquote p::before {{ content: "> "; color: var(--text-secondary); }}
.md-editor th {{ text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.87em; }}
.md-editor tr:nth-child(even) td {{ background: color-mix(in srgb, var(--text) 5%, transparent); }}
.md-editor hr {{ border-top: 1px dashed var(--border); }}
.md-editor ul {{ list-style: none; margin-left: 0; padding-left: 0; }}
.md-editor ul > li {{ padding-left: 2rem; position: relative; }}
.md-editor li > ul {{ padding-left: 0; margin-left: -.75rem; }}
.md-editor ul > li::before {{ content: "-"; position: absolute; left: .875rem; color: var(--accent); }}
.md-editor ul ul > li::before {{ content: "·"; }}
.md-editor .md-code-copy-btn, .md-editor .md-code-full-btn, .md-editor .md-code-wrap-btn, .md-editor .md-code-beautify-btn,
.md-editor .mermaid-zoom-btn, .md-editor .mermaid-zoom-label, .md-editor select {{
    border-radius: 0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}}
''')
