"""Shared body, tokens and emit() for the generated palette themes."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent / 'themes'
modern = (ROOT / 'modern.css').read_text()
# Everything from the first typography rule onward is the shared body.
BODY = modern[modern.index('.md-editor {\n    font-family:'):]

# BODY is sliced out of modern.css, so it arrives carrying modern's own spacing.
# The eight generated palette themes run tighter than modern: their section gap
# is .75rem against modern's 2rem, and an h2 outside a section falls back to a
# wider top margin. Both deltas are applied here rather than hand-edited into
# each generated file, so re-running this tool reproduces what is committed
# instead of quietly reverting to modern's numbers.
_RHYTHM_AT = BODY.index('/* \u2500\u2500 Section rhythm')
SECTION_RHYTHM = BODY[_RHYTHM_AT:].rstrip('\n')
BODY = BODY[:_RHYTHM_AT].rstrip('\n').replace(
    '    margin: 2rem 0 1rem;\n    padding-bottom: .5rem;',
    '    margin: 3.25rem 0 1rem;\n    padding-bottom: .5rem;')
# The block trails the per-theme overrides so a theme can reshape .md-section and
# still have the gap land last.
SECTION_RHYTHM = SECTION_RHYTHM.replace('.md-editor .md-section { margin-bottom: 2rem; }',
                                        '.md-editor .md-section { margin-bottom: .75rem; }')

# The shared body ends in modern's hard-coded ladder (blue h1/h2, purple h3, link
# blue). On a palette theme that repaints every heading and link in modern's
# hues, so the variable blocks are cut out here and replaced by LADDER, which is
# built from the theme's own tokens. The h1-h3 colour rules stay where they are.
_LADDER_VARS = re.compile(r'\.md-editor \{\n    --h1-ink:.*?\n\}\nhtml\.dark \.md-editor \{\n    --h1-ink:.*?\n\}\n', re.S)
assert _LADDER_VARS.search(SECTION_RHYTHM), 'modern.css ladder block moved'
SECTION_RHYTHM = _LADDER_VARS.sub('', SECTION_RHYTHM)
# h1 is the heading ink, h2 leans toward the accent, h3 toward the secondary text.
# Measured at >= 5:1 on the page in both modes; a theme that needs better
# declares its own --hN-ink in its overrides, which come after this block.
LADDER = '''/* Heading ladder, from the theme's own tokens. */
.md-editor, html.dark .md-editor {
    --h1-ink: var(--heading-ink);
    --h2-ink: color-mix(in srgb, var(--accent) 45%, var(--heading-ink));
    --h3-ink: color-mix(in srgb, var(--text-secondary) 50%, var(--heading-ink));
}'''

MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
SERIF = '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Times New Roman", serif'
SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
# Block names the IBM Plex faces first and falls back to the stacks above, so a
# machine that has Plex gets the intended type and nobody pays a font request.
PLEX_SANS = '"IBM Plex Sans", ' + SANS
PLEX_SERIF = '"IBM Plex Serif", ' + SERIF
PLEX_MONO = '"IBM Plex Mono", ' + MONO

TOKENS = ['book-bg', 'mermaid-bg', 'mermaid-er-header', 'bg', 'surface', 'text', 'text-secondary', 'border',
          'accent', 'accent-soft', 'table-head-bg', 'heading-ink', 'strong-ink', 'link-ink', 'code-bg', 'code-text',
          'radius', 'max-w',
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
             BODY.rstrip('\n'), LADDER,
             f'/* ── {name}: typography and component reshaping ── */',
             overrides.strip('\n'), '', SECTION_RHYTHM, '']
    (ROOT / f'{name}.css').write_text('\n'.join(parts))
    print(name, (ROOT / f'{name}.css').stat().st_size)


# --mermaid-er-header paints the title band of an ER table (css/base.css).
# It is declared in the light block only: the value reads --accent, which the
# dark block overrides on the same element, so one line serves both modes.
#
# --heading-ink / --strong-ink are the two inks the shared body uses for h1–h3
# and for <strong>. Both are the theme's accent pulled back toward its body ink,
# and they exist because inheriting --text made a heading and the paragraph
# under it one colour; size and weight alone carried the hierarchy, which read
# as flat next to plain prose. Derived here rather than hand-picked per palette:
# an accent mixed with the body ink keeps the theme's hue, darkens toward the
# page's own ink (so it clears AA at h3's 16.8px), and repaints itself in dark
# mode off the same two variables. Headings take 60% accent, strong runs 42% —
# bold text should register as emphasis, not compete with the heading above it.
# A theme that wants a different ink for either role just declares its own
# value; a grayscale theme (eink, accent == text) mixes to plain text by the
# same formula, so it stays weight-and-rule only without a special case.
COMMON_LIGHT = {'mermaid-bg': '#f6f8fa', 'max-w': '56.25rem',
                'mermaid-er-header': 'color-mix(in srgb, var(--accent) 45%, var(--mermaid-bg))',
                # The table's header band. --surface is already the striped row,
                # so a header painted with it looked like one more zebra row in
                # five palettes (nord, catppuccin, gruvbox, modern, solarized).
                # The body ink over --surface is a muted, near-neutral band: it
                # takes no accent hue, so the header never competes with the
                # links and headings above it, and it is one solid step off both
                # the page and the stripe in either mode (measured 1.34:1 to
                # 8.4:1 luminance across the palettes). 16% is the ceiling that
                # still keeps every header label at or above 4.85:1.
                # Revised: the neutral band read the same in every theme, so the
                # header now takes the theme's own accent (20% over --surface).
                # Still one step off the stripe; eink's accent is its ink, so it
                # stays gray without a special case.
                'table-head-bg': 'color-mix(in srgb, var(--accent) 20%, var(--surface))',
                'heading-ink': 'color-mix(in srgb, var(--accent) 60%, var(--text))',
                'strong-ink': 'color-mix(in srgb, var(--accent) 42%, var(--text))',
                # Link ink defaults to the accent. A palette whose accent is too
                # light on its own page (solarized's blue, nord's blue, glass's
                # indigo) overrides this one token instead of darkening --accent
                # itself, which would repaint h1, borders and the eyebrow chip
                # with it. See the per-theme blocks below.
                'link-ink': 'var(--accent)'}
