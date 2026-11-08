'use strict';

/* ui-inspector over the theme editor itself.

   Ctrl/Cmd + \ toggles it — the chord the library documents and Qview binds —
   so a control on the page can be asked what it is, which rule paints it, and
   which variable it reads. The panel's DOM tree carries a ↺ in front of every
   element: that one puts back the edits made to THAT element, while every other
   element's edits and the variables stay.

   Two things behave differently here than on an ordinary page:
   - the inspector's edits are inline styles on the live page, so they belong to
     the session and a reload drops them. They are NOT the panel on the right,
     whose changes are the override that gets exported;
   - opened from file://, the source scan cannot fetch the page's <script src>
     files, so the Copy ID line names fewer of them than it would over HTTP. */
UIInspector.init({
  shortcut: 'Mod+\\',
  // The tree IS the list the ↺ in front of each element lives in, so it opens
  // with the panel — otherwise the key exists and nobody ever sees it.
  tree: true,
});
