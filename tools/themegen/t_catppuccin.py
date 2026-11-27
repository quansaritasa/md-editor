"""Generates themes/catppuccin.css."""
from .core import *  # noqa: F401,F403

# ─────────────────────────── catppuccin ───────────────────────────
emit('catppuccin', 'Catppuccin Latte (light) and Mocha (dark) palettes',
     # Latte's own body ink (text, #4c4f69) reads 7.06:1 on --bg but greys out
     # beside its own bold runs and on a small UI panel, so the light --text is a
     # near-black navy instead: 16.38:1 on --bg, 15.23:1 on --surface. The rest of
     # the palette is untouched. Dark keeps Mocha's text (#cdd6f4).
     # Inline code, note/info blocks and meta text were tuned against the page
     # they sit on: Latte's pink (#ea76cb) read at 2.2:1 on --code-bg, its amber
     # (#df8e1d) at 2.2:1 on the note tint, its blue #1e66f5 at 3.9:1 on the info
     # tint and 4.3:1 as a link. Each is the palette's own hue, darkened only as
     # as far as AA needs (measured — see CHANGELOG).
     {**COMMON_LIGHT, 'mermaid-bg': '#eff1f5', 'book-bg': '#EFF1F5', 'bg': '#eff1f5', 'surface': '#e6e9ef', 'text': '#111222',
      'text-secondary': '#64667A', 'border': '#ccd0da', 'accent': '#1e66f5', 'accent-soft': '#dce4fb',
      'link-ink': '#1d63ee',
      'code-bg': '#e6e9ef', 'code-text': '#9a4e86', 'radius': '.5rem',
      'note-amber': '#915C12', 'note-amber-lt': '#f8ecd6', 'note-amber-border': '#df8e1d',
      'info-blue': '#1b5ddf', 'info-blue-lt': '#dce4fb', 'info-blue-border': '#7287fd', 'fields-key': '#40a02b'},
     {'book-bg': '#1E1E2E', 'bg': '#1e1e2e', 'surface': '#181825', 'text': '#cdd6f4',
      'text-secondary': '#a6adc8', 'border': '#313244', 'accent': '#89b4fa', 'accent-soft': '#26304a',
      'link-ink': 'var(--accent)',
      'code-bg': '#181825', 'code-text': '#f5c2e7',
      'note-amber': '#f9e2af', 'note-amber-lt': '#2e2a24', 'note-amber-border': '#f9e2af',
      'info-blue': '#89b4fa', 'info-blue-lt': '#1f2637', 'info-blue-border': '#b4befe', 'fields-key': '#a6e3a1'},
     ('#2F7620', '#915C13'), ('#a6e3a1', '#f9e2af'),
     '''
.md-editor h1 { color: #8839ef; border-bottom: none; }
html.dark .md-editor h1 { color: #cba6f7; }
.md-editor h2 { color: var(--accent); border-bottom: 1px solid var(--border); }
/* h3 takes the shared --heading-ink: Latte's teal (#179299) is 3.3:1 on --bg,
   under AA at h3's 16.8px. */
.md-editor .md-eyebrow { background: #8839ef; color: #eff1f5; }
html.dark .md-editor .md-eyebrow { background: #cba6f7; color: #1e1e2e; }
.md-editor th { color: var(--heading-ink); }
.md-editor blockquote, .md-editor .md-blockquotes { border-left-width: .25rem; }
.md-editor .md-example-box.md-good-box { border-left-color: #40a02b; }
.md-editor .md-example-box.md-bad-box { border-left-color: #d20f39; }
html.dark .md-editor .md-example-box.md-good-box { border-left-color: #a6e3a1; }
html.dark .md-editor .md-example-box.md-bad-box { border-left-color: #f38ba8; }
.md-editor pre { border-radius: .625rem; }
.md-editor { --h1-ink: #7b2fdc; --h2-ink: #1a5be0; --h3-ink: #0b6f75; --strong-ink: #a84300; }
html.dark .md-editor { --h1-ink: #cba6f7; --h2-ink: #8fbaff; --h3-ink: #94e2d5; --strong-ink: #fab387; }
''')
