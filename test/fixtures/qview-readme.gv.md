# Qview

A fast desktop viewer for a folder of documents and media. Point Qview at a directory and read what is inside it — markdown, plain text, EPUB books, PDFs, pictures, and video — without a local server, a build step, or any pre-generated HTML.

Qview is built with Electron and runs entirely offline. It has no runtime dependencies: every third-party library is bundled at install time, so the app never reaches out to a CDN while you are reading.

![A markdown document open in Qview: file tree on the left, highlighted code and a table in the middle, and the document outline on the right](docs/screenshots/document.png)

## Why this exists

Most markdown workflows make you choose between an editor that renders poorly and a static site generator that needs a build step. Qview takes a third path: it treats a folder as the document set, watches it live, and renders each file the moment you click it.

That idea turned out to apply well beyond markdown. A folder of research notes usually also holds screenshots, reference PDFs, and the occasional EPUB, and switching apps to read each one breaks the thread. Qview opens all of them in the same window, with the same tree, tabs, and search.

## What it opens

| Kind | Formats |
|---|---|
| Documents | `.md`, `.txt` |
| Books | `.epub` |
| Documents (fixed layout) | `.pdf` |
| Pictures | `.png`, `.jpg`, `.jpeg`, `.jfif`, `.apng`, `.gif`, `.webp`, `.avif`, `.heic`, `.heif`, `.bmp`, `.ico`, `.svg` |
| Video | `.mp4`, `.webm`, `.mov`, `.m4v`, `.ogv`, `.mkv`, `.3gp` |

## Features

**Reading documents**

- Live rendering of `.md` and `.txt` files, re-rendered when the file changes on disk
- A single newline is a line break, the way Obsidian and GitHub comments treat it, rather than being folded into the previous line as CommonMark would
- Good View, a reading mode for files with no blank lines between entries: every line becomes its own paragraph, and a leading `header:` on each line is highlighted
- Four document themes — Card, Modern, Glass, and Claude — with theme and layout controls appearing only for text files
- Light and dark mode
- Adjustable document width, body font size, and code font size, with a one-click reset
- Document outline panel with click-to-scroll navigation, which collapses when the file has nothing to outline
- Syntax highlighting for fenced code blocks, each with buttons to copy it and to toggle soft wrapping. Drop a `_pre` or `_post` file next to the document and a third button appears, copying the block wrapped in those snippets — useful when every block needs the same preamble
- Mermaid diagrams with cursor-anchored zoom
- Find-in-page that skips UI chrome and searches document content only
- Reading position is remembered per file, so reopening a long document returns you to where you stopped

**Reading books and PDFs**

- Paginated EPUB reader that turns pages like a book rather than scrolling, built on CSS multi-column layout
- Chapter navigation, with your place in the book remembered between sessions
- PDFs open in an embedded viewer that remembers the page you were on

**Pictures and video**

- Zoom from 5% to 1000%, with cursor-anchored wheel zoom and drag to pan
- Fit-to-width and fit-to-height modes that can be remembered and applied to every picture you open
- Fullscreen viewer with keyboard navigation to the next and previous picture
- HEIC and HEIF photos open through the operating system's preview service, which Chromium cannot decode on its own
- Copy any picture to the clipboard as PNG, ready to paste into another app — webp, avif, bmp, ico, and svg are converted on the way out
- Video plays inline with the standard transport controls

**Browsing a folder**

- File tree sidebar with live search
- Two collections per folder tab, switchable from the sidebar: **All** for the whole folder and **Local** for a hand-pinned working set
- **Favorites** — starred files and folders — is a global list, not tied to any one folder, so it lives as its own pinned first tab in the tab bar instead of the sidebar
- Thumbnail grid in two tile sizes, alongside the classic row list. Thumbnails come from the operating system's thumbnail service, so pictures, video posters, and PDF and EPUB covers all get one, and they are generated at the source aspect ratio so nothing is squashed
- Group by folder, by date, or not at all; sort by name or by newest first; filter by file type
- Those four controls are remembered **per collection, per tab** — All can be a thumbnail grid showing only pictures while Local stays a plain list showing everything, in the same tab
- Tabs, with the whole session restored on the next launch
- Each tab remembers the last file you opened in each of its collections; the Favorites tab remembers its own last file the same way
- File Info panel showing name, size, modified date, and pixel resolution for pictures and video
- Recent folders menu

**Editing and file management**

- Inline edit mode with save to disk
- Create, rename, duplicate, move, and delete files from the context menu
- Multi-select in the tree with Cmd/Ctrl+click and Shift+click, then move many items at once
- Reveal any item in Finder

