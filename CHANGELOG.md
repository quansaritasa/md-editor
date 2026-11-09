- Theme editor: Changes log reads 'card.css: change Heading 1: Text size 32px → 28px', with a copy icon; Block table header is #E9FFFD

# Changelog

## Unreleased — unique class names

- **Breaking for hosts that style library output.** Every generic class the library emits now carries the `md-` prefix, so a host's own `.header`, `.meta`, `.info`, `.a` or `.q` can no longer restyle a document: `header`, `eyebrow`, `meta`, `meta-item`, `meta-label`, `fields`, `section`, `q`, `a`, `copied`, `table-scroll`, `kv-label`, `txt-head`, `block-card`, `block-grid`, `code-block`, `code-copy-btn`, `code-full-btn`, `code-wrap-btn`, `info`, `note`, `blockquotes`, `example-box`, `good-box`, `bad-box`. The code-wrap button's `active` state is now `md-active`.
- Removed dead CSS no code emits: `.theme-btn` (all themes) and `ul.clean` (`card.css`).
- Themes regenerated from `tools/gen_themes.py`, which carries the same renames.

## v0.10.43 — theme editor picker, and a bluer Block card

- The theme editor's colour picker is now a vendored picker
  (`demo/vendor/color-picker.*`, `demo/theme-editor-picker.js`); the two
  palette scripts were merged away.
- Block's `--surface` (the "Card surface" field) went from `#F6F8F7` to
  `#E0F2FEBF`, a light blue at 75% opacity, in `themes/block.css` and its
  generator `tools/gen_themes.py`. `--code-bg` and `--mermaid-bg` keep
  `#F6F8F7`.

## v0.10.42 — a theme editor, and the sheet of what you moved

- `demo/theme-editor.html`: thirteen themes on the left, the document on the
  stage, and on the right the attributes a theme actually has — page and
  surface colours, column width and padding, each heading's size, colour,
  padding and margins, prose size and line height, inline and block code, the
  table bands, link ink. 46 attributes in 9 groups, light and dark edited
  separately.
- Lengths get a slider and a number, colours a hex field and a picker of sixty
  web colours. What you change becomes one override sheet scoped to the preview
  by id; untouched fields are absent from it, so switching theme makes the
  numbers follow that theme rather than the last one. **Copy CSS** /
  **Download CSS** hands you that sheet to load after the theme.
- The preview is a real document, not a fixture: Qview's README cloned to
  `demo/readme/` and inlined to `demo/theme-editor-doc.js` by
  `demo/build-docs.js`, because a `file://` page cannot `fetch()` a neighbour.
  Its screenshots were copied to `demo/docs/screenshots/` so the relative
  `src`s resolve. **Open…** loads any other markdown file, locally.
