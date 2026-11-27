"""Generates themes/nord.css."""
from .core import *  # noqa: F401,F403

# ─────────────────────────── nord ───────────────────────────
emit('nord', 'Nord — arctic, bluish palette',
     {**COMMON_LIGHT, 'mermaid-bg': '#ECEFF4', 'book-bg': '#ECEFF4', 'bg': '#ECEFF4', 'surface': '#E5E9F0', 'text': '#2E3440',
      'text-secondary': '#4C566A', 'border': '#D8DEE9', 'accent': '#5E81AC', 'accent-soft': '#DFE6EF',
      # Nord's blue is 3.5:1 as body-size link text and 3.3:1 as a table head;
      # links take a darkened blue, table heads take the heading ink.
      'link-ink': '#516F94',
      # Headings, not a step down from the prose. The shared 60% mix landed on
      # #4B6281 — 5.4:1 beside a 10.8:1 body — so every h1–h3 read as faded text
      # rather than as a section opener, and h1's own #5E81AC was 3.5:1. This is
      # the same blue carried into the palette's dark end: 7.9:1, still clearly
      # blue against #2E3440 body copy.
      'heading-ink': '#2F4A6B',
      'code-bg': '#E5E9F0', 'code-text': '#9F5158', 'radius': '.25rem',
      'note-amber': '#7A5A12', 'note-amber-lt': '#F4EDDC', 'note-amber-border': '#EBCB8B',
      'info-blue': '#3B5F8A', 'info-blue-lt': '#E1EAF2', 'info-blue-border': '#81A1C1', 'fields-key': '#4E7A3A'},
     {'book-bg': '#2E3440', 'bg': '#2E3440', 'surface': '#3B4252', 'text': '#ECEFF4',
      'text-secondary': '#D8DEE9', 'border': '#434C5E', 'accent': '#88C0D0', 'accent-soft': '#3B4A5A',
      'link-ink': 'var(--accent)',
      # 7.9:1 (#B0D3DE) read as a dimmer grey beside a 10.8:1 body; at 10.1:1 the
      # heading is level with the prose and keeps Nord's frost hue.
      'heading-ink': '#D8EAF2',
      'code-bg': '#3B4252', 'code-text': '#DAA08E',
      'note-amber': '#EBCB8B', 'note-amber-lt': '#3D3A30', 'note-amber-border': '#EBCB8B',
      'info-blue': '#8FBCBB', 'info-blue-lt': '#33414A', 'info-blue-border': '#81A1C1', 'fields-key': '#A3BE8C'},
     ('#497337', '#7A5A12'), ('#A3BE8C', '#EBCB8B'),
     '''
.md-editor h1 { color: #4F46E5; border-bottom: 2px solid var(--border); }
html.dark .md-editor h1 { color: var(--heading-ink); }
.md-editor h2 { color: #4F46E5; border-bottom: 1px solid var(--border); }
html.dark .md-editor h2 { color: var(--heading-ink); }
.md-editor strong { color: #28408A; }
html.dark .md-editor strong { color: var(--strong-ink); }
/* h1–h3 all take --heading-ink (see the token block): one ink per mode, so a
   section opener cannot be dimmer than the size above or below it. */
/* The eyebrow is an inverted chip: nordfrost at full strength put cream on
   #5E81AC at 3.5:1 at 12px. The chip's own fill steps down to #4C6A94 (4.8:1)
   rather than repainting the accent everywhere it is used. */
.md-editor .md-eyebrow { background: #4C6A94; color: #ECEFF4; }
html.dark .md-editor .md-eyebrow { background: #88C0D0; color: #2E3440; }
.md-editor th { color: var(--heading-ink); }
.md-editor .md-example-box.md-good-box { border-left-color: #A3BE8C; }
.md-editor .md-example-box.md-bad-box { border-left-color: #BF616A; }
.md-editor { --h1-ink: #1e4f8a; --h2-ink: #2a5a96; --h3-ink: #35704f; }
html.dark .md-editor { --h1-ink: #9be4f6; --h2-ink: #7fc8e6; --h3-ink: #b3d68f; }
''')