## More screenshots

Mermaid diagrams render inline, with their own zoom controls. The theme here is Claude; the shot above uses Modern.

![An architecture diagram rendered from a mermaid code block, with zoom controls in the corner](docs/screenshots/diagram.png)

Open a picture and the chrome gets out of the way: the theme, layout, and edit controls disappear, the outline panel collapses, and the zoom and fit controls take over. Copy hands the image itself to the clipboard.

![A picture open in Qview, filling the window, with zoom and fit controls in the toolbar](docs/screenshots/image-viewer.png)

## Platform support

Qview is developed and tested on macOS. The Windows build target is configured and the code paths are cross-platform, but they have not been verified on a Windows machine — reports are welcome.

On Linux there is no operating system thumbnail service available to Electron, so grid tiles fall back to the picture itself where the browser can decode it, and show a file-type plate otherwise. HEIC and HEIF will not open there for the same reason.

## Installing

### From a release

Download the latest `.dmg` (macOS) or portable build (Windows) from the [Releases page](https://github.com/quansaritasa/qview/releases), then open it.

### From source

```bash
git clone https://github.com/quansaritasa/qview.git
cd qview
npm install
npm start
```

`npm install` runs `scripts/vendor.js`, which copies the browser builds of `marked`, `mermaid`, and `highlight.js` into `renderer/vendor/`. That directory is generated, so it is not checked into git.

## Building a distributable

```bash
npm run dist
```

The output lands in `dist/`. macOS targets are `.dmg` and `.zip`; Windows produces a portable executable.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘/Ctrl + Enter` | Toggle edit mode |
| `⌘/Ctrl + S` | Save the file being edited |
| `⌘/Ctrl + C` | Copy the open picture to the clipboard (pictures only — on text it stays the normal copy) |
| `⌘/Ctrl + F` | Find in page |
| `⌘/Ctrl + N` | New file in the current folder |
| `⌘/Ctrl + O` | Open a folder in a new tab |
| `⌘/Ctrl + 1` / `2` | Switch to the All / Local collection (no-op on the Favorites tab) |
| `⌘/Ctrl + 0` | Switch to the pinned Favorites tab |
| `⌘/Ctrl + Backspace` | Delete the open file |
| `↑` / `↓` | Move between files in the tree |
| `←` / `→` | Collapse or expand a folder |
| `Esc` | Close the current dialog, menu, or fullscreen view |

While reading a book or a picture:

| Shortcut | Action |
|---|---|
| `Space` / `→` / `PageDown` | Next page in an EPUB, next picture in the fullscreen viewer |
| `←` / `PageUp` | Previous page or previous picture |
| `↓` / `↑` | Next or previous picture in the fullscreen viewer |

## Testing

Qview ships a headless smoke suite that drives the real Electron window. Twenty-four probe groups assert on rendering, file operations, tabs, collections, grouping and sorting, thumbnails, the EPUB reader, the outline, find, zoom, and keyboard shortcuts.

```bash
npm run smoke
```

The run prints `SMOKE OK` on success, or `SMOKE FAIL` together with a per-probe diagnostic line naming exactly which assertion did not hold.

## Project layout

| Path | Contents |
|---|---|
| `main.js` | Electron main process: window, default root, smoke bootstrap |
| `preload.js` | The context bridge exposed to the renderer |
| `ipc.js` | IPC handlers for every filesystem operation, thumbnails, and previews |
| `fs-utils.js` | Shared filesystem helpers used by IPC and the smoke suite |
| `media-ext.js` | The image and video extension sets, and why they differ from each other |
| `media-info.js` | Pixel dimensions for pictures and video, and thumbnail box sizing |
| `image-header.js` | Reads image dimensions from file headers, without decoding the picture |
| `epub-reader.js` | EPUB unpacking and chapter extraction |
| `renderer/` | UI: tree, tabs, rendering, outline, editing, zoom, thumbnails, dialogs |
| `themes/` | Document theme stylesheets, and the script that scopes them to the content pane |
| `smoke/` | Headless probe suite |
| `scripts/vendor.js` | Copies vendored browser libraries on postinstall |

Modules are kept focused and small; anything that grows past roughly 300 lines gets split.

## Third-party libraries

| Library | License |
|---|---|
| [Electron](https://www.electronjs.org/) | MIT |
| [marked](https://marked.js.org/) | MIT |
| [Mermaid](https://mermaid.js.org/) | MIT |
| [highlight.js](https://highlightjs.org/) | BSD-3-Clause |

## License

Released under the [MIT License](LICENSE).