- `Ctrl/Cmd + \` opens ui-inspector over the page (pinned devDependency). Every
  style field and every declared row carries a ↺, as does every row of its DOM
  tree, so one value or one element can be put back without touching the rest.
- Panel, palette, fields, doc and read logic live in their own demo scripts
  under the house IIFE rule; `test/theme-editor.test.js` covers the pure
  helpers. `npm test` 201 pass.

## v0.10.41 — claude images fit the column

- `claude.css` was the one theme of thirteen with no `img` rule, so a 1400px
  screenshot inside a 542px column rendered at 1400px: the picture ran out of
  its prose and the pane grew a horizontal scrollbar instead of the image
  shrinking. It now carries the same `.md-editor img { max-width: 100%;
  height: auto; }` the other twelve themes share.
- Measured in Qview on `README.md` at a 682px pane: the three screenshots went
  from 1400x898 / 1400x891 / 1400x894 to 542x348 / 542x345 / 542x346, and the
  viewer's `scrollWidth` from 1470 back to 682.

## v0.10.40 — inline code is a step down in every theme, and it is one number

- `code` is `0.9em` in all thirteen themes, stated once: `modern.css` is the
  shared body the eight generated themes are cut from, so its rule is the one
  place the number lives; `card`, `glass` and `claude` carry it themselves.
  The spread it replaces was noise — 0.82 (editorial), 0.85 (eink), 0.875
  (modern, card, glass, claude and the eight generated ones), 0.88 (block),
  0.95 (terminal) — and a host that pinned code to the prose's own size made
  it read LARGER than the prose, because the mono face's ink box is taller at
  the same size: cap 8.75px against 8.46px, x-height 6.56 against 6.32,
  measured with `measureText` at 12px.
- 0.9em is the step sprints-planner's Task tab already shipped when its inline
  code was a flat 11px on 12px prose, and being an `em` it still follows
  whatever size the host sets — so a Text-size slider keeps working while the
  step stays the theme's decision, not the host's.
- A fenced block is exempt and unchanged: `pre code` takes the block's own
  size (`font-size: inherit`), which every theme already declared.

## v0.10.39 — block's header strip and its card share one inset

- `block`'s card and its opening h2 strip now derive from one pair of values,
  `--block-pad-y` / `--block-pad-x`, instead of each reading
  `--section-padding` on its own. The strip's pull only matched the card when
  the host padded all four sides equally; a host that pads the SIDES further —
  Qview's `--section-pad-x` does, because an unboxed theme's top inset is
  deeper than its sides — left the strip 25px inside a card it was meant to
  span edge to edge (measured at a 880px pane: strip 782px in an 832px card).
- `--section-pad-x` is read where the sides are decided, so the band is flush
  (1px, the card's own border) in that host too. Undefined elsewhere, it
  defaults to 0 and nothing moves for a plain host.
- The card's own photo cap is unchanged (`max-width: 100%`); with the sides
  square to the top the photo is 746px in the same pane, against Modern's
  748px — the 2px being the card's border, not a second inset.

## v0.10.38 — the header band is muted ink, not the accent

- `--table-head-bg` is now `color-mix(in srgb, var(--text) 16%, var(--surface))`
  instead of the accent over `--surface`. An accent band put the header in the
  same hue the theme already spends on links and headings; the body ink is
  near-neutral in every palette, so the band is muted by construction and
  competes with nothing above it.
- Same job, more separation: the band sits 1.31:1–1.63:1 off the page in the
  light palettes and 1.54:1–8.4:1 in the dark ones (it used to be 1.07:1 in
  `card` and `claude`), it never equals the striped row, and every header label
  is at or above 5.07:1 on it (16% is the ceiling: 22% dropped `glass` dark to
  4.02:1 and `nord` dark to 4.51:1).
- `card` and `claude` join the token: their own `--th-bg` was a sky and a warm
  grey, both weaker than the rest (1.07:1 and 1.11:1 off the page). All thirteen
  themes now take the band from one recipe.

## v0.10.37 — tables follow the page, and Nord's headings are ink again

- Table type is `em`, not `rem`: a table is a step down from the prose around
  it, and the host owns that prose. At a 16px reading page nothing changes
  (14.4px / 13.1px headers), but a host that sizes `.md-editor` itself — the
  sprints-planner Task tab draws it at 13px — used to get 14.4px tables that
  ignored its own text-size control. Now `0.9em` / `0.91em` there: 11.7px with
  10.6px headers. `card` set its cells to a flat 15px (bigger than its own table
  root) and `claude` to a flat `0.9rem`; both now inherit the table's size.
- A table header is a band of its own: `--table-head-bg`, the theme's accent at
  18% over its `--surface`. Five palettes painted the header with `--surface`
  itself, which is also the striped row — nord, catppuccin, gruvbox, modern and
  solarized read as one more zebra row; block, editorial and eink had no fill at
  all. Every theme now separates the header from both the page and the stripe
  (measured luminance step 1.07–9.0×), and no header label is under 4.5:1 on its
  band: block light 4.05 → 5.85, glass dark 4.47 → 5.82, solarized dark
  3.88 → 5.8. card and claude keep their own chosen header fills, which already
  read as a header.
- Nord's h1–h3 take one ink per mode instead of two dim ones. h1 was #5E81AC at
  3.5:1 and the shared 60% mix put h2/h3 on #4B6281 at 5.4:1, beside a 10.8:1
  body — every section opener read as faded text. Now #2F4A6B (7.9:1) in light
  and #D8EAF2 (10.1:1) in dark; the hue is still Nord's blue.
- `tools/gen_themes.py` writes the new token and the em sizes; the eight
  generated themes are regenerated from it, `card`/`modern`/`glass`/`claude`
  by hand.

## v0.10.36 — headings and bold carry an ink of their own

- Every theme now paints h1–h3 and `<strong>`. Nine of the thirteen left them
  inheriting `--text`, so a heading and the paragraph under it were one colour
  and size and weight did all the work: `modern`, `terminal`, `editorial`,
  `block`, and the h2s of `glass`, `claude`, `nord` and `solarized`, plus every
  theme's bold runs except `card`, `terminal` and `gruvbox`.
- Two tokens do it, declared once per theme and mixed from its own palette:
  `--heading-ink: color-mix(in srgb, var(--accent) 60%, var(--text))` and
  `--strong-ink` at 42%. Both repaint in dark mode off the same two variables.
  Measured across all thirteen themes in both modes: worst heading contrast is
  now 4.53:1 (`solarized` dark h3), worst bold run 4.8:1, and every heading sits
  at least ΔE 16 from the body ink it sits beside. `eink` mixes to plain text by
  the same formula, so it stays grayscale without a special case.
- Headings whose palette colour missed AA at h3's 16.8px now take the derived
  ink: `catppuccin` teal (3.3:1), `nord` blue (3.5:1), `gruvbox` amber (3.3:1)
  and `solarized` cyan (2.9:1). Size-based colours are kept where the text is
  large enough for AA-large — nord's h1, solarized's h2, gruvbox's h2.
- `gruvbox` bold runs in dark move from `#FB4934` (4.3:1, 3.4:1 on a quote or
  card) to the palette's orange `#FE8019` (5.8:1 / 4.6:1).
- `card`'s dark `--title` was the body ink, so its h2 had no colour in dark;
  `claude`'s `--title` and `--strong` were the body ink in both modes. All three
  now resolve to the derived ink.
- Second pass, every text role on the page it actually sits on (665 role ×
  theme × mode cells measured in Chromium, not sampled): 46 cells were under
  AA at body size — inline code, links, meta text, note/info blocks, table
  heads and the two inverted eyebrow chips. All now clear 4.5:1 (3.0:1 for
  large or bold text), with the palette's own hue kept:
  - inline code: catppuccin's pink was 2.2:1, solarized's magenta 3.7:1 and
    its dark orange 2.8:1, card's pink 3.3:1, nord's red 3.4:1 and its dark
    orange 3.5:1.
  - links get a `--link-ink` token, default `var(--accent)`. Solarized (3.4:1),
    nord (3.5:1) and glass (3.8:1) override it, because darkening `--accent`
    itself would repaint h1, borders and the eyebrow chip with it.
  - meta/secondary ink: solarized light 2.9:1 and dark 3.4:1, catppuccin 4.4:1,
    blossom 4.4:1.
  - note and info blocks: catppuccin's amber 2.2:1, gruvbox's amber 3.1:1,
    solarized's amber 3.9:1 dark / 4.4:1 light.
  - table heads: nord 3.3:1 and catppuccin 4.0:1 take `--heading-ink`.
  - eyebrow chips: nord's chip fill steps to `#4C6A94` (4.8:1) and solarized's
    to `#8A6700` (4.8:1); their cream labels were 3.5:1 and 3.0:1.
  - solarized dark's quote fill was `#0A3F52`, which held `--text` at 4.25:1;
    it is now `#08323F` (5.1:1).
