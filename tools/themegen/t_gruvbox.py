"""Generates themes/gruvbox.css."""
from .core import *  # noqa: F401,F403

# ─────────────────────────── gruvbox ───────────────────────────
emit('gruvbox', 'Gruvbox — warm retro palette',
     {**COMMON_LIGHT, 'mermaid-bg': '#F1E8D4', 'book-bg': '#F1E8D4', 'bg': '#F1E8D4', 'surface': '#E7DCC0', 'text': '#3A3024',
      'text-secondary': '#6B5F4A', 'border': '#D3C5A5', 'accent': '#076678', 'accent-soft': '#E4DFC0',
      'code-bg': '#E7DCC0', 'code-text': '#AD3903', 'radius': '.1875rem',
      'note-amber': '#85560F', 'note-amber-lt': '#F1E3B8', 'note-amber-border': '#D79921',
      'info-blue': '#076678', 'info-blue-lt': '#E3E1C4', 'info-blue-border': '#458588', 'fields-key': '#605C0A'},
     {'book-bg': '#282828', 'bg': '#282828', 'surface': '#3C3836', 'text': '#EBDBB2',
      'text-secondary': '#A89984', 'border': '#504945', 'accent': '#83A598', 'accent-soft': '#3A4442',
      'code-bg': '#3C3836', 'code-text': '#FE8019',
      'note-amber': '#FABD2F', 'note-amber-lt': '#3D3521', 'note-amber-border': '#D79921',
      'info-blue': '#87A89B', 'info-blue-lt': '#2F3A3A', 'info-blue-border': '#458588', 'fields-key': '#B8BB26'},
     ('#67630C', '#84560F'), ('#B8BB26', '#FABD2F'),
     '''
.md-editor h1 { color: #9D0006; border-bottom: 2px solid var(--border); }
html.dark .md-editor h1 { color: #FB4934; }
.md-editor h2 { color: #881337; border-bottom: 1px solid var(--border); }
html.dark .md-editor h2 { color: #B8BB26; }
/* h3 takes the shared --heading-ink: #B57614 is 3.3:1 on the cream page.
   Light mode is a sepia page (#F1E8D4, body ink #3A3024 at 10.6:1); h2 is rose #881337;
   fields-key green steps from #79740E (4.0:1) to #605C0A so it clears AA on it. */
.md-editor .md-eyebrow { background: #AF3A03; color: #FBF1C7; }
html.dark .md-editor .md-eyebrow { background: #FE8019; color: #282828; }
.md-editor strong { color: #9D0006; }
/* Bold runs in dark were #FB4934 — 4.29:1 at body size, and 3.4:1 on a
   --surface block, so emphasis faded on cards and quotes. The palette's orange
   clears both (5.8:1 / 4.6:1) and stays in the warm family. */
html.dark .md-editor strong { color: #FE8019; }
.md-editor .md-example-box.md-good-box { border-left-color: #605C0A; }
.md-editor .md-example-box.md-bad-box { border-left-color: #9D0006; }
html.dark .md-editor .md-example-box.md-good-box { border-left-color: #B8BB26; }
html.dark .md-editor .md-example-box.md-bad-box { border-left-color: #FB4934; }
.md-editor { --h1-ink: #076678; --h2-ink: #a53600; --h3-ink: #66620b; }
html.dark .md-editor { --h1-ink: #83a598; --h2-ink: #fabd2f; --h3-ink: #b8bb26; }
''')
