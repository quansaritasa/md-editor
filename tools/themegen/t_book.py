"""Generates themes/book.css."""
from .core import *  # noqa: F401,F403

# ─────────────────────────── book ───────────────────────────
emit('book', 'Book — warm cream paper, soft sepia ink',
     # Body ink #3A332A is 10.5:1 on the page: firm without the glare of black on
     # cream. Secondary #6B6254 stays above 4.7:1 even on --surface. The accent is
     # a sienna for links and rules. Light headings and bold are violet (h1 #6B21A8,
     # h2/h3 #5B21B6, bold #7C3AED); dark keeps Terminal's green ink (its 60% and 42%
     # accent mixes, as hex), so the page is not one wash of brown or amber.
     {**COMMON_LIGHT, 'mermaid-bg': '#F6F1E7', 'book-bg': '#F6F1E7', 'bg': '#F6F1E7', 'surface': '#ECE5D3', 'text': '#3A332A',
      'text-secondary': '#6B6254', 'border': '#D9CFB8', 'accent': '#7A3E1D', 'accent-soft': '#EADFCB',
      'code-bg': '#ECE5D3', 'code-text': '#8F3A12', 'radius': '.1875rem',
      'heading-ink': '#003C97', 'strong-ink': '#094299',
      'note-amber': '#85560F', 'note-amber-lt': '#F3E7C4', 'note-amber-border': '#C9962E',
      'info-blue': '#2F5D6B', 'info-blue-lt': '#E3E6DA', 'info-blue-border': '#5E8A96', 'fields-key': '#4F6B2A'},
     {'book-bg': '#1F1B16', 'bg': '#1F1B16', 'surface': '#2A251E', 'text': '#E8DFCC',
      'text-secondary': '#A89D86', 'border': '#3A342A', 'accent': '#D9A066', 'accent-soft': '#3A3128',
      'code-bg': '#2A251E', 'code-text': '#E8A87C',
      'heading-ink': '#8ADBA8', 'strong-ink': '#A1DEB4',
      'note-amber': '#E0B060', 'note-amber-lt': '#352D1F', 'note-amber-border': '#C9962E',
      'info-blue': '#8FB8C4', 'info-blue-lt': '#27302F', 'info-blue-border': '#5E8A96', 'fields-key': '#B5C77A'},
     ('#4F6B2A', '#8A5A12'), ('#B5C77A', '#E0B060'),
     '''
.md-editor h1 { border-bottom: 2px solid var(--border); color: #6B21A8; }
html.dark .md-editor h1 { color: var(--heading-ink); }
.md-editor { --h1-ink: #003c97; --h2-ink: #0d4aa8; --h3-ink: #2e4a7d; --strong-ink: #094299; }
html.dark .md-editor { --h1-ink: #f3dfbd; --h2-ink: #f0b868; --h3-ink: #c9dc9c; --strong-ink: #ffc2ab; }
.md-editor h2 { border-bottom: 1px solid var(--border); }
.md-editor .md-eyebrow { background: #7A3E1D; color: #F6F1E7; }
html.dark .md-editor .md-eyebrow { background: #D9A066; color: #1F1B16; }
.md-editor .md-example-box.md-good-box { border-left-color: #4F6B2A; }
.md-editor .md-example-box.md-bad-box { border-left-color: #9D2A12; }
html.dark .md-editor .md-example-box.md-good-box { border-left-color: #B5C77A; }
html.dark .md-editor .md-example-box.md-bad-box { border-left-color: #E8836A; }
''')