- Third pass, fenced code blocks. Two problems, both measured on the block's own
  surface rather than the page:
  - **Syntax colours were never the theme's.** The host ships one highlight.js
    stylesheet for the whole app and both known hosts load `github-dark`, so a
    light theme received dark-theme token colours: keyword `#ff7b72` at 2.1:1 and
    name/quote/bullet `#c9d1d9` at 1.2:1 — not dim, invisible. 210 of 884 token
    cells were under AA. `card`, `glass` and `claude` had no syntax rules at all.
    The palette now lives in `css/base.css` (so the hand-maintained themes get it
    too) and paints each token role from an ink the theme already verifies:
    keywords/titles/selectors → `--heading-ink`, numbers → `--note-amber`,
    comments → `--text-secondary`, regexp/template/symbol → `--code-text`,
    identifiers → `--text`. Strings and attrs keep their per-theme colours, which
    were darkened where a light palette's own pick missed AA (solarized teal
    2.6:1, catppuccin green 2.8:1, gruvbox olive 3.6:1, the shared `#d97706`
    amber 2.7-3.0:1 — that amber is now the dark-mode-only value, where it reads
    5.0-5.6:1). `eink` stays grayscale.
  - **The block fill was a light panel, not a code block.** `--surface` sits well
    above `--bg` in the darker palettes — nord 1.24:1, gruvbox 1.27:1 — which
    read as a glowing box. Dark mode now mixes the fill back toward the page
    (78% `--bg` / 22% `--surface`), landing at 1.01-1.05:1 in every dark theme
    while light mode keeps `--surface` and its border.
  - `card`'s dark inline-code chip was `#334155` on `#131e30` — a 1.61:1 slab;
    it is `#22303f` (1.24:1) and its code ink reads 5.95:1 on it.
  - Callout titles in light themes sat at 2.7-3.0:1 (the warning amber). The
    title takes 45% of the callout hue against 75% before; dark keeps 75%.

## v0.10.35 — the editor keeps its glow to itself

- Glass paints its ambient glow on the editor's own box instead of the
  viewport, so a host that mounts the editor in a panel — an app's task
  description, a comment body — no longer gets its whole window tinted. The
  glow now stops at whatever box the editor was given.
- Catppuccin's light body ink is a near-black navy (`#111222`, 16.4:1 on `--bg`)
  rather than Latte's grey-blue `#4c4f69` (7.1:1).
- Solarized's light body ink is base02 (`#073642`, 12.1:1 on `--bg`) rather
  than base01's deliberately washed-out `#586E75` (5.0:1).
- Solarized's bold runs, headings and table heads take the theme's own `--text`
  instead of a hardcoded base02/base1, so a paragraph and its emphasis are one
  ink.

## v0.10.34 — mermaid cleanup scans less

- The leftover-diagram sweep that runs on every mount looks only at the
  page body's own children, not every element on the page.

## v0.10.33 — faster mounts on big pages

- Editable code blocks become editable on first click or focus instead of at
  mount; each stays a tab stop. Mounting many blocks no longer costs seconds.
- With lazy diagrams, mounting no longer reads the theme colours up front.

## v0.10.32 — large documents

- A document with thousands of `:::` containers renders in milliseconds again;
  a 15 MB file with about 3,000 of them no longer freezes the page.

## v0.10.31 — callouts

- GitHub alerts (`> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`,
  `[!CAUTION]`) render as titled, coloured boxes around their markdown.
- `:::` containers render the same way, in the VitePress (`::: tip Title`),
  Docusaurus (`:::note[Label]`) and remark-directive (`:::name{k=v}`)
  spellings. More colons nest, a `:::` inside a code fence never closes one,
  an unclosed one stays text, `details` folds, and an unknown name is a plain
  titled box. Inline `:name` and leaf `::name` are not read.

## v0.10.30 — diagrams draw as you reach them

- `mount()` takes `mermaidLazy: true`: each mermaid diagram is drawn when it
  scrolls within `mermaidLazyMargin` (default `800px 0px`) of the scrolling
  viewer, instead of all of them before `mount()` returns. A document with 45
  diagrams used to stay blank for six seconds while they drew. Off by default;
  without IntersectionObserver it draws eagerly as before.

## v0.10.29 — list items breathe

- Every theme spaces list items 8px apart instead of 4px. A tight list (`- a`
  then `- b`, no blank line) sat at 4px while the paragraphs around it got a
  full 1em, so the list read as crowded next to its own prose. A loose list —
  a blank line between items — still spaces wider, because marked wraps each
  of its items in a `<p>` that carries the paragraph margin.

## v0.10.28 — the Block theme

- Block is the thirteenth document theme: cool grey-green paper, a teal accent,
  a clay counter-accent for warnings and inline code, and hairlines instead of
  shadows. Headings are serif, prose is sans, and anything counted is mono.
- Every section is a card: white on the grey-green ground, a hairline border,
  no shadow. The section's opening heading is the card's header strip, pulled
  out to the card edge with a hairline under it. The pull tracks
  `--section-padding`, so a host driving that variable keeps the strip flush at
  whatever inset the reader picks.
- A card is capped by a 3px accent rule along its top edge, and its header strip
  sits on the sunk surface rather than the card's own. The accent goes on the
  structure instead of on any text, so a link in the same colour still reads as
  a link.
- IBM Plex is named first in all three stacks and falls back to the system
  fonts, so a machine that has Plex gets the intended type and no one pays a
  font request — no theme here fetches a font over the network.
