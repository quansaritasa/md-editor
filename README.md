# md-editor

A framework-free markdown viewer and editor core, extracted from the
[Qview](https://github.com/quansaritasa/qview) desktop app. It turns markdown
text into themed HTML, mounts that HTML into any element, and offers an
optional source editor on top.

The library owns no application chrome. It has no sidebar, no tab bar and no
toolbar — a host app supplies those and calls in.

## Status

Phase 2 of 5. The rendering core and the DOM features are done. Theme
switching, layout sizing and the source editor land in the phases below.

| Phase | Scope | State |
|-------|-------|-------|
| 0 | Repository scaffold, build pipeline, themes | Done |
| 1 | Pure core: `util`, `parse`, `transform`, `goodview`, `build` | Done |
| 2 | Host adapter, `mount`, features: code blocks, mermaid, collapse, outline | Done |
| 3 | Theme switching, layout sizing, `css/base.css` | Pending |
| 4 | Source editor and in-editor find | Pending |
| 5 | Qview migrated onto the library | Pending |

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

> **Note:** every theme rule is currently scoped to the literal selector
> `#content`, so the element you mount into must carry `id="content"` or it
> renders completely unstyled. Re-scoping the themes to a class the library
> applies itself is planned for phase 3.

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

## Development

```
npm install     # installs esbuild, then builds dist/ via `prepare`
npm run build   # rebuild dist/
npm test        # run the unit tests
```

## License

MIT
