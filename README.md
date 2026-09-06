# md-editor

A framework-free markdown viewer and editor core, extracted from the
[Qview](https://github.com/quansaritasa/qview) desktop app. It turns markdown
text into themed HTML, mounts that HTML into any element, and offers an
optional source editor on top.

The library owns no application chrome. It has no sidebar, no tab bar and no
toolbar — a host app supplies those and calls in.

## Status

Complete. Qview runs on the library: nine renderer files and its whole themes
folder were replaced by it, and the app's 140-check smoke suite reports results
byte-identical to the baseline taken before the swap.

| Phase | Scope | State |
|-------|-------|-------|
| 0 | Repository scaffold, build pipeline, themes | Done |
| 1 | Pure core: `util`, `parse`, `transform`, `goodview`, `build` | Done |
| 2 | Host adapter, `mount`, features: code blocks, mermaid, collapse, outline | Done |
| 3 | Theme switching, layout sizing, `css/base.css` | Done |
| 4 | Source editor and in-editor find | Done |
| 5 | Qview migrated onto the library | Done |

## Installation

The package is deliberately **not published to npm**. Add it as a git
dependency instead:

```json
{
  "dependencies": {
    "md-editor": "github:quansaritasa/md-editor#v0.1.0"
  }
}
```

`dist/` is not committed. npm runs the `prepare` script after installing a git
dependency, so the bundle is built on the consumer's machine at install time.

## Usage

The bundle is a classic script that installs a single global, `MdEditor`. Load
`marked` before it; `highlight.js` and `mermaid` are optional and may be loaded
in any order.

```html
<link rel="stylesheet" href="md-editor.css">
<link id="doc-theme" rel="stylesheet" href="themes/card.css">

<script src="marked.min.js"></script>
<script src="md-editor.js"></script>
```

Hosts that resolve dependencies themselves can inject them instead of relying
on globals:

```js
MdEditor.configure({ marked, hljs, mermaid });
```

## Peer dependencies

| Package | Required | Purpose |
|---------|----------|---------|
| `marked` | Yes | Markdown parsing |
| `@highlightjs/cdn-assets` | No | Syntax highlighting in fenced code blocks |
| `mermaid` | No | Diagram rendering. Roughly 3.4 MB, so it stays opt-in |

A missing optional peer skips that step rather than raising an error.

## Mount element

Name it whatever you like. Every theme rule is scoped to the class
`md-editor`, which `mount()` applies to the element it is given, so nothing in
the library depends on a particular id — and several documents can be mounted
on the same page at once.

`mount()` also toggles a `good-view` class on that element when the good-view
transform ran, which is what `css/base.css` keys its reading-mode rules to.

## Usage in a host

```js
const outline = MdEditor.features.outline.createOutline({
  content, scroller, list, section, actions: { box, expand, collapse },
  kvLabels: () => goodViewIsOn(),   // a function, so host state stays live
});

const doc = await MdEditor.mount(content, markdown, {
  docPath: '/docs/guide.md',        // resolves relative links and pictures
  transforms: ['strip-hr', 'data-labels'],
  editableCode: true,
  onNavigate: (path) => openInHost(path),
});

outline.build();                    // after mount: it reads the headings
MdEditor.features.collapse.bind(content);   // after the outline: the toggle
outline.updateActions();            // ...and after both sets of toggles exist
```

## Theme and layout

`createTheme` holds the state and applies it. The toolbar that drives it —
buttons, menus, sliders — stays with the host.

```js
const theme = MdEditor.createTheme({
  root: content,
  link: document.getElementById('doc-theme'),  // the <link> whose href it swaps
  basePath: 'themes/',
  storagePrefix: 'my-app-',        // so two hosts on one origin do not collide
  onTheme: (name) => {},           // reflect state back into your own controls
  onDark:  (on) => {},
  onLayout: (state) => {},
});

theme.apply();                     // restore what was persisted
theme.setTheme('claude');
theme.toggleDark();                // toggles a `dark` class on <html>
theme.setLayout({ font: 19 });     // width | font | code, any subset
theme.refresh();                   // re-measure after a re-render
```

The width you set is the **text** column, not the element width: each theme
eats a different amount of padding before the text starts, so the difference is
measured and added back. That is also why `refresh()` exists — a re-rendered
document may have a different wrapper.

Layout is written as a `<style>` rule targeting the element's id, or the
doubled scope class when it has none, so it outranks the theme it must
override.

`demo/index.html` is a complete working host — open it in a browser after
`npm run build`. It owns its own toolbar, panel and layout, which is the point:
the library asks for a mount element and a scroller, and nothing else.

## Themes

Four document themes ship with the library: `card`, `modern`, `glass` and
`claude`. Every rule is scoped to the mount element, so a theme cannot reach
out and restyle the host application.

Themes are copied into `dist/themes/` rather than bundled, because a host
switches them at runtime by rewriting a `<link href>`.

`tools/scope_theme.py` is the script that scopes upstream md-to-html theme CSS
to the mount element. Run it when importing a new theme.

## Optional transforms

Beyond standard markdown, the library can apply a set of document transforms:
a title and metadata header card, question-and-answer cards, example boxes,
field tables and responsive table labels. The bundled themes style all of them.

Every transform is **off by default**. A host opts in per document, so the base
output stays predictable:

```js
MdEditor.build(md, { transforms: ['header', 'qa-cards', 'example-boxes'] });
```

## Editing the source

`createEditor` wraps a textarea the host supplies. It owns the buffer, what is
believed to be on disk, and the dirty flag; the host owns every visible
affordance — which element is showing, what the Save button says, and whether
the file is editable at all.

```js
const editor = MdEditor.createEditor({
  textarea: document.getElementById('source'),
  adapter,                          // needs writeFile; the default refuses
  onDirty: (dirty) => {},
  onSaved: () => {},
  onError: (message) => {},
  onStateChange: (editing) => {},   // show/hide your own elements here
  onExit: (source) => render(source),
});

editor.open(path, source);   // loads, marks clean, focuses
editor.save();               // 'saved' | 'unchanged' | 'error' | 'idle'
editor.close();              // saves pending edits, then hands back onExit
editor.cancel();             // discards them
```

Two details worth knowing. A buffer equal to what is on disk is not written, so
no-op saves do not bump the file's mtime. And a **failed** write does not
advance the believed disk state, so `onExit` can never hand the host content
that was never saved.

`createSourceFind` is the textarea counterpart to searching rendered HTML —
matches are index ranges, and a hit is shown by selecting it. It offers the
same `search` / `focus` / `clear` / `count` calls, so one find bar can drive
both and swap engines depending on whether the host is editing. `capped()`
reports when a search stopped at the match limit, so a host can show `5000+`
rather than presenting a truncated total as complete.

## Development

```
npm install     # installs esbuild, then builds dist/ via `prepare`
npm run build   # rebuild dist/
npm test        # run the unit tests
```

## License

MIT