- `####` stops being a heading under Block and becomes an uppercase label, the
  smallest structural mark on the page. Quotes are a rail rather than a filled
  box, table headers are label-cased with tabular figures, and a task box is
  drawn rather than set as a glyph.
- Block's cards stand further apart, so a stack of them reads as separate
  blocks rather than one ruled column.
- Collapsing a Block section now leaves the header strip alone on the ground.
  The strip's full-bleed pull used to leave the card's inset standing under it
  twice over, so a folded section was a title above an empty white box.

## v0.10.27 — card lists space like every other theme

- The card theme opened a list 5px ABOVE where the flow put it and left its
  items flush against each other; every other theme opens 6px below and spaces
  items 4px apart. The same document therefore read as a tighter, differently
  aligned list under card than under modern or nord. It now matches them.
- The `h4 + ul/ol { margin-top: 0 }` rule is gone with it. It existed only to
  cancel the negative pull under a `####` title, and the gap it produced —
  h4's 8px bottom margin — is exactly what a 6px top margin collapses to, so
  lists under a `####` title look the same as before.

## v0.10.26 — right-click a table for two hops

- Right-clicking a table in a diagram lights its relationships and theirs, so a
  cluster reads as a whole; a left click on it goes back to the direct ones

## v0.10.25 — #### titles sit on their content

- Level-4 headings get more room above and a small, even gap below in every
  theme, so a title reads as part of the paragraph, list or table it introduces

## v0.10.24 — colourful diagrams

- Diagrams share one palette in every theme: mint nodes, gold edge labels,
  blue subgraphs, slate lines
- In a flowchart, each branch below the first split gets its own colour, so
  what hangs off each side reads at a glance; a node's own style still wins

## v0.10.23 — dragging a diagram stays smooth

- Dragging a mermaid diagram, inline or fullscreen, no longer stutters on
  large ER diagrams; trackpad panning in fullscreen is smoother too

## v0.10.22 — your table's side of each ER relationship in bold

- In the relations panel, the "one" or "many" that belongs to the selected
  table is bold, as in "One organizations – **many** users"

## v0.10.21 — Shift+click to read two ER tables side by side

- With a table selected, Shift+click or Ctrl+click a related table to pick it
  out: both tables and the line between them stay lit, the other related
  tables fade back, and the panel highlights that relationship. Do it again to
  let go

## v0.10.20 — the relations panel stays put and starts at the top

- Selecting another ER table shows its panel from the top, instead of where the
  last table's list was scrolled to
- The panel, toolbar and minimap stay pinned in place after zooming in

## v0.10.19 — jumping to a related table keeps both tables in view

- Clicking a related table in the ER panel now shows it together with the
  selected table, at the same zoom; when they are too far apart for that zoom,
  the related table is shown whole and the selected one as much as fits

## v0.10.18 — true fullscreen diagrams; see both ends of a relationship

- The fullscreen diagram view now fills the whole screen; Esc leaves it
- The selected table glows red, and a related table you jump to from the panel
  glows in the theme colour, so both ends of the relationship stand out
- The selected table's name in the panel is a link that brings it back into view

## v0.10.17 — ER relations read one-first; jumping keeps your place

- Each relationship now reads in plain words with the "one" side first, such as
  "One CUSTOMER – many ORDER"
- Clicking a table in the relationships panel moves the view to it without
  changing the zoom, the selected table or the panel
- The selected table glows more strongly, so it is easier to spot

## v0.10.16 — a focused ER table lists its keys and relationships

- In fullscreen, clicking an ER table opens a panel with its primary and foreign
  keys and every relationship it has: the other table, one-to-many or similar
  with exact cardinality, the label, and that table's keys. Click a table in
  the list to move there

## v0.10.15 — ER tables coloured by how connected they are

- An ER table's title band now says how many other tables it links to: slate
  when nothing references it, the theme's usual colour for one to four, amber
  for five or more, with a legend naming the scale

## v0.10.14 — a lighter touch on the focused ER relationship

- A clicked ER relationship stands out without drawing a heavy line

## v0.10.13 — a touch more weight on ER relationships

- ER relationship lines and their crow's feet are a step heavier again

## v0.10.12 — ER cardinality you can actually see

- The crow's foot at each end of an ER relationship is readable without
  clicking a table first

## v0.10.11 — Card ER tables go sky blue

- ER tables in the Card theme read sky blue instead of green

## v0.10.10 — a focused relationship keeps its own label readable

- Clicking a table no longer dims the relationship labels it lights up

## v0.10.9 — a touch more room for ER row values

- ER row values sit a little further again off their column's left line

## v0.10.8 — more daylight between an ER value and its column line

- The inset added in v0.10.7 was too slight to see; ER row values now sit
  two and a half times further off their column's left line

## v0.10.7 — ER row values sit off the column rule

- A value in an ER table no longer starts hard against its column's left
  line — every cell gains a small inset that scales with the diagram

## v0.10.6 — themes choose their own ER header colour

- New `--mermaid-er-header` token: every theme now paints an ER table's
  title band in a clear tint of its own accent rather than a grey-tinged
  one, and a theme whose accent cannot carry the band sets its own colour

## v0.10.5 — ER table headers stand out from their rows

- An ER table's title band is now several shades stronger than the rows
  beneath it, so a table reads header-then-rows instead of one block of
  the theme's colour

## v0.10.4 — ER relationship labels get big too

- Labels on ER relationship lines draw at 40px instead of 14px, wrapping
  inside 480px so long ones stay on their line without spilling out of
  their box

## v0.10.3 — ER tables get big, readable text

- ER table text was pinned to 14px by every theme, while the tables were laid
  out for mermaid's own font, so it stayed tiny in a wide diagram. Table names
  now draw at 42px and rows at 38px, only in ER diagrams
- Columns are measured at the same size the text is drawn at, so long comments
  no longer run past their column
