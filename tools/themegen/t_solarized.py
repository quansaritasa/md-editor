"""Generates themes/solarized.css."""
from .core import *  # noqa: F401,F403

# ─────────────────────────── solarized ───────────────────────────
emit('solarized', 'Solarized — light and dark, the classic pair',
     # Solarized's light body ink is base01 (#586E75), which is deliberately
     # low-contrast ink — 4.99:1 on base3 — and reads washed out in a small
     # panel. base02 (#073642) is the same palette's own dark, one step in:
     # 12.05:1 on --bg, 10.61:1 on --surface. Dark keeps base1 (#93A1A1).
     # Secondary, code and the note/info inks were all under AA on the page they
     # sit on (base0 meta at 2.9:1, magenta code at 3.7:1, amber note at 4.4:1).
     {**COMMON_LIGHT, 'mermaid-bg': '#FDF6E3', 'book-bg': '#FDF6E3', 'bg': '#FDF6E3', 'surface': '#EEE8D5', 'text': '#073642',
      'text-secondary': '#5E6A6C', 'border': '#D9D2BC', 'accent': '#268BD2', 'accent-soft': '#E1E8DA',
      'strong-ink': '#A3261F', 'link-ink': '#1F55D0',
      'code-bg': '#EEE8D5', 'code-text': '#B52E6F', 'radius': '.25rem',
      'note-amber': '#836200', 'note-amber-lt': '#F4EBC9', 'note-amber-border': '#B58900',
      'info-blue': '#1C6CA3', 'info-blue-lt': '#E1E8DA', 'info-blue-border': '#268BD2', 'fields-key': '#6C7B00'},
     {'book-bg': '#002B36', 'bg': '#002B36', 'surface': '#073642', 'text': '#93A1A1',
      'text-secondary': '#82939A', 'border': '#0E4553', 'accent': '#268BD2',
      # 48% accent (not the shared 60%): this palette's blue is its dimmest ink,
      # and above ~50% the syntax tokens land under AA on the code surface.
      'heading-ink': 'color-mix(in srgb, var(--accent) 48%, var(--text))',
      # accent-soft is the quote's fill, and #0A3F52 held --text at 4.25:1. One
      # step darker (5.1:1) keeps the quote legible without touching the ink.
      'accent-soft': '#08323F',
      'strong-ink': '#F2A08C', 'link-ink': '#5AA8E4',
      'code-bg': '#073642', 'code-text': '#DB815C',
      'note-amber': '#BE971F', 'note-amber-lt': '#0F3A3A', 'note-amber-border': '#B58900',
      'info-blue': '#66AFE3', 'info-blue-lt': '#0A3F52', 'info-blue-border': '#268BD2', 'fields-key': '#859900'},
     ('#1E726C', '#826300'), ('#2AA198', '#B58900'),
     '''
/* Solarized's own ink is deliberately low-contrast: base1 (#93A1A1) is 4.0:1 on
   base03 and base01 the same on base3, so headings and bold runs take the
   shared --heading-ink / --strong-ink, which mix the palette's blue and ink
   into something that clears AA instead of vanishing into the page. h2 keeps
   solarized's blue — at 25.6px it is large text and 3.4:1 clears AA-large. */
.md-editor h1 { border-bottom: 2px solid var(--border); }
.md-editor h2 { color: #268BD2; }
html.dark .md-editor h2 { color: #268BD2; }
/* base1 on the tinted header band was 3.9:1 — the band is a --surface mix, not
   the page. base0 (#B8C4C4) is the same family, one step up: 5.8:1. */
html.dark .md-editor th { color: #B8C4C4; }
.md-editor { --h1-ink: #104f6d; --h2-ink: #1b6c9e; --h3-ink: #1b6f68; }
html.dark .md-editor { --h1-ink: #b4d8f4; --h2-ink: #5aa8e4; --h3-ink: #8fc9c3; }
.md-editor .md-eyebrow { background: #8A6700; color: #FDF6E3; }
html.dark .md-editor .md-eyebrow { background: #B58900; color: #002B36; }
.md-editor .md-example-box.md-good-box { border-left-color: #859900; }
.md-editor .md-example-box.md-bad-box { border-left-color: #DC322F; }
''')
