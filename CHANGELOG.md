# Changelog

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