- Tables sit further apart (160 across, 120 between ranks) to match the larger
  boxes

## v0.10.2 — ER tables read as tables; the minimap frame gets lighter

- ER entity rows ignored the theme: mermaid 11 reads `rowOdd`/`rowEven`, the
  palette only set the older `attributeBackgroundColor*` pair, so odd rows fell
  back to near-white holes on tinted paper. Rows now alternate a 3% and an 8%
  tint under a 14% header, and the lines inside a table are faint while its
  header outline stays
- In dark mode the accent is a pastel made for dark paper, and tints of it over
  the light diagram paper vanished. Fills now start from the accent pulled
  toward the ink, and borders sit closer to the ink, so every theme keeps its
  contrast in both modes
- The minimap's view frame fill drops from a 20% to an 8% `--accent` tint

## v0.10.1 — diagrams take the theme's colours; the minimap frame stops hiding them

- Mermaid diagrams were drawn in mermaid's own palette under every theme. Node
  fills, ER row stripes, borders and lines now come from the theme's
  `--accent` over its `--mermaid-bg` paper, text staying dark ink. mermaid is
  re-initialised when those colours change instead of once per page, and the
  new `features.mermaid.refreshTheme(root)` redraws diagrams already on the
  page — a host calls it after a theme or light/dark switch. Hosts' own
  `mermaidConfig.themeVariables` still take precedence
- The minimap's view frame was filled with `--accent-soft`, an opaque colour
  in every theme, so it hid the tables it framed. It is now a 20% `--accent`
  tint

## v0.10.0 — big diagrams stay readable: focus, minimap, search

- Click a node in a mermaid ER, flowchart or class diagram to light it, its
  direct neighbours and the edges between them; everything else fades. Works
  inline and in fullscreen, and a drag to pan never counts as a click
- Fullscreen gains a minimap: a thumbnail of the whole diagram with a frame
  showing what is on screen; click or drag on it to move there
- Fullscreen gains a search box (`/`): pick a table by name and it is focused,
  centred and zoomed to at least 100%
- Esc in fullscreen clears a focus before it closes the overlay
- Fullscreen zoom steps are now proportional (×1.25) instead of ±150%, so a
  large diagram fitted at 20% no longer jumps straight to 170%
- Closing fullscreen now removes its window listeners; each diagram opened
  used to leave a mousemove handler behind

## v0.9.1 — `card` h3 sits a step below h2

- `card` h3 drops from 20px to 19px, widening the gap to the 26px h2 above it
  so the two heading levels read as distinct at a glance

## v0.9.0 — `contrast` gives way to `blossom`; the generator stops lying

- `contrast` is gone and `blossom` takes its slot: soft pink paper
  (`#FFF5F8` / `#1E1419`), raspberry accents, 12px corners, pill-shaped
  eyebrow and code buttons, a 4px quote bar and `❀` for a rule. Both text
  colours clear 4.5:1 on their own paper in light and dark
- `tools/gen_themes.py` reproduced `modern`'s spacing rather than the tighter
  numbers v0.8.1 hand-edited into the eight palette themes, so re-running it
  silently reverted that release. The two deltas — a 52px h2 fallback and a
  12px section gap, the block moved after the per-theme overrides — now live
  in `emit()`, and regenerating leaves the other seven themes byte-identical
- `card` h3 gains headroom: `24px` top margin becomes `38px`, so a subsection
  no longer crowds the paragraph above it

## v0.8.2 — `glass` headings stop being padded like sections

- `glass` styles an h2 as its own floating card by grouping it with
  `.section`, which also gave it `.section`'s full vertical padding — 24px
  here, more wherever a host substitutes its own value. A one-line heading
  came out at 117px in such a host, only 43px of it text. Vertical padding is
  now 14px; the horizontal inset is untouched, so headings stay aligned with
  the text below them
- `glass` also takes the section-rhythm fix from v0.8.0, which it was left out
  of: an h2 that is a section's first child no longer adds its own top margin
  on top of `.section`'s bottom margin

## v0.8.1 — the eight palette themes close the gap between sections

- `catppuccin`, `contrast`, `editorial`, `eink`, `gruvbox`, `nord`,
  `solarized` and `terminal` carried a 52px `.section` margin, inherited from
  the h2 top margin v0.8.0 moved there. 12px. With each section's own padding
  the visible gap goes from 68px to 28px
- Correction to the v0.8.0 notes: they said `glass` "declares neither value,
  so its sections still sit flush". Wrong on both counts — `glass` sets
  `margin-bottom: 32px` and a 4px h2 top margin in a selector that groups
  `.section` with `h2`, giving it the widest gap of any theme. It is still the
  one theme paying the gap twice; unchanged here
- `card` (26px), `modern` (32px) and `claude` (1rem) keep their own values

## v0.8.0 — one value decides the gap between sections

- An h2 is always the first child of the `.section` the postprocess wraps it
  in, so its top margin was stacking inside that section's padding, and a
  theme's own `.section` margin stacked on top again. Three values decided one
  gap and none of them could be pointed at. `.section` now owns it alone
- Nine themes move their h2 top margin onto `.section` unchanged, so the
  rendered gap is identical to v0.7.3. `claude` was paying it twice and loses
  roughly 40px between sections
- The `h2` margin rules are untouched and still apply to an h2 rendered
  outside a `.section`
- `card` already worked this way and is unchanged. `glass` declares neither
  value, so its sections still sit flush — not addressed here

## v0.7.3 — `claude` sections sit closer together

- `.section` carried a 2rem bottom margin, and each section also pays its own
  top and bottom padding, so consecutive sections were separated by far more
  empty space than the gap between a heading and its own text. 1rem
- Only the margin moved. Section padding is the host's to set, and the other
  themes' `.section` spacing is unchanged

