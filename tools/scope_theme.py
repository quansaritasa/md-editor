#!/usr/bin/env python3
"""Scope md-to-html theme CSS to #content for the Qview app.

Transforms:
  :root { ... }           ->  #content { ... }
  html.dark { ... }       ->  html.dark #content { ... }
  html.dark .x { ... }    ->  html.dark #content .x { ... }
  body { ... }            ->  #content { ... }
  .page { ... }           ->  #content { ... }
  * { ... }               ->  dropped (app already resets)
  .hljs-*                 ->  kept global (syntax highlight)
  everything else         ->  #content <selector>
  @media { ... }          ->  recurse into body
"""
import re
import sys
from pathlib import Path


SPECIAL = {
    ":root": "#content",
    "html.dark": "html.dark #content",
    "body": "#content",
    ".page": "#content",
}


def transform_selector(sel):
    """Return new selector, or None to drop the whole rule."""
    sel = sel.strip()
    parts = [p.strip() for p in sel.split(",")]
    out = []
    for p in parts:
        if not p:
            continue
        if p == "*":
            continue  # drop the universal reset part
        if p in SPECIAL:
            out.append(SPECIAL[p])
        elif p.startswith("html.dark") and p != "html.dark":
            out.append("html.dark #content " + p[len("html.dark"):].lstrip())
        elif p.startswith(".hljs-") or p.startswith("html.dark .hljs-"):
            out.append(p)
        elif p.startswith(".theme-btn"):
            out.append("#content " + p)
        else:
            out.append("#content " + p)
    return ", ".join(out) if out else None


def find_matching(css, open_idx):
    depth = 0
    i = open_idx
    n = len(css)
    while i < n:
        ch = css[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1


def transform_css(css):
    out = []
    i = 0
    n = len(css)
    while i < n:
        brace = css.find("{", i)
        if brace == -1:
            out.append(css[i:])
            break
        pre = css[i:brace]
        end = find_matching(css, brace)
        if end == -1:
            out.append(css[i:])
            break
        # Comments may sit between rules and would otherwise corrupt the selector.
        comments = re.findall(r"/\*.*?\*/", pre, re.DOTALL)
        selector = re.sub(r"/\*.*?\*/", "", pre, flags=re.DOTALL).strip()
        if comments:
            out.append("\n" + "\n".join(comments) + "\n")
        if selector.startswith("@"):
            if selector.startswith("@media"):
                inner = transform_css(css[brace + 1:end])
                out.append(selector + " {\n" + inner + "}")
            else:
                out.append(selector + " {" + css[brace + 1:end] + "}")
        else:
            new_sel = transform_selector(selector)
            if new_sel is not None:
                out.append(new_sel + " {" + css[brace + 1:end] + "}")
        i = end + 1
    return "".join(out)


def main():
    if len(sys.argv) < 2:
        print("usage: scope_theme.py <src-css-dir> [out-dir]", file=sys.stderr)
        print("  src-css-dir  folder holding theme-modern.css / theme-glass.css / theme-claude.css",
              file=sys.stderr)
        print("  out-dir      where to write the scoped files (default: this script's folder)",
              file=sys.stderr)
        return 1

    src_dir = Path(sys.argv[1])
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parent
    out_dir.mkdir(parents=True, exist_ok=True)

    # card.css is hand-extracted from style.css (not regenerated here).
    mapping = {
        "theme-modern.css": "modern.css",
        "theme-glass.css": "glass.css",
        "theme-claude.css": "claude.css",
    }
    for src, dst in mapping.items():
        raw = (src_dir / src).read_text(encoding="utf-8")
        scoped = transform_css(raw)
        (out_dir / dst).write_text(scoped, encoding="utf-8")
        print(f"{src} -> {dst} ({len(scoped)} bytes)")
    print("done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
