## CSS units

Applies to `css/*` and `themes/*`.

| Use | Unit | Rule |
|---|---|---|
| Type, spacing, radius, sizes | `rem` | Literals, not tokens: md-editor has no token scale. |
| Glyph-sized things | `em` | Scales with the element's font size. |
| Hairlines (1-2px borders, outlines), focus rings, box-shadows, motion offsets, `text-underline-offset`, `stroke-width` | `px` | Must stay crisp. |
| Media queries | `em` | Follows the user's font size. |
| Full-height shells | `dvh` | Never `vh`. |
| Root font size | `100%` or unset | Never `px`. |

- Spacing snaps to the 4px grid (values under 4px become `.125rem`). Font size, radius and sizes convert exactly (px / 16).
- Declarations with `!important` stay in px: mermaid pins its labels in px (14px, 38px, 42px, max-width 480px).
- Generated themes (`themes/*.css` except `modern`, `card`, `glass`, `claude`) are never hand-edited. Change `tools/themegen/` (shared body in `core.py`, one `t_<name>.py` per theme), then run `python3 tools/gen_themes.py`.
- `tools/themegen/core.py` patches `modern.css` text with `.replace()`. After changing a value in `modern.css`, check the search string still matches.