## v0.7.2 — `modern` h2 opens a section, not a page

- The 52px above an `h2` was taller than the gap `h1` itself opens the
  document with, so every `##` read as a page break rather than a section
  break. 32px still clears the rule line under the heading comfortably
- This puts `h2` (32px) below `h3` (38px) in top margin. Deliberate — the
  rule line under `h2` already carries the hierarchy, so the space above it
  does not also have to. `h3` and `h4` are unchanged
- `modern` only. The eight palette themes ship the same `52px 0 14px` and
  keep it

## v0.7.1 — `claude` dark is warm charcoal, with a terracotta accent

- The dark block was a cool purple-gray (`#29262D` page, `#302D33` borders) under a warm ivory light block, so the two modes never read as one theme. Every neutral now sits on the light side's brown axis: `#2A2724` page, `#211F1C` surfaces, `#1E1C1A` code
- Borders were 1.1:1 against the page — `pre`, tables and `hr` are outlined by them and effectively vanished. `#453F3A` is 1.4:1, visible without turning into a grid
- Accent is Claude's terracotta, lifted to `#E08A6A` so a body-size link clears AA (5.7:1) on the new page; the light block keeps its blue. Info callouts keep their semantic blue in both modes
- `--book-bg` dark follows (`#221F1C`), so an EPUB reads on the same paper

## v0.7.0 — eight more document themes

- `themes/` grows from four to twelve. Four editor palettes — `catppuccin` (Latte / Mocha), `nord`, `gruvbox`, `solarized` — and four reading modes: `terminal` (monospace throughout, Markdown hashes kept on headings, phosphor accents), `editorial` (newspaper: display serif, hairline rules, drop cap on the opening paragraph, ❦ for a rule), `eink` (grayscale serif, no shadows; syntax carried by weight and slant instead of colour, images desaturated), and `contrast` (black on white / white on black, 2px borders, no grey text, 3px focus rings). Every one carries a light and a dark block
- `THEMES` lists them in menu order: the four originals, then the palettes, then the reading modes. A host that builds its picker from `theme.themes` gets all twelve with no change
- The eight new files share `modern.css`'s component rules (code buttons, tables, mermaid chrome) verbatim under their own tokens, generated by `tools/gen_themes.py` from a token table per theme, so a fix to that boilerplate is one rerun rather than eight hand edits
- `test/theme.test.js` now checks that `THEMES` and `themes/*.css` agree, and that each generated theme defines the shared token vocabulary in both its light and its dark block — a theme that forgot `--code-bg` in dark used to fall through to the light value silently

## v0.6.6 — `other.md#section` opens the file and lands on the section

- `resolveDocPaths` handed the whole `other.md#section` string to the adapter as a file name, so the host was asked to open `other.md%23section` — a file that does not exist — and the click did nothing. The fragment is now split off before resolving: `dataset.path` is the file alone, the href keeps the fragment, and `onNavigate(path, a, hash)` receives it as a third argument (decoded, `''` when absent)
- `MdEditor.jumpToAnchor(doc, id, onHash)` is exported — the v0.6.5 in-document jump, for a host to call once the linked file is on screen. Finds by id or `<a name>`, unfolds the section hiding the target, hands it to `onHash` or falls back to `scrollIntoView`, and returns the element or `null` on a miss

## v0.6.5 — a `[text](#id)` link finally goes somewhere

- `bindLinks` called `preventDefault()` on every anchor and then returned early for a `#…` href, since such a link has no `dataset.path` — so an in-document link swallowed the browser's own jump and did nothing in its place. A generated document with 159 `<a id>` anchors and a table of contents pointing at them was unnavigable. The click now finds its target by id, or by name for the `<a name>` anchors older generators emit, decodes a percent-encoded fragment, and either hands the element to the host's new `onHash(target)` option or falls back to `scrollIntoView`
- `createOutline` returns a `jumpTo(el)` — what an outline click does, offered to the host so a hash link lands the same way: the same offset and easing, the matching outline row highlighted, and the intersection observer held off until the scroll settles. A target that is not a heading pins no row
- `collapse.revealCollapsedTarget` only looked at `el.hidden`, but a fold hides a section's direct children, and marked wraps a lone `<a id></a>` in a `<p>` — so an anchor inside a folded section was never revealed and a jump to it went nowhere. It now looks for the hidden ancestor

## v0.6.4 — wide tables scroll instead of being cut off, and a failed diagram stops haunting later files

- A table is only as narrow as its widest unbreakable cell, so one long code span — a fully qualified call, say — pushed the whole table past the card holding it. `.section` clips, as it must to keep its rounded corners, so those columns were not merely off screen but unreachable: no scrollbar anywhere on the page reached them. In one generated document, 19 of 23 tables were cut. `transform.run` now always wraps each finished table in `<div class="table-scroll">`, and `css/base.css` gives that box `overflow-x: auto`. Column widths are untouched and a table that already fits shows no scrollbar
- `features/mermaid.render` caught a failed diagram and logged it, but mermaid DRAWS its "Syntax error in text" graphic before throwing — into a scratch element it appends to `<body>` as `d` + the render id. That element lives outside the mounted document, so neither the next render nor a host resetting `innerHTML` could reach it, and the error then sat on top of every file opened afterwards, including files holding no diagram at all. The render loop now clears its own scratch in a `finally`, and sweeps any `[id^="dmmd-"]` left by an earlier run before it checks whether the document has diagrams — the file that has to do the clearing is usually one that has none
- `test/fixtures`: the 12 fixtures containing a table were rewrapped by the same `wrapTables` the pipeline uses, leaving the rest byte-frozen. Note that `tools/parity-check.js` can no longer regenerate them — it loads `renderer/markdown.js`, `renderer/postprocess.js` and `renderer/render.js` from Qview, and the migration removed all three

