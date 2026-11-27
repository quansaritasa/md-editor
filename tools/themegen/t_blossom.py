"""Generates themes/blossom.css."""
from .core import *  # noqa: F401,F403

# ─────────────────────────── blossom ───────────────────────────
emit('blossom', 'Blossom — soft pink paper, raspberry accents, rounded edges',
     {**COMMON_LIGHT, 'mermaid-bg': '#fff5f8', 'book-bg': '#FFF5F8', 'bg': '#FFF5F8', 'surface': '#FDE9F0', 'text': '#3D2430',
      'text-secondary': '#806470', 'border': '#F2CEDD', 'accent': '#C2255C', 'accent-soft': '#FCE0EB',
      'code-bg': '#FDE9F0', 'code-text': '#A61E4D', 'radius': '.75rem',
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
.md-editor .md-header { border-bottom: 1px solid var(--border); }
.md-editor .md-eyebrow { border-radius: 62.4375rem; letter-spacing: 0.08em; font-weight: 600; }
.md-editor a { text-decoration-color: var(--accent-soft); text-decoration-thickness: 2px; text-underline-offset: 3px; }
.md-editor a:hover { text-decoration-color: var(--accent); }
.md-editor th { background: var(--accent-soft); color: var(--accent); }
.md-editor tr:nth-child(even) td { background: var(--surface); }
.md-editor code { border-radius: .375rem; }
.md-editor pre { border-radius: var(--radius); }
.md-editor blockquote, .md-editor .md-blockquotes { border-left-width: .25rem; border-radius: 0 var(--radius) var(--radius) 0; }
.md-editor .md-example-box, .md-editor .md-block-card, .md-editor .mermaid-wrapper { border-radius: var(--radius); }
.md-editor hr { border: none; text-align: center; margin: 2.25rem 0; }
.md-editor hr::after { content: "❀"; color: var(--accent); font-size: 1.1rem; }
.md-editor .md-code-copy-btn, .md-editor .md-code-full-btn, .md-editor .md-code-wrap-btn, .md-editor .md-code-beautify-btn,
.md-editor .mermaid-zoom-btn, .md-editor .mermaid-zoom-label, .md-editor select {
    border-radius: 62.4375rem;
}
''')
