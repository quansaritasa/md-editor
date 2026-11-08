# Qview

A fast desktop viewer for a folder of documents and media — markdown, plain text, EPUB books, PDFs, pictures, and video — with no local server, no build step, and no pre-generated HTML.

![A markdown document open in Qview: file tree on the left, highlighted code and a table in the middle, and the document outline on the right](docs/screenshots/document.png)

## Does any of this sound familiar?

- **Are you hurting your eyes reading a markdown file as plain text** — raw `#` and `**` everywhere, no headings, no code highlighting? Qview renders it the moment you click it, in a real document theme, light or dark.
- **Do you keep a folder of notes, screenshots, reference PDFs, and the odd EPUB, and switch apps to read each kind?** Qview opens all of them in one window, with one tree, one set of tabs, and one search.
- **Do you lose your place every time you reopen a long document or book?** Your scroll position and your page in an EPUB are both remembered, per file.
- **Do you press `Ctrl/Cmd+F`, then hunt through results with the Down arrow?** Press `F3` or `F4`, start typing, and the first match opens itself a moment after you stop — no arrow keys required.
- **Do you bounce between files and lose track of where you were?** ◀ ▶ in the toolbar (`Alt+←/→` or `Ctrl/Cmd+J/K`) step back and forward through every file and section you viewed, like a browser; `` Ctrl/Cmd+` `` / `` Ctrl/Cmd+~ `` flips between your last two files, A/B style. 🎯 finds the open file in the tree.
- **Is a markdown file changing on disk while you're reading it** — because you, or something else, is editing it elsewhere? Qview re-renders it live, with no refresh and no separate preview pane.
- **Do you need to tell two similar files apart at a glance?** Open both and Compare puts them side by side — or, for two photos, stacks them so you can wipe a divider across or flip between them in place.
- **Does a photo off your phone (HEIC/HEIF) just refuse to open?** Qview hands it to the operating system's own preview service, which decodes what the browser can't.

Qview is built with Electron and runs entirely offline: every third-party library it uses is bundled at install time, so it never reaches out to a CDN while you're reading. Two things can make it talk to the network, and neither happens until you press a button: the update check in Settings ▸ About, and "Check again" in the ⎇ GitHub CLI guide, which hands the question to the gh on your machine.

## What it opens

| Kind | Formats |
|---|---|
| Documents | `.md`, `.txt` |
| Books | `.epub` |
| Documents (fixed layout) | `.pdf` |
| Pictures | `.png`, `.jpg`, `.jpeg`, `.jfif`, `.apng`, `.gif`, `.webp`, `.avif`, `.heic`, `.heif`, `.bmp`, `.ico`, `.svg` |
| Video | `.mp4`, `.webm`, `.mov`, `.m4v`, `.ogv`, `.mkv`, `.3gp` |

Source, config, JSON, CSV/TSV, Word documents and ZIP listings also open read-only — see [features.md](features.md) for the complete list.

## Highlights

- **Reading** — live-rendering markdown/text, Good View for line-per-entry notes, four document themes, light/dark, syntax-highlighted code with one-click copy, Mermaid diagrams, math formulas, footnotes, Obsidian-style [[wiki-links]], find-in-page, remembered reading position
- **Books & PDFs** — a paginated EPUB reader that turns pages instead of scrolling, chapter navigation, an embedded PDF viewer — all three remember where you left off
- **Pictures & video** — cursor-anchored zoom, fit-to-width/height, a fullscreen viewer you can arrow through, copy-to-clipboard as PNG, inline video playback
- **Browsing** — a file tree with name *and* content search, tabs that restore your whole session, Favorites and Recent as their own pinned tabs, thumbnail grids, group/sort/filter per collection
- **Navigating fast** — `F3`/`F4` jump into search and auto-open the first hit, `Alt+←/→` or `Ctrl/Cmd+J/K` walk your viewing history back and forward, `` Ctrl/Cmd+` `` toggles between your last two files, arrow keys walk the tree and open as they go
- **Editing & files** — inline edit with save to disk, create/rename/duplicate/move/delete from the context menu, multi-select, drag-and-drop moves, Compare for two files side by side, with slide and flip modes for photos

The full, screenshot-free tour of every feature — with the scenario each one is for — is in [features.md](features.md). Every shortcut in the app is also listed in **⚙ Settings ▸ Shortcuts**, so you never have to leave the window to look one up.

## More screenshots

Mermaid diagrams render inline, with their own zoom controls. The theme here is Claude; the shot above uses Modern.

![An architecture diagram rendered from a mermaid code block, with zoom controls in the corner](docs/screenshots/diagram.png)

Open a picture and the chrome gets out of the way: the theme, layout, and edit controls disappear, the outline panel collapses, and the zoom and fit controls take over. Copy hands the image itself to the clipboard.

![A picture open in Qview, filling the window, with zoom and fit controls in the toolbar](docs/screenshots/image-viewer.png)

## Platform support

Qview is developed and tested on macOS and Windows. On Linux there is no operating system thumbnail service available to Electron, so grid tiles fall back to the picture itself where the browser can decode it, and show a file-type plate otherwise; HEIC and HEIF will not open there for the same reason.

## Installing

### From a release