## v0.6.3 — long tables label in one pass, and a `$&` in a cell no longer tears the row apart

- `addDataLabels` rebuilt each table by searching the whole table string for every row's own text — `out.replace('<tr>' + oldRow + '</tr>', ...)`, once per row — which is O(rows x table size). A 1619-row / 644 KB table in a generated document spent about a second there: 1020 ms of a 1074 ms build, against 31 ms for marked itself. It now rewrites each `<tr>` in place in a single pass, so 3000 rows cost ~20 ms instead of 620 ms
- The same code handed `String.prototype.replace` a replacement STRING, so a cell whose text held `$&`, `` $` ``, `$'` or `$1` had those patterns expanded into it. A cell reading `StartsWith($"host")` escapes to `$&quot;`, and `$&` means "splice the whole match back in here" — in one real document that left 8 cells unlabelled and 2 stray `</tr>` tags, a visibly broken table. Both loops now use replacer FUNCTIONS, which never expand `$` patterns

## v0.6.2 — the width cap survives a host that hides sections

- `measureInset` probed whatever `root.querySelector('section')` returned, which is the FIRST section whether or not it is on screen. A host that keeps several sections mounted and shows one at a time — an EPUB reader paging through chapters is the case that surfaced it — hands back a `display:none` element for every chapter but the first. The probe inside it measures 0, so the element's whole width is reported as inset and `max-width` becomes `width + paneWidth`: far past the pane, so the text column reads as having no cap at all. It now takes the first section that is actually laid out, and a probe measuring 0 yields no inset instead of a huge one. Hosts whose sections are always visible are unaffected — the same first section is still the one chosen

## v0.6.1 — theme polish, and spacing free of Good View

