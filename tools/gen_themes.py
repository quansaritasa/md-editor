"""Regenerate themes/*.css (all but modern, card, glass, claude). Run: python3 tools/gen_themes.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from themegen import t_terminal, t_catppuccin, t_eink, t_editorial, t_blossom, t_nord, t_gruvbox, t_book, t_solarized, t_block  # noqa: F401,E402  (importing a module emits its theme)
