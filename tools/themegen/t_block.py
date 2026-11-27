"""Generates themes/block.css."""
from .core import *  # noqa: F401,F403

# ─────────────────────────── block ───────────────────────────
# Block — the RecordsFlow review-page identity: cool paper, teal accent, clay
# counter-accent, hairlines instead of shadows, IBM Plex in three roles. The
# Plex faces are named first and fall back to the system stacks, so the theme
# never pulls a font over the network — no other theme here does either.
emit('block', 'Block — cool paper, teal accent, hairline structure, IBM Plex in three roles',
     {**COMMON_LIGHT, 'mermaid-bg': '#f6f8f7', 'book-bg': '#EEF1F0', 'bg': '#FFFFFF', 'surface': '#ECFDF5D4',
      'text': '#11191A', 'text-secondary': '#5B6A6B', 'border': '#D4DCDB',
      'accent': '#0E6A61', 'accent-soft': '#E2EFEC', 'table-head-bg': '#E9FFFD',
      'code-bg': '#F6F8F7', 'code-text': '#9B4732', 'radius': '.3125rem',
      'note-amber': '#9B4732', 'note-amber-lt': '#F6E9E4', 'note-amber-border': '#C08165',
      'info-blue': '#1F5E6E', 'info-blue-lt': '#E3EEF0', 'info-blue-border': '#4F8B99', 'fields-key': '#0E6A61'},
     {'book-bg': '#0D1413', 'bg': '#141C1B', 'surface': '#111817', 'text': '#E4ECEA',
      'text-secondary': '#95A5A3', 'border': '#26312F',
      'accent': '#52B6A7', 'accent-soft': '#12302C',
      'code-bg': '#111817', 'code-text': '#D4866A',
      'note-amber': '#D4866A', 'note-amber-lt': '#2C1D17', 'note-amber-border': '#A9603F',
      'info-blue': '#8FC4CF', 'info-blue-lt': '#0E1E22', 'info-blue-border': '#4F8B99', 'fields-key': '#52B6A7'},
     ('#0E6A61', '#9B4732'), ('#52B6A7', '#D4866A'),
     f'''
.md-editor {{
    font-family: {PLEX_SANS};
    font-size: .9375rem;
    line-height: 1.5;
}}
/* Serif for headings, sans for prose, mono for anything counted. */
.md-editor h1, .md-editor h2, .md-editor h3 {{
    font-family: {PLEX_SERIF};
    font-weight: 600;
    letter-spacing: -0.01em;
    text-wrap: balance;
    border-bottom: none;
}}
.md-editor h1 {{ font-size: 1.75rem; line-height: 1.15; margin-bottom: 1.25rem; }}
.md-editor h2 {{ font-size: 1.27rem; margin: 2.5rem 0 .75rem; padding-bottom: .5rem; border-bottom: 1px solid var(--border); }}
.md-editor h3 {{ font-size: 1.05rem; margin: 1.75rem 0 .5rem; }}
/* h4 stops being a heading and becomes a label — the smallest structural mark. */
.md-editor h4 {{
    font-family: {PLEX_SANS};
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin: 1.5rem 0 .25rem;
}}
.md-editor .md-eyebrow {{ background: none; border: 1px solid var(--border); color: var(--text-secondary); border-radius: .125rem; letter-spacing: 0.11em; padding: .125rem .5rem; }}
.md-editor a {{ text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); }}
.md-editor a:hover {{ border-bottom-color: var(--accent); }}
.md-editor strong {{ font-weight: 600; }}
.md-editor code {{ font-family: {PLEX_MONO}; padding: 0.05em 0.3em; border: 1px solid var(--border); border-radius: .1875rem; }}
.md-editor pre {{ font-family: {PLEX_MONO}; font-size: 0.86rem; line-height: 1.55; border: 1px solid var(--border); border-radius: var(--radius); padding: .75rem 1.25rem; background: var(--code-bg); }}
.md-editor pre code {{ border: none; padding: 0; font-size: inherit; }}
/* A quote is a rail, not a filled box. */
.md-editor blockquote, .md-editor .md-blockquotes {{ background: none; border-left: 2px solid var(--border); border-radius: 0; padding: 0 0 0 .75rem; color: var(--text-secondary); }}
/* Tables are read as data: hairlines, a label row, and digits that line up. */
.md-editor table {{ font-size: 0.9em; font-variant-numeric: tabular-nums; }}
.md-editor th, .md-editor td {{ border-left: none; border-right: none; border-bottom: 1px solid var(--border); padding: .5rem .75rem; }}
.md-editor th {{ background: var(--table-head-bg); font-size: 0.78em; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: color-mix(in srgb, var(--text-secondary) 70%, var(--text)); }}
.md-editor tr:nth-child(even) td {{ background: color-mix(in srgb, var(--text) 5%, transparent); }}
.md-editor hr {{ border: none; border-top: 1px solid var(--border); margin: 1.75rem 0; }}
/* A task box is drawn, never a glyph. */
.md-editor li > input[type="checkbox"] {{ appearance: none; width: .625rem; height: .625rem; border: 1px solid var(--text-secondary); border-radius: .125rem; background: none; }}
.md-editor li > input[type="checkbox"]:checked {{ background: var(--accent); border-color: var(--accent); }}
/* The page is the ground and every section is a card standing on it. This is
   the structure the RecordsFlow review page is built from and the one thing
   that makes the theme "Block": a hairline border and no shadow at all. */
.md-editor {{ background: var(--book-bg); }}
/* Doubled class throughout: the shared Section-rhythm block is emitted last
   and claims both `.md-section` and its opening h2, so reshaping either into a
   card needs one more point of specificity than the block that follows. */
.md-editor.md-editor .md-section {{
    background: var(--bg);
    border: 1px solid var(--border);
    /* The accent is spent on the card's top edge rather than on any text, so it
       competes with nothing — a link or an inline emphasis in the same colour
       still means what it meant. A document of stacked cards gets a scannable
       rhythm out of it. The rule sits outside the padding box, so the header
       strip's full-bleed pull below is untouched: it is simply capped. */
    border-top: .1875rem solid var(--accent);
    border-radius: var(--radius);
    /* The card's inset and its header strip's pull have to be ONE number, or the
       strip stops at the edge of the padding box while the card runs on past it
       — a host that pads the sides further than the top did exactly that, and
       the strip stood 25px inside a card it was meant to span edge to edge.
       --section-padding is the host's inset (a padding slider drives it);
       --section-pad-x is how much further a host insets the SIDES only, which
       an unboxed theme needs because its top inset is deeper than its sides
       (Qview's model does this). Read the pair once, here, and derive the rest
       of the card from it. */
    --block-pad-y: var(--section-padding, 22px);
    --block-pad-x: calc(var(--section-padding, 22px) + var(--section-pad-x, 0px));
    padding: var(--block-pad-y) var(--block-pad-x);
    margin-bottom: 2rem;
    overflow: hidden;
}}
/* The opening h2 is the card's header strip — pulled out to the card edge with
   a hairline under it, the way the ticket header it comes from is drawn. The
   pull tracks the card's own inset (the pair above) rather than a fixed number,
   so a host that drives --section-padding (a padding slider, say) keeps the
   strip flush at any inset the reader picks — and the strip's own side padding
   tracks it too, so the header sits on the same left edge as the prose under it
   instead of hanging inboard of it. */
.md-editor.md-editor .md-section > h2:first-child {{
    margin: calc(-1 * var(--block-pad-y)) calc(-1 * var(--block-pad-x)) var(--block-pad-y);
    padding: 1rem var(--block-pad-x);
    /* Sunk, not tinted with the accent: the strip earns its own band from the
       surface it sits on, which leaves the heading reading as prose. */
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    font-size: 1.15rem;
}}
/* Collapsed, a card is only its header strip. The strip is pulled full-bleed
   out of the card's inset, so once the body is hidden that inset stands as
   empty white above and below the title — and it cannot be cancelled with a
   negative margin, because .md-section is its own formatting context and an
   auto height clamps at zero before the padding is reached. So the padding
   itself goes and the strip stops pulling: the two undo each other and the
   card ends exactly where the strip does. The strip's hairline goes too — the
   card's own border now sits directly under it, and two lines a pixel apart
   read as a mistake.

   A host that drives --section-padding from an id-scoped rule (Qview's padding
   slider does) outranks the padding line here and has to repeat it; the margin
   and border below are this theme's alone and hold everywhere. */
.md-editor.md-editor .md-section:has(> h2.sec-collapsed:first-child) {{
    padding: 0;
}}
.md-editor.md-editor .md-section > h2.sec-collapsed:first-child {{
    margin: 0;
    border-bottom: none;
}}
''')
