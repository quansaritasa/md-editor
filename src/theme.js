'use strict';

/* ================= document theme + layout =================
   State and application only. The toolbar that drives it — buttons, menus,
   sliders — belongs to the host, which calls in.

   Persistence goes through a storage prefix so two hosts on the same origin do
   not fight over the same keys. */

const THEMES = ['card', 'modern', 'glass', 'claude'];

const DEFAULTS = {
  themes: THEMES,
  // storagePrefix: 'md-editor-'    namespaces the persisted keys
  // storageKeys: { theme, dark, width, font, code }   overrides them one by one
  theme: 'card',
  dark: false,
  // Text column width, and the two font sizes. Width is the TEXT width, not the
  // element width — see measureInset.
  width: 1000,
  font: 17,
  code: 15,
};

// Storage comes from the window that owns the mount element, not from an
// ambient global: they are the same thing on an ordinary page, but a document
// inside an iframe has its own, and reaching for the outer one would write the
// wrong store. Missing or blocked storage degrades to not persisting.
// `keys` lets a host that already has persisted settings keep its own names, so
// adopting the library does not silently reset everyone's saved theme.
function makeStore(prefix, win, keys) {
  const key = (k) => ((keys && keys[k]) || prefix + k);
  const ls = () => {
    try { return (win && win.localStorage) || (typeof localStorage !== 'undefined' ? localStorage : null); }
    catch (e) { return null; }   // a blocked cookie policy throws on access
  };
  return {
    get(k) { try { const s = ls(); return s ? s.getItem(key(k)) : null; } catch (e) { return null; } },
    set(k, v) { try { const s = ls(); if (s) s.setItem(key(k), String(v)); } catch (e) {} },
  };
}

// Each theme eats a different amount of the element before the text begins:
// some wrap content in a padded <section>, some do not, so the same 1000px
// yields a different text column per theme. Measuring the hidden part and
// adding it back means the number a host shows always IS the text width.
// Measured rather than tabulated: change a theme's padding and this follows.
// A host may keep several <section>s and show only one — an EPUB reader paging
// through chapters does exactly that. Probing a display:none section measures
// 0 and so reports the element's ENTIRE width as inset, which then inflates
// max-width past the pane and the column reads as uncapped. Take the first
// section that is actually laid out, and treat an unmeasurable probe as no
// inset rather than as a huge one.
function measureInset(root) {
  try {
    let host = root;
    for (const s of root.querySelectorAll('section')) {
      if (s.getBoundingClientRect().width > 0) { host = s; break; }
    }
    const probe = root.ownerDocument.createElement('div');
    probe.style.cssText = 'display:block;width:auto;margin:0;padding:0;border:0;height:0';
    host.appendChild(probe);
    const probeW = probe.getBoundingClientRect().width;
    const inset = root.getBoundingClientRect().width - probeW;
    probe.remove();
    if (!(probeW > 0)) return 0;
    return Number.isFinite(inset) ? Math.max(0, Math.round(inset)) : 0;
  } catch (e) { return 0; }
}

function createTheme(config) {
  const c = Object.assign({}, DEFAULTS, config);
  const root = c.root;
  const doc = root.ownerDocument;
  const store = makeStore(
    c.storagePrefix != null ? c.storagePrefix : 'md-editor-',
    c.window || doc.defaultView,
    c.storageKeys);
  // An id is the tightest selector available, but a host need not give its
  // element one — `'#' + ''` is the truthy string '#', which matches nothing, so
  // the emptiness has to be checked rather than relied on to be falsy.
  //
  // The class is doubled in the fallback. Layout MUST outrank the theme, and a
  // single `.md-editor` ties with every theme rule, leaving only DOM order to
  // break it — which holds today by accident and would stop holding the moment
  // a host loaded its theme after this <style>.
  const selector = c.selector || (root.id ? '#' + root.id : '.md-editor.md-editor');

  const state = {
    theme: store.get('theme') || c.theme,
    dark: store.get('dark') != null ? store.get('dark') === '1' : c.dark,
    width: parseInt(store.get('width'), 10) || c.width,
    font: parseInt(store.get('font'), 10) || c.font,
    code: parseInt(store.get('code'), 10) || c.code,
  };
  if (!c.themes.includes(state.theme)) state.theme = c.theme;

  function styleEl() {
    let el = doc.getElementById(c.styleId || 'md-editor-layout');
    if (!el) {
      el = doc.createElement('style');
      el.id = c.styleId || 'md-editor-layout';
      doc.head.appendChild(el);
    }
    return el;
  }

  function applyLayout() {
    styleEl().textContent =
      selector + ' { max-width: ' + (state.width + measureInset(root)) + 'px; font-size: ' + state.font + 'px; }'
      + selector + ' pre, ' + selector + ' pre code { font-size: ' + state.code + 'px; }'
      + selector + ' th, ' + selector + ' td { font-size: ' + state.code + 'px; }';
    store.set('width', state.width);
    store.set('font', state.font);
    store.set('code', state.code);
    if (c.onLayout) c.onLayout(Object.assign({}, state));
  }

  // Theme CSS loads ASYNCHRONOUSLY, so measuring right after the href changes
  // reads the OLD theme's padding. Re-measure on load instead.
  function applyTheme() {
    const link = c.link;
    if (link) {
      link.onload = () => applyLayout();
      link.setAttribute('href', (c.basePath || 'themes/') + state.theme + '.css');
    }
    store.set('theme', state.theme);
    if (c.onTheme) c.onTheme(state.theme);
    if (!link) applyLayout();
  }

  function applyDark() {
    doc.documentElement.classList.toggle(c.darkClass || 'dark', state.dark);
    store.set('dark', state.dark ? '1' : '0');
    if (c.onDark) c.onDark(state.dark);
  }

  return {
    themes: c.themes.slice(),
    get: () => Object.assign({}, state),
    setTheme(name) {
      state.theme = c.themes.includes(name) ? name : c.theme;
      applyTheme();
      return state.theme;
    },
    setDark(on) { state.dark = !!on; applyDark(); return state.dark; },
    toggleDark() { return this.setDark(!state.dark); },
    // Any subset: setLayout({ font: 19 }) leaves width and code alone.
    setLayout(next) {
      for (const k of ['width', 'font', 'code']) {
        if (next && next[k] != null) state[k] = parseInt(next[k], 10) || state[k];
      }
      applyLayout();
      return Object.assign({}, state);
    },
    resetLayout() {
      return this.setLayout({ width: c.width, font: c.font, code: c.code });
    },
    // Re-measure without changing anything — after a re-render, the inset may
    // differ because the new document has a different wrapper.
    refresh: applyLayout,
    apply() { applyDark(); applyTheme(); return Object.assign({}, state); },
  };
}

module.exports = { createTheme, THEMES, DEFAULTS, measureInset, makeStore };
