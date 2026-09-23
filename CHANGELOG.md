# Changelog

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
