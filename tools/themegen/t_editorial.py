"""Generates themes/editorial.css."""
from .core import *  # noqa: F401,F403

# ─────────────────────────── editorial ───────────────────────────
emit('editorial', 'Newspaper — display serif headings, hairline rules, drop cap',
     {**COMMON_LIGHT, 'mermaid-bg': '#ffffff', 'book-bg': '#FBF8F2', 'bg': '#FFFDF9', 'surface': '#F5F1EA', 'text': '#1A1A1A',
      'text-secondary': '#5C5C5C', 'border': '#C9C4BA', 'accent': '#A31621', 'accent-soft': '#F8E9EA',
      'code-bg': '#F0ECE4', 'code-text': '#1A1A1A', 'radius': '.125rem',
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
    font-size: 1.125rem;
    line-height: 1.65;
    -webkit-font-smoothing: auto;
}}
.md-editor h1, .md-editor h2, .md-editor h3, .md-editor h4 {{ font-family: inherit; }}
.md-editor .md-header {{ text-align: center; border-bottom: .1875rem double var(--text); padding-bottom: 1.25rem; }}
.md-editor .md-header h1 {{ border-bottom: none; }}
.md-editor .md-meta {{ justify-content: center; font-style: italic; }}
.md-editor .md-eyebrow {{ background: none; border-top: 1px solid var(--text); border-bottom: 1px solid var(--text); border-radius: 0; color: var(--text); letter-spacing: 0.2em; padding: .125rem 0; }}
.md-editor h1 {{ font-size: 2.8rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; text-align: center; border-bottom: .1875rem double var(--text); padding-bottom: 1rem; margin-bottom: 1.25rem; }}
.md-editor h2 {{ font-size: 1.6rem; font-weight: 700; letter-spacing: -0.01em; border-bottom: none; border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 2.75rem; }}
.md-editor h3 {{ font-size: 1.05rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }}
.md-editor h4 {{ font-style: italic; font-weight: 600; font-size: 1.05rem; }}
/* The opening paragraph gets a drop cap, the way a front-page column does. */
.md-editor h1 + p::first-letter, .md-editor .md-header + p::first-letter {{
    float: left; font-size: 3.6em; line-height: 0.8; padding: .5rem .5rem 0 0; font-weight: 800; color: var(--accent);
}}
.md-editor p {{ text-align: justify; hyphens: auto; }}
.md-editor li {{ text-align: left; }}
.md-editor a {{ text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; color: var(--text); }}
.md-editor a:hover {{ color: var(--accent); }}
.md-editor strong {{ font-weight: 700; }}
.md-editor blockquote {{ border-left: none; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: none; text-align: center; font-style: italic; font-size: 1.2em; line-height: 1.5; padding: 1.25rem 1.75rem; color: var(--text); border-radius: 0; margin: 1.5rem 0; }}
.md-editor blockquote p {{ text-align: center; }}
.md-editor table {{ font-size: 0.92em; font-family: {SANS}; }}
.md-editor th, .md-editor td {{ border-left: none; border-right: none; }}
.md-editor th {{ background: var(--table-head-bg); border-top: 2px solid var(--text); border-bottom: 1px solid var(--text); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.815em; }}
.md-editor tr:nth-child(even) td {{ background: color-mix(in srgb, var(--text) 5%, transparent); }}

.md-editor pre {{ font-size: 0.82rem; border: none; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); border-radius: 0; }}
.md-editor hr {{ border: none; text-align: center; margin: 2.25rem 0; }}
.md-editor hr::after {{ content: "❦"; color: var(--text-secondary); font-size: 1.2rem; }}
.md-editor .md-example-box, .md-editor .md-block-card {{ font-family: {SANS}; font-size: 0.95rem; }}
''')
