/* Up/Down arrows step through the theme list. They act only while focus sits on
   a theme button, where the keys do nothing by default; anywhere else they keep
   scrolling the page and moving carets. */
window.TE_KEYS = {
  bindThemeArrows(box, setTheme) {
    box.addEventListener('keydown', (e) => {
      const step = { ArrowUp: -1, ArrowDown: 1 }[e.key];
      if (!step || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const btns = [...box.querySelectorAll('.te-theme')];
      const next = btns[btns.indexOf(document.activeElement) + step];
      if (!next) return;
      e.preventDefault();
      next.focus();
      setTheme(next.dataset.theme);
    });
  },
};
