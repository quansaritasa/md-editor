# demo/vendor

Third-party browser builds the demo pages load with plain `<script>` / `<link>`
tags, copied in unchanged. Nothing here is edited by hand; to update one, copy
the new build over it.

| File | From | Notes |
|---|---|---|
| `color-picker.min.js`, `color-picker.min.css` | `color-picker` repo, `dist/` (built from `bb509bf`; used in `popover` mode) | Sets `window.ColorPicker`. Source maps are not copied. |
| `ui-inspector.js` | `ui-inspector` repo, `dist/` (built from `715eca1`) | Ctrl/Cmd + `\` inspector over the theme editor. |