Download the latest `.dmg` (macOS) or portable build (Windows) from the [Releases page](https://github.com/quansaritasa/qview-releases/releases), then open it.

### macOS cannot verify the app

The macOS build is signed ad-hoc — no Developer ID, no notarization — so the first time you open a copy that arrived through a browser, Gatekeeper asks:

> Apple could not verify "Qview.app" is free of malware that may harm your Mac or compromise your privacy.

That is the warning every un-notarized app gets. It is about the download, not the app: the `.dmg` comes from the browser carrying macOS's quarantine flag, the first launch of a quarantined app goes through Gatekeeper, and Gatekeeper only accepts a Developer ID it can trace back to Apple. Control-clicking and choosing Open no longer clears it, because macOS 15 removed that shortcut. Either:

Open **System Settings ▸ Privacy & Security**, scroll to **Security**, click **Open Anyway** next to the message about Qview, then open the app again.

Or drop the flag from a terminal:

```bash
xattr -dr com.apple.quarantine /Applications/Qview.app
```

With no quarantine flag there is no first-launch check, and the app opens normally from then on. The flag arrives with the download, so a `.dmg` fetched later asks again.

### From source

```bash
git clone https://github.com/quansaritasa/qview.git
cd qview
npm install
npm start
```

`npm install` runs `src/scripts/vendor.js`, which copies the browser builds of `marked`, `mermaid`, `highlight.js` and `md-editor` — along with the four document themes — into `src/renderer/vendor/`. That directory is generated, so it is not checked into git.

Because it is generated on `npm install` only, a `git pull` that changes where those files belong leaves the old copies behind and the new directory empty. The window then opens blank: the four `vendor/` script tags 404, so `MdEditor`, `marked` and `hljs` are all undefined, `src/renderer/edit.js` throws while initialising, and every later `openFile()` dies on the half-initialised module. Run the copy again after any pull that touches the layout:

```bash
npm run vendor
```

## Building a distributable

```bash
npm run dist
```

The output lands in `dist/`. macOS targets are `.dmg` and `.zip`; Windows produces a portable executable.

## Keyboard shortcuts

The full, current list lives inside the app — **⚙ Settings ▸ Shortcuts** — so it can never drift out of sync with what actually ships. The ones you'll reach for first:

| Shortcut | Action |
|---|---|
| `F3` / `F4` | Search files & folders / search inside them — start typing, first match opens itself after a short pause; `*` works as a wildcard in the name box (`*erd.md`, `erd*`) |
| `Alt+←/→` or `Ctrl/Cmd+J/K` | Back / Forward through the files and sections you viewed (the ◀ ▶ toolbar buttons) |
| `` Ctrl/Cmd+` `` / `` Ctrl/Cmd+~ `` | Jump back to the file you had open right before this one |
| `⌘/Ctrl + Enter` | Toggle edit mode |
| `⌘/Ctrl + S` | Save the file being edited |
| `⌘/Ctrl + F` | Find in the open document |
| `⌘/Ctrl + O` | Open a file — its folder becomes the tree, so the arrow keys still walk the neighbours |
| `↑` / `↓` | Move between files in the tree |
| `←` / `→` | Collapse or expand a folder |
| `Enter` / `F2` | Rename the file or folder highlighted in the tree |
| `Esc` | Close the current dialog, menu, or fullscreen view |

## Testing

Qview ships a headless smoke suite that drives the real Electron window, asserting on rendering, file operations, tabs, collections, grouping and sorting, thumbnails, the EPUB reader, the outline, find, zoom, and keyboard shortcuts.

```bash
npm run smoke
```

The run prints `SMOKE OK` on success, or `SMOKE FAIL` together with a per-probe diagnostic line naming exactly which assertion did not hold.

## Project layout

| Path | Contents |
|---|---|
| `src/main.js` | Electron main process: window, default root, smoke bootstrap |
| `src/preload.js` | The context bridge exposed to the renderer |
| `src/ipc.js` | IPC handlers for every filesystem operation, thumbnails, and previews |
| `src/fs-utils.js` | Shared filesystem helpers used by IPC and the smoke suite |
| `src/media-ext.js` | The image and video extension sets, and why they differ from each other |
| `src/media-info.js` | Pixel dimensions for pictures and video, and thumbnail box sizing |
| `src/image-header.js` | Reads image dimensions from file headers, without decoding the picture |
| `src/epub-reader.js` | EPUB unpacking and chapter extraction |
| `src/renderer/` | UI: tree, tabs, rendering, outline, editing, zoom, thumbnails, dialogs |
| `src/renderer/md-glue.js` | Wires the md-editor library to the globals the rest of the renderer calls |
| `src/renderer/outline-glue.js` | The same, for the document outline and its folding |
| `src/smoke/` | Headless probe suite |
| `src/scripts/vendor.js` | Copies vendored browser libraries on postinstall |

Modules are kept focused and small; anything that grows past roughly 300 lines gets split.

## Third-party libraries

| Library | License |
|---|---|
| [Electron](https://www.electronjs.org/) | MIT |
| [marked](https://marked.js.org/) | MIT |
| [Mermaid](https://mermaid.js.org/) | MIT |
| [highlight.js](https://highlightjs.org/) | BSD-3-Clause |
| [md-editor](https://github.com/quansaritasa/md-editor) | MIT |

## License

Released under the [MIT License](LICENSE).