- `css/base.css`: the paragraph-spacing rule is no longer gated behind `.good-view`. `.md-editor p` now carries the margin unconditionally (still overridable per host via `--good-view-gap`), and a new `.md-editor br` rule gives bare line breaks the same spacing — so a host's spacing control reaches a line-per-entry file whether or not the Good View transform ran, not only when it did
- Glass theme: `.md-editor body::before` never matched — `body` can never be a descendant of `.md-editor` — so the ambient glow, the actual "glass" in glassmorphism, silently never rendered; every frosted surface was blurring nothing but the flat page colour. Fixed by scoping the pseudo-element to `.md-editor::before`, with `position: relative; isolation: isolate` added so it paints above the flat background but below real content
- Glass theme: the flat `background: var(--bg)` on `.md-editor` is gone — it painted a solid rectangle the full height of the document, a third layer sandwiched between the (now-working) ambient glow and the individual frosted cards, reading as one big outer "card" wrapping the page. Two layers is the design: the glow, and the surfaces sitting on it
- Glass theme: richer four-color ambient glow (`--glow-1..4`, new `--shadow-tint` for the cards' own ambient shadow), `--blur` 20px→26px, `saturate(180%)`→`200%`, `--surface` alpha nudged for contrast against the stronger glow
- All four themes: `.code-copy-btn` / `.code-full-btn` / `.code-wrap-btn` unified to the same height (22px), min-width (56px), font (0.7rem / 600), and spacing — they used to differ slightly per theme for no reason. `.code-block pre`'s top padding tightened from ~44-48px to 34px to match the now-smaller buttons
- Claude theme: fixed the copy-button text being invisible (`color: var(--surface)` against a `var(--copy-btn-bg)` background of a similar tone) — new `--copy-btn-text` var, tuned per mode
- Claude theme: `--bg` warmed from a flat `#F5F4F0` (light) / darkened `#18171A` (dark, was darker than its own `--surface`/`--pre-bg` — the opposite of light mode) to `#FBF7ED` / `#29262D`, so the page reads as a shade lighter than the boxes it holds in both modes
- Card theme: `--pre-bg` flipped from a dark navy block to a light one (`#eef3f7`, matching inline `--code-bg`) with `--pre-text` gone dark to match — differentiated from the page by `--border` rather than a dark fill
- All four themes: `.hljs-string` scoped to `.md-editor .hljs-string` in light mode — the bare `.hljs-string` selector tied with `github-dark.min.css`'s own equal-specificity rule, and lost that tie depending on `<link>` load order. `.hljs-attr` given its own colour (`#d97706`, light mode only) where none existed before

## v0.6.0 — adoption

- Qview now runs on the library. Nine of its renderer files, its whole `themes/` folder and four blocks of its stylesheet were replaced: about 3,550 lines out for 380 of glue. Its 140-check smoke suite reports results byte-identical to the baseline taken before the swap, which is the extraction's real proof
- Two library assumptions only the migration could expose. `compare.js` clones the active theme by rewriting the scope selector, which the re-scoping in v0.4.0 had quietly broken; and a host's existing storage keys turned out to matter, hence `storageKeys` below

- `createTheme` takes `storageKeys`, so a host that already persisted settings under its own key names keeps them. Without it, adopting the library silently resets everyone's saved theme and text sizes, which is a poor first impression for an upgrade that is meant to change nothing visible

## v0.5.0 — source editor

- Add `createEditor`, a controller around a textarea the host supplies. It owns the buffer, what is believed to be on disk, and the dirty flag; the host keeps every visible affordance, because which element is showing and what the Save button says are its business, not the library's
- A buffer equal to what is on disk is not written. Saving an unchanged file would bump its mtime for no reason, which matters to anything watching the folder
- A **failed** write no longer advances the believed disk state. Qview assigns its source variable before awaiting the write, so after a save fails, leaving edit mode re-renders the unsaved text as though it had been written — and the next Escape "restores" content that never reached disk. Qview should take this fix
- The dirty flag is compared against disk rather than latched on the first keystroke, so undoing an edit back to the saved text clears the marker instead of leaving a phantom pending change
- Add `createSourceFind`, the textarea counterpart to searching rendered HTML. A textarea has no nodes to mark up, so matches are index ranges and a hit is shown by selecting it. It offers the same `search` / `focus` / `clear` / `count` calls a DOM engine does, so one find bar can drive both and swap engines depending on whether the host is editing
- Hitting the match cap is now reported through `capped()`. Silently truncating at 5000 presents a wrong total as a complete one
- `css/base.css` gained the textarea's typography, with **literal** colours rather than theme variables. A host must put its textarea beside the mount element, because `mount()` rewrites that element's `innerHTML`, and a sibling inherits none of the theme's custom properties. Measured in a browser: `var(--text)` fell back silently and light and dark came out identical

## v0.4.0 — theme, layout, and element-name independence

- Every theme rule is now scoped to the class `md-editor`, which `mount()` applies to whatever element it is given. The themes were scoped to the literal selector `#content`, inherited from the app they came from; measured in a real browser, an element named anything else got **no** theming at all — Times, black text, no borders, no padding. Any host adopting the library would have been forced to name its mount element `#content`, and two mounted documents were impossible
- `tools/scope_theme.py` grew a `--scope` option so future theme imports match. Re-scoping 2019 lines of CSS was verified by asserting the per-file declaration count was unchanged, then probing all four themes in light and dark: eight combinations, eight distinct text colours, none unstyled
- Add `createTheme` — theme, dark and layout state, persisted behind a storage prefix so two hosts on one origin do not collide. The width a host sets is the **text** column, not the element width: each theme hides a different amount of padding before the text starts, so the difference is measured and added back rather than tabulated
- Add `css/base.css` with the good-view spacing and the section-collapse toggle. Good View is gated by a class `mount()` puts on the document, not by one the host must remember to set on `<body>`. The outline **panel** is deliberately left to the host — the library promises the markup and `demo/host.css` is a worked example
- Fix the duplicate-heading-id defect inherited from Qview. Two headings with the same text slugified identically, so `getElementById` returned the first and the second outline row scrolled to the wrong place. Repeats now take a numeric suffix, and ids already on the headings are reserved before any are generated. Qview should take this fix
- Fix `createTheme` building its layout selector as `'#' + root.id`. An element with no id yielded the string `'#'`, which matches nothing, silently dropping all layout. It falls back to the scope class, doubled so it still outranks the theme rules it exists to override
- Fix storage being read off an ambient `localStorage` rather than the window owning the mount element. Identical on an ordinary page, wrong for a document in an iframe — and untestable, which is how it surfaced

## v0.3.0 — host adapter, mount, DOM features

- Add `adapter.js`, the only route out of the page: `resolveFile`, `resolvePath`, `openExternal`, `readInject`, `writeFile`, each awaited. The default web adapter is pure URL arithmetic, so the same code runs in Electron and on a plain page
- Add `mount.js` — document HTML into an element, then relative paths, links, diagrams, highlighting and code-block chrome, in that order. Mermaid replaces its `<pre>`, so highlighting first would decorate markup that is about to be discarded
- Add the DOM features: mermaid and its zoom/fullscreen, code-block Copy / Wrap / Copy Full, section collapse, and the outline with its folding. The outline is a factory, because the panel elements, the scroller and the document root all belong to the host, and a host may have two of each
- Behaviour that used to read globals is now explicit. The compare-pane special case (`root === content`) became `editableCode` / `fullButton`, Good View gating became the host's call to `bind()`, and the outline's five hardcoded element ids became constructor arguments. `setOutlinePanelVisible` stayed behind in Qview: toggling a body class is host chrome
- Fix the default adapter swallowing an unparseable base URL and returning the raw relative string, so a host passing a filesystem path got links resolving against its own page — the kind of bug that surfaces much later as "pictures sometimes do not load". It now converts an absolute path to a `file://` base and warns once per bad path
- Fix `createOutline` copying its config, which froze `kvLabels` at construction. It accepts a function so host state that changes while the page is open is re-read on each build

## v0.2.0 — pure rendering core

- Port the markdown pipeline out of Qview's renderer as plain functions: no DOM, no globals, no I/O. `parse` reads frontmatter and `# Title` / `**Key:** value` blocks, `transform` post-processes the HTML, `goodview` applies the line-per-paragraph reading mode, and `build` orchestrates
- Sections, code blocks and blockquotes always run once post-processing is on, because the themes and the collapse and outline features are written against that markup. Everything beyond them is opt-in and defaults to off, so plain markdown in gives plain markdown out
- `build` does not sniff filenames. Deciding that `SKILL.md` deserves a header card, or that a `.txt` file wants bracket headings, stays the host's job
- Verified with `tools/parity-check.js`, which loads Qview's own renderer into a vm and diffs its output against this library over 18 documents with Good View both on and off: 36 of 36 identical, titles included. A negative control confirms the harness detects a one-class change. Those outputs are frozen into `test/fixtures/`, so the test suite keeps proving it with Qview absent

## v0.1.0 — scaffold

- Build to a classic-script bundle exposing the global `MdEditor`. IIFE rather than ESM because the first consumer loads plain `<script src>` tags with no bundler, and a module build would force that whole renderer over to `type="module"` at once
- The four document themes are copied verbatim from Qview, checksum-matched, and shipped as separate files so a host can swap them by rewriting a `<link href>`
- `marked`, `highlight.js` and `mermaid` are peer dependencies resolved lazily off globals, with a `configure()` override. Mermaid stays optional so a host that renders no diagrams never pays its 3.4 MB
- `dist/` is not committed. npm runs `prepare` after installing a git dependency, so consumers build it locally rather than the repo carrying build output
