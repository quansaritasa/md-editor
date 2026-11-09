- Photos now fit the page: Claude-theme screenshots stop running off the side, and Block-theme pictures span the full card width.

- Inspect: Copy ID names a control in two hops and its stylesheet by file name, so the line you paste into an AI prompt is half as long.

- The Focus Line no longer stays lit over a PDF, the editor, or an inline diff.

- Favorites and Recent now drag between the two tab bars like any other tab, and a dashed slot shows exactly where a dragged tab will land.

- The ◇ Local pin in the file tree is bigger and lime green, so it no longer looks like the pink ★ beside it.

- Large plain-text files open instantly instead of freezing, and a file too big to display now says so with its size instead of looking broken.

- The Types filter works again in large folders — checking a kind now shows only that kind in the Flat, Date and File Type views.

- Large Markdown files now open instantly instead of freezing, and very large plain-text files no longer fail to open at all.

- Huge EPUBs open almost instantly — a 12,000-chapter book now takes a fraction of a second instead of five, and uses a fraction of the memory.

- Big EPUB and Word files no longer slow the app down after you switch away from them.

- UI inspector also opens with Ctrl/Cmd+backslash, and File Info shows file size in MB or GB instead of thousands of KB.

- File Info now shows a Pages chip for PDFs and a Chapters chip for EPUB and MOBI books.

- Favourite star and Local pin now sit exactly on the middle of their tree row, at any app text size.

- ui-inspector 0.4.1: an edit stays in the Changes box after the app re-renders the element (Apply to similar), a ↕ / ↔ pair with different sides shows "Mixed", right-click no longer scrubs or steps, and editCount() lets the host say how many edits outlive inspect mode.

- ui-inspector 0.4.0: the Style section edits like a design tool (unit-aware number boxes, ▲▼, drag-to-scrub, minimize, resizable panel), text edits reach the text you see, Apply to similar edits the real CSS rule live, and All changes gives one paste-ready CSS prompt.

- ui-inspector 0.3.0: inspect mode skips controls hidden behind a popup, and Copy for AI can lead with a stamped source location (srcAttr).

- Global search answers instantly while you type, even with many tabs open.

- Large markdown files (15 MB+) open in seconds and render as you read; files over 2 MB open in your default app for editing.

- Tree hides cache folders like __pycache__, bin, obj and target (👁 Hidden shows them); .env.local-style files now open as text.

- Top bar: buttons sit on the right, 🔊 Read is icon-only, and the icon buttons are matching squares.

- Markdown: GitHub alerts (> [!NOTE], [!TIP], [!WARNING]…) and ::: containers now show as coloured callout boxes.

- Large markdown files open several times faster; diagrams draw as you scroll to them.

- Right-click a folder tab to copy or move clipboard files into it, and press Ctrl/Cmd+A in the file tree to select every file shown.

- Qview now shows a short search tip once per launch, with Next tip and Turn off tips buttons.

- Ctrl+V now pastes into the open folder with nothing selected, works right after clicking a folder, and empties the clipboard after pasting so files never land twice or while editing.

- Search hit stepping and content search now cover the whole list; the Git tab hides outside repositories, opens files as diffs, and the GitHub guide stops reappearing once signed in.

- A pinned Recent or Favorites tab's right-click menu no longer shows Close entries left over from another tab, which could have closed every folder tab in the window.

- Show in tree now finds the open file even when a file-type filter was hiding it, and clears that filter along with both search boxes.

- Scrolling a long file list no longer leaves a huge blank gap below the last file when the app text size is not 100%.

- The left tab rail now follows the app text size setting, so its folder names match the tabs along the top.

- Chapter list on a book's own contents page now reads smaller, with more space between entries.

- Ctrl/Cmd+T steps to the next document theme; add Shift to step back.

- The ✕ in a sidebar search box now clears it whether or not the box is the one you are typing in.

- Clicking the ✕ in a sidebar search box now clears the search instead of only widening the box.

- EPUB contents pages no longer show stray numbers, and long lists no longer have their numbers cut off at the page edge.

- Delete several files at once — right-click a multi-selection, or press Ctrl/Cmd+Backspace. Folders still need the right-click menu.

- The duplicate 🔊 Read aloud button is gone from the right panel — 🔊 Read in the toolbar both starts and stops reading.

- Both sidebar search boxes now remember what you typed in each collection, so switching to Recent, Local or Git no longer wipes your filter.

- Layout settings now reach much further — wider text column, larger text and code, and far more padding and line spacing.

- Books and documents now open with larger text, a wider column, and side margins that match the top.

- EPUB chapters written as blank-line-separated lines now become real paragraphs, so bookmarks, read-aloud and the paragraph gap work; in a book every Layout slider now takes effect immediately.

- File tree no longer freezes when a single folder holds thousands of files in Folder grouping.

- The read-aloud voices guide has bigger text, and on Windows also shows how to add a voice through Language & region.

- The Support Qview popup is easier to read: bigger text, with the key points highlighted.

- Clicking the update notice in Settings → About opens the new release page; Support Qview opens its own popup with network logos.

- The guided tour introduces the Git collection and read-aloud, and the 🔊 Read button now follows the file you open.

- Folder tabs are no longer closed for you: qview restores every tab you had open, however many.

- Switching to Local, Recent or Git now shows that collection, and the Add-a-rule box updates a rule in place instead of adding a duplicate.

- Focus line lights the line you are on in books made of line breaks, Settings reopens on your last tab, and the tree stays quick in huge folders.

- Read aloud gains its own Voice tab — leave [bracketed] asides unspoken, respell words, move the rules as a file; outlines tick only chapters behind you.

- Read aloud keeps playing when you switch folders, with the floating bar as its mini player; the bar drags anywhere, and V reads from the selection.

- Qview can read documents and books aloud, starting either at the top of the page or at a sentence you pick.

- The outline now ticks the chapters of a book you have already been through, so you can see how far you have got.

- Reading mode: Backspace now turns back a page in EPUB, MOBI and Word Pages.

- Opening a folder cloned from GitHub now says once if the GitHub CLI is missing or signed out, with the commands to fix it.

- ⌘/Ctrl+D diffs the open file against HEAD in the pane — press it again for the file.

- EPUB: clicking the text no longer turns the page — only the margin beside it and a little space outside the page do.

- The open tab now stands out with a lifted look and a bold top band, colour-labelled tabs fade when idle, and side-rail tabs are taller.

- Lists in every document theme are less crowded: items now sit a little further apart.

- In books, PageDown and PageUp now jump to the next or previous chapter, and Enter turns the page like Space and the arrow keys.

- Text width now matches the number you set in Word and book views, and the focus colour picker shows the colour actually on screen.

- Markdown no longer runs scripts hidden inside a file; <style> blocks in markdown stop applying as a result.

- Good View moved off the toolbar into ⚙ Settings → Reading, where it is on by default.

- In EPUB books, clicking on a page's left or right border turns the page; everywhere else is free for selecting text.

- Layout menu: "Focus line" lights the paragraph you are reading, in six styles and any colour. Click one to pin it, arrows to walk it.

- File and content search now take several terms: a comma for any of them, AND for both, quotes for an exact phrase.

- Pasting a web link into the file search now finds the file: the box keeps the link, the search ignores the http:// the browser added.

- Pasting a web link into the file search now says so, instead of silently filtering the tree down to nothing.

- Settings closes from an ✕ in its corner, its tabs now match the All / Local / Recent strip, and the ⚙ button sits smaller in the bar.

- Check for updates works again — Settings → About finds new releases, and the GitHub links open a page anyone can reach.

- Tabs lost the × button you could misclick — close one from its right-click menu instead, and tab names now sit centered.

- The ➕ button now opens a menu — open a file, open a folder, or jump back to a recent folder — and the Settings cog is bigger and easier to spot.

- EPUB books now open in Source Serif 4 at 21px by default — a tighter line that keeps Vietnamese marks legible.

- Pastel now reads with much stronger contrast: a plain grey page and near-black text instead of the old soft blue-violet.

- The Catppuccin theme is now called Pastel in the 🎨 menu; picking it still gives the same colours.

- Books and paged Word documents now open with more breathing room above the first line.

- New Block document theme: grey-green paper, teal accent, hairline cards — and folding a Block section now leaves just its title behind.

- Source and config files open much faster — a multi-megabyte file now appears almost instantly instead of stalling for half a second.

- Qview opens faster — diagram and Word support now load only when a document actually needs them.

- EPUB outline now opens with a link to the book's own table of contents page; chapter titles get more breathing room and a colour from the book theme.

- Card theme: bullet lists now open and space like every other theme, instead of hugging the paragraph above with their items packed together.

- Big folders open and switch faster — the file list no longer blanks out, and clicking a tab selects it instantly.

- Word documents can now be read page by page like a book — the 📖/📜 button switches — and their text starts larger on Windows and Linux.

- Bookmarks: markers at both page edges show where each bookmark sits; click to toggle, and rows say chapter, line or paragraph.

- Bookmarks: press Ctrl/Cmd+B to mark your place in Markdown, text or EPUB files, and jump back from the 🔖 Bookmarks panel.

- Huge EPUB books and novel-length Word documents now open fast, and the Theme menu works while a .docx is open.

- Tìm theo wildcard trong ô tên (*erd.md, erd*), và dán link file (file:///…, C:\…, /Users/…) là mở luôn — cả ở ô F3 lẫn palette Ctrl+/.

- Right-click a table in a diagram to light its relations and their relations too; a left click goes back to the direct ones.

- Typing in a search box gives it the whole row, Layout moved to the Appearance tab, the tour shows the global search popup, and edit mode shows line numbers.

- The search palette now searches inside file contents too — Ctrl/Cmd+E switches between names and contents. The sidebar's 🌐 button is gone.

- A globe-and-magnifier button at the right end of the tab bar opens Search everywhere, the same as Ctrl/Cmd+/.

- Search boxes now match a path fragment like dev-plan/skill.md, keep the cursor where you're typing after auto-open, and step through hits with ↑↓ or Ctrl/Cmd+J/K.

- Ctrl/Cmd+/ opens a search popup across every open folder: type a path to browse it, Tab to complete, Ctrl/Cmd+J/K to move, and results reveal in the tree.

- Files sharing a name now show their folder, empty folders get their own icon, and documents, Word files and books each open at their own width and text size.

- What's new now lists everything added since the first release note, instead of showing only the oldest one.

- Mini player 🎯 now returns to full view — it opens the playing song or clip in the viewer, selects it in the tree, and closes the mini player.

- The mini player's volume slider is longer and no longer runs into the bar's edge.

- Hiding the mini player's picture box now makes the bar narrower instead of stretching the controls.

- The mini player drops its picture box while a song plays, and the buttons stay exactly where they are.

- The mini player hides its thumbnail in bigger-video mode, and no button moves or shrinks when you switch.

- Switching the mini player to the bigger video no longer shifts its buttons sideways.

- Mini player buttons are bigger and easier to hit, and the volume slider is shorter.

- The song or clip playing in the mini player is now marked in the tree with a ▸, so its 🎯 button visibly lands on that file.

- Mini player: the volume slider sits beside the buttons again and reaches the bar's edge, ↺ replaces the stop square, and switching the video size no longer moves the player.

- Mini player: the new ⤴ button shows the video full width above the controls, the bar is narrower, and the volume slider now spans the whole width.

- Mini player redesigned — play/pause, stop, a seek bar, volume, 🎯 to find the playing file in the tree, and an AUTO switch for the next clip or song.

- Compare two photos in the same spot: Slide drags a divider to wipe between them, Flip swaps between them with Space.

- Press Enter or F2 in the file tree to rename the highlighted file or folder, the way Finder does.

- Right-click a file or folder in the tree to copy its full path, and opening a folder now lands on its README instead of a stray image.

- Outline panel numbers headings automatically (1., 1.1, 2.) when the document's own headings have no numbers.

- Tabs: right-click a folder tab and pick a colour under Tab colour to mark it, Finder-style. Pick it again to clear.

- The 🎨 theme button's icon and name now look centred.

- The 🎨 theme button keeps one width, so the toolbar no longer shifts when you switch themes.

#### headings get more room above and sit closer to the text below them, in every theme.

- Mermaid diagrams are colourful: mint nodes, gold labels, blue subgraphs, and each flowchart branch in its own colour.

- Windows: folders in the file tree now show a 📁 folder icon instead of the odd-looking 🗂.

- Dragging a mermaid diagram no longer stutters, even on large ER diagrams, both inline and in fullscreen.

- ER relations panel: the selected table's "one" or "many" is now bold, so you can spot its side of each relationship at a glance.

- ER diagrams: with a table selected, Shift+click or Ctrl+click a related table to see just those two and the line between them, highlighted in the panel too.

- Jumping to a related ER table keeps both tables in view at the same zoom, and the relations panel stays in the top-left corner and opens at the top.

- Diagram fullscreen now fills the whole screen; in ER diagrams the selected table glows red and a related table you jump to glows in the theme colour.

- ER relationships now read with the one side first, like "One CUSTOMER – many ORDER"; clicking a related table moves the view there without losing your zoom or selection.

- Fullscreen ER diagrams: click a table to see its primary and foreign keys and every relationship it has, with cardinality; click a related table to jump there.

- The last folder tab no longer has a close button — closing it used to swap in your home folder instead.

- Folder rows use a new 🗂 icon, markdown files get their own 📝, and code files turn violet — so the three no longer blur together in the file tree.

- ER diagrams now shade each table by how many other tables it links to — grey when none, amber at five or more — with a legend naming the scale.

- ER relationship lines and the crow's foot markers at their ends are three times heavier, readable without clicking a table first

- ER tables in the Card theme now read sky blue instead of green

- The guided tour now points at Edit on its own, and two new steps open the 🎨 Theme and 📐 Layout menus over a sample document you can restyle.

- Clicking a table in an ER diagram no longer dims the relationship labels it highlights.

- ER diagram row values sit a little further again off their column's left line.

- ER diagram row values now sit further off their column's left line.

- ER diagram row values no longer start hard against their column's left line.

- Each theme now gives ER diagram tables a title band in its own accent colour, so a table's header reads clearly apart from its rows.

- ER diagram tables now show a clearly stronger title band, so a table's header no longer blends into the rows beneath it.

- ER diagrams: table names, rows and relationship labels now show in large, readable text, with more room between tables.

- Mermaid ER tables look cleaner in every theme, light and dark: soft striped rows, a clear header, faint inner lines, and a lighter minimap highlight.

- File info: word count and reading time now look like the other details and no longer spill past the panel edge.

- Diagrams now take each theme's colours, and the minimap frame no longer hides the tables beneath it.

- Diagrams: click a table to highlight what it connects to; fullscreen adds a minimap and "/" to jump to a table by name.

- More text files now open (.config, .template, .log, .env, .bat, Dockerfile, LICENSE and more; .tmp/.temp only when text), and the file tree gets a 👁 Hidden checkbox.

- Files double-clicked in Explorer now open near-instantly in the running window (Settings → Opening files), and the Print & PDF buttons are hidden by default.

- Opening a file from Finder or Explorer now shows it straight away instead of waiting for its folder to finish loading, and large folders list about twice as fast.

- Opening a folder in a new tab no longer shows the previous folder's files instead.

- Card theme: subsection headings are slightly smaller, so they read a clear step below the section heading above them.

- The Contrast theme is replaced by Blossom — soft pink paper, raspberry accents and rounded edges, in both light and dark mode.

- Document themes now waste less space around headings and between sections, and eight themes show soft edges where the page meets the background.

- Catppuccin, Nord, Gruvbox, Solarized, Terminal, Editorial, E-ink and Contrast themes now show soft edges where the page meets the background.

- Right-click or select text in an HTML preview now opens the same card as anywhere else, and G / D / C run its Google, Dictionary and Copy buttons.

- ⛶ (or F11) now gives every document — markdown, text, code, PDF, EPUB, Word — a distraction-free fullscreen view; Esc exits.

- Guided tour no longer pops up when you open a file from Explorer or Finder; large folders (even a whole drive) load without freezing. Settings has a new toggle to hide the Print/PDF toolbar buttons.

- UI Inspector: pressing Esc now always exits inspect mode, even right after clicking a button in its popup.

- File path in the info panel now wraps instead of getting cut off with an ellipsis.

- Print and PDF toolbar buttons now match the other toolbar buttons instead of showing the plain system look.

- Settings → About can check GitHub for a newer Qview release — off by default, with a Check now button.

- Print the open document with ⌘/Ctrl+P, or use the new ⤓ PDF button to save it as a PDF next to the original.

- File Info now shows a Words row and a Reading row for Markdown, text and Word documents — code blocks, diagrams and formulas are not counted.

- Obsidian-style [[wiki-links]] open the matching note, [[note#heading]] lands on the heading, and ![[picture.png]] shows the picture inline.

- Footnotes in markdown now render as numbered superscripts with the notes listed at the end of the document.

- Markdown now renders math formulas — $$ for a block, $ for inline — and shows a broken formula in red instead of hiding it.

- Switching a collection or a jump-bar kind no longer opens a different file — what you are reading stays put. ⌘/Ctrl+J and K step back and forward through history.

- Toolbar gains ◀ ▶ Back/Forward through every file and section you viewed (also Alt+←/→), and 🎯 reveals the open file in the tree even when a name filter hides it.

- Tour: a new "What Qview opens" section walks through each file type — Markdown, code, PDF, books, pictures, video, music.

- Settings: the Close button sits a little lower, with space above it.

- UI inspector: the Style rows are now editable — change a colour, font or padding and see it on screen at once, with Reset to undo; section headers are easier to read.

- UI inspector: "Copy for AI" is now one short line — the control's name plus the script and stylesheet files to edit, e.g. edit-btn (#edit-btn · edit.js · style.css).

- UI inspector: the "Copy for AI" line is shorter — repeated selectors collapse to "×N" and runtime-injected styles are labelled as such.

- UI inspector: "Copy for AI" now gives one short line that locates the control; the full colours-and-font block moved to a new "Copy details" button.

- ⌘/Ctrl+/ opens the UI inspector: every control gets an outline, hover shows its name, click shows its colours, font and CSS, with a "Copy for AI" button.

- Theme menu: the Card row is now white like its cards, and the Glass row shows the theme's soft colour glows.

- Theme picker: fixed Glass showing the wrong preview color.

- Theme picker now previews each option in its own document background color.

- Outline section toggles are now bigger in Terminal and E-ink themes, and centered on the heading in Editorial theme.

- Outline section toggles now sit centered on the heading in every document theme, and the toggle is bigger in Claude theme.

- Settings → Appearance: preset borders now show up clearly instead of blending into the background.

- New install defaults code syntax colours to Atom One Light; picking any Syntax colour other than Theme default hides the Theme button in code view

- Theme button no longer disappears when you open a code file

- Choosing a document theme now also colours headings, links and quotes when reading EPUB/MOBI books, not just the page background.

- Nord theme reads brighter, Gruvbox theme less yellow.

- Right-click on any text now opens the same popup as selecting it — Google, Copy, Dictionary, and colour preview when it's a colour.

- Right-click a colour: one popup now, not two — and it opens below the word so the text stays readable.

- Right-click a colour (hex, name, or xkcd phrase) now shows the colour card right away — no need to click Colour… first.

- Select a word or a colour code in a document to Google it, preview the colour, pick another and copy its code — or right-click a word for the same menu.

- Layout ▸ font pickers now include ten bundled fonts (Inter, Literata, JetBrains Mono, Fira Code, …) that look the same on every computer and support Vietnamese.

- Claude theme in dark mode is now warm charcoal with terracotta links, and no longer sits in a bright ivory frame.

- 🎨 Theme menu gains eight looks — Catppuccin, Nord, Gruvbox, Solarized, Terminal, Editorial, E-ink and Contrast — each with a light and a dark side.

- Links to a section — inside the document or in another file — now jump there, unfolding it if needed. Right panel is tighter and the ⊟ ⊞ buttons are bigger.

- Good View now starts on, section folding arrows became chevrons aligned with the heading text, and Card theme tables have more space beneath them.

- Cmd/Ctrl+O now opens the selected file in its default app, or the selected folder in Finder or Explorer; the 📄 button still picks a file.

- Tabs can run down the left edge as a collapsible, resizable rail (right-click a tab, or ⚙ Settings → Layout), and settings now survive quitting right after you change one.

- Jump to any open tab from the new ☰ list or with Alt+1..9; the bar scrolls the active tab into view, and tabs no longer resize when selected.

- Jump back to the previous file with Ctrl/Cmd+~ too, not just Ctrl/Cmd+`.

- Switching back to a PDF you had open snaps back instantly, right where you left off.

- The Types filter button no longer stays highlighted from your last session — only lights up when you check a type this time.

- Settings is wider and has a new Shortcuts tab listing every keyboard shortcut in the app.

- Alt+Left/Right (or Ctrl/Cmd+`) jumps back to whichever file you had open right before this one.

- The picture icon in the file tree no longer looks wrong on Windows.

- Press F3 to search files & folders, F4 to search their contents — start typing right away, and the first match opens itself after a short pause.

- Wide tables now scroll sideways instead of having their right-hand columns cut off, and a diagram that fails to draw no longer leaves an error over later files.

- Large markdown files with long tables open several times faster, and cells containing a $ sign no longer come out mangled.

- Searching a file's plain-text view now highlights every match and scrolls to the one you are on, including HTML source opened with ⌘Enter.

- Search content now covers code, config and table files, jumps to the match when you open one, and no longer misses matches far down a long file.

- New 🌐 button beside the search boxes searches every open tab at once — by file or folder name, or by what is inside your text files.
- Favorites, Recent and search results now show just the file name, without the folder path repeated beside it.
- Renaming or cancelling a rename keeps the file tree focused, so arrow keys still work right after.
- Mở file .html giờ hiện bản xem trước an toàn (script không chạy) thay vì mã nguồn thô; bấm Sửa để xem/sửa mã.
- JSON/JSONL files now beautify automatically on open; the 🗂 Types filter now shows only the types you check instead of hiding them.
- Open .jsonl files directly, and pretty-print any JSON view with the new Beautify button.
- Sửa syntax theme dropdown không đổi màu khi mở file code/JSON riêng, và JSON key/value trong theme mặc định giờ khác màu dễ đọc hơn.
- A "What's new" popup greets you after an update with that release's highlights and a one-click Buy Me a Coffee link; two new docs, features.md and release-note.md, cover the full feature list and versioned release history.
- Deleted or renamed files now drop out of Recent, per-file-type Recent, and the jump bar automatically.
- Outline items in the side panel are a touch larger and easier to read.
- Books (EPUB, MOBI) now open at a narrower, more comfortable reading width by default.
- Modern theme: the page has soft shadows along its left and right edges.
- Settings: the Change…, Reset… and Show buttons share one style, instead of the unstyled ones rendering as bare OS buttons beside the styled one.
- AGENTS.md gains a token-saving cote workflow (scripts/cote.sh) and a rule that CHANGELOG entries stay one short, user-facing line; all 144 existing entries were rewritten to match.
- Settings → Layout: "Swap the side panels" moves the file tree to the right and the outline to the left.
- Content search no longer lags while you type in a large folder.
- EPUB images that use srcset, or an unquoted path, now display instead of failing to load.
- EPUB and MOBI pages cast a soft shadow, so the text reads as a sheet of paper on a desk.
- Opening an EPUB with local images no longer logs a file-not-found error.
- The find bar no longer turns red when the box is empty or when you have just opened a new file, and "not found" is a clearer red.
- The Ctrl+F search bar has a pale yellow fill and a rounded border, so it reads as a popup rather than part of the page.
- The sidebar's name and content search boxes light up while they hold text, so you can see at a glance that the tree is filtered.
- The jump bar highlights the button you actually clicked; opening the same file from the tree or a tab no longer lights up an unrelated one.
- Clearing a search scrolls the tree back to the file you have open.
- EPUB pages use the warm paper colour of the document theme instead of plain white.

- Click anywhere in the margins beside an EPUB page to turn it, not just on the text.
- Ctrl+F ignores punctuation now: searching AD01 finds AD-01, AD 01 and AD:01.
- The sidebar name filter and content search ignore punctuation the same way, so all three searches agree on what counts as a match.
- Ctrl/Cmd-click a Types checkbox to show that type alone, instead of unticking the rest by hand.
- Ctrl or Shift plus the wheel scrolls sideways — long code lines, wide CSV and zip tables — so a plain mouse can reach them.
- A .docx opens centred in the reading column instead of flush against the left edge.
- Fix the file tree hanging on "Loading files…" on macOS. Your Library folder is skipped now, the same as node_modules.
- The Text and Snippet size sliders both cover 8–40px.
- File names in the tree use the same colour as outline entries.
- Record a code review in plan-0908.md, including two defects the smoke suite misses — one still open: Reset appearance discards an unsaved edit.
- Layout can set your reading fonts: Body for prose, Mono for code, and a Syntax palette for keywords, strings and comments. Only installed fonts are offered.
- Source files get their own size slider (Code file, 9–36px), separate from the Snippet slider for fenced code inside a document.
- Code, the line-number gutter and fenced blocks share one font, instead of the gutter and the code disagreeing.
- The Syntax palette applies over the document theme, which used to out-colour any palette you picked.
- Two syntax palettes are stored, light and dark, and swap with the light/dark toggle — Monokai on a white page is unreadable.
- Layout shows only the rows the open file can use, and Reset changes only what is shown: a book gets prose rows, a source file gets code rows.
- Layout is reachable with a source file open — it now holds the code size, mono font and syntax palette.
- The Layout menu scrolls inside a short window instead of running its Reset button off the bottom.
- Settings gains Reset appearance: theme, light/dark, every Layout value, fonts, palettes, Good View and image modes back to defaults, behind a confirm. Tabs and favourites are untouched.
- Ctrl/Cmd+, opens Settings and Ctrl/Cmd+L opens Layout.
- Extend the smoke suite by eight checks covering the Layout and Reset work.
- Switching tabs and coming back no longer throws a document to the top — the reading position was being erased on the way out.
- Scroll positions are saved against the document actually on screen, so one file can never overwrite another's position.
- Both pinned tabs wear the gold border, marking where the global lists end and your folder tabs begin.
- Past five folder tabs, Favorites and Recent shrink to their icon and count, freeing width for folder names.
- Qview reads five more kinds of file: source and config with line numbers, CSV/TSV as a table, audio with a player, ZIP as a listing, .docx as prose.
- Source files are editable, not read-only — the same as a .txt.
- Code opens with a sticky line-number gutter. Past 400KB it opens unhighlighted, with a note saying why.
- The CSV viewer reads quoted fields correctly and takes its separator from the extension. It stops at 2000 rows and 200 columns, and says so.
- A .zip is listed, never extracted: name, folder, size, packed size, date and ratio, plus Reveal in Finder.
- A .docx converts to real headings and lists rather than a picture of a Word page, and keeps the Layout column.
- Qview does not register as the system handler for the new types — .js stays with your editor and .docx with Word.
- Content search greps source, config and delimited files too. PDF, EPUB and .docx stay out — too slow to scan on every keystroke.
- The jump bar gains a ⌨ slot for source files.
- Split helpers.js and openfile.js so no file breaks the 200-line rule.
- Extend the smoke suite by seven checks covering the new file kinds.
- Split probes-groupsort.js: the per-tab memory probes move to probes-prefs.js.
- A guided tour on first launch: eleven bubbles pointing at the real controls, one at a time. Next/Back/Skip or the arrow keys; replay it from Help in Settings.
- The tour's spotlight ring and the dim around it are one element, so they cannot drift apart on a resize. Clicks outside the bubble are swallowed.
- A tour step whose target is not on screen is skipped, so a bubble never points at nothing.
- Each bubble is kept inside the window and its arrow still points at the thing it describes.
- The tour never opens itself while the smoke suite is driving the app.
- Extend the smoke suite by four checks covering the tour.
- Frontmatter at the top of a markdown file shows verbatim, instead of a header card that overlapped its own text.
- Frontmatter shows the same way in the compare panes as in the main viewer.
- Style the 📄 Open File button like its neighbours.
- Split probes-core.js: document rendering checks move to probes-render.js.
- Open a single file without adding its folder first — double-click it in Finder/Explorer, drop it on the window, or press Ctrl/Cmd+O. Its folder becomes the tree root.
- Ctrl/Cmd+O opens a file, as in every other app; the folder picker moves to Ctrl/Cmd+Shift+O and stays on ➕.
- Double-clicking a file in Finder/Explorer opens it in the window you already have, not a second one.
- Fix dropping a file on the window doing nothing on newer Electron.
- Split probes-shortcuts.js: the tree arrow probes move to probes-treearrows.js.
- EPUB and MOBI paging follows the pointer: rest the mouse over the page and the wheel and arrow keys turn it, without clicking first.
- Split the input half of epub.js into epubinput.js.
- Fix a book reopened at a later chapter ignoring the Layout width and running edge to edge.
- Fix a smoke probe reading a working Good View as broken after an md-editor upgrade.
- Move all source into src/. No behaviour change — verified against a pre-move smoke baseline.
- Fix the splash icon going missing after the move.
- Claude theme: cool the background slightly, less yellow.
- Document the npm run vendor step in the README — pulling the src/ move without it left the app blank.

- EPUB and MOBI get their own Layout settings — width, text size, code size, line gap — so a book no longer inherits the document ones.
- Fix the Line gap slider doing nothing in EPUB and MOBI.
- The Layout Width slider covers 300–2000px, up from 600–1400.
- npm run dist bumps the patch version, so builds stop shipping as 0.1.0 forever.
- Tree right-click: a new "Open file" entry hands the file to your default app, and the paste entries stay hidden until the clipboard holds something.
- The tab close button sits flush against the tab's right edge after a short label.
- The page background around a document can vary per theme; only Claude uses it so far.
- The markdown viewer and its four themes now come from md-editor, a library extracted from this app. Nothing changed on screen — the same 140 smoke checks pass.
- Every call site kept its old names, so the extraction touched only the files it replaced.
- Your saved theme and text sizes survive the upgrade.
- Four defects were found and fixed while extracting the code, all of which had been in Qview:
  - Two headings with the same text got the same link, so clicking the second outline row scrolled to the first.
  - A failed save still advanced the text in memory, so Escape "restored" content that never reached disk.
  - The dirty marker stayed on after you undid an edit back to the saved text.
  - Find-in-editor stopped counting at 5000 matches and presented that as the total.
- Fix the whole smoke suite dying before its first result.
- Update the README for the extraction.
- Fix an EPUB probe pointing at a path that no longer exists.
- Toasts sit on a yellow pill, so you can spot one inside the 2.6 seconds it is up.
- Expand all / Collapse all use ⊞ / ⊟ in the outline and the tree — the convention every file tree uses — instead of ⏬ / ⏫.
- Ctrl/Cmd+C in the tree copies the selected files to the OS clipboard, ready to paste into a browser, a chat or your file manager.
- Copy and Cut confirm on screen instead of doing their work in silence.
- The 📦 Move to… dialog shows a real folder tree instead of one flat list of every folder. Typing in the filter still falls back to the flat list.
- The 📦 Move to… dialog gains a 👁 Hidden box for moving into a dot-folder, without changing the app-wide setting.
- Extend the smoke suite from 139 to 147 checks, covering the Move dialog tree and the sidebar copy shortcut.
- Add AGENTS.md (AI working rules) and symlink CLAUDE.md to it.
- Merge the separate Python and JavaScript file-size rules in AGENTS.md into one.
- Double right-click on an image applies Auto Fit instead of Vertical fit.
- Search is faster: name filtering is debounced, and content search no longer blocks the app while it reads files — worst on Windows.
- Add a Linux AppImage build.
- Ctrl/Cmd+O opens a folder in a new tab; the Favorites tab moves to Ctrl/Cmd+0.
- Release builds are named by version and platform.
- Double left-click a photo for the fit Auto Fit did not pick, double right-click for Auto Fit — in the viewer and fullscreen alike.
- Axis fits leave a small gutter each side instead of filling the surface edge to edge.
- Compare moves to the top of the right-click menu.
- Fix the selection highlight not showing until you moved the pointer away.
- Multi-select no longer slows down as a folder grows: on 50,000 rows a Ctrl-click went from 19ms to 0.01ms.
- Split every oversized source file — 16 over the 200-line limit became 0. Pure code moves, no behaviour change.
- Extend the smoke suite from 90 to 94 checks, covering image fit and zoom, tab drag and selection painting.
- Windows: switch the installer to NSIS with a directory picker, instead of a portable build that self-extracted somewhere new each run.
- Add a startup splash instead of a blank pane while the first tab loads.
- File Info: wrap long names onto two lines, split Date into Created and Modified, and spell the month (Sep 3, 2026, 10:14 AM).
- "New folder here" in the tree's right-click menu drops straight into rename mode.
- Drag a file or folder onto another folder to move it in, or onto blank space for the root. Dragging part of a selection carries all of it.
- Empty folders show up in the tree, so a folder you just made does not vanish.
- Compare: double-click an image pane to fit the picture; opening the file for real moves to a 📂 button.
- Searching files matches folder names too — a matched folder opens with all its contents.
- Right-click gains a file clipboard: Cut, Copy, then Copy files here / Move files here. Files copied in Finder or Explorer paste too, and a clash never overwrites.
- Right-click a folder to open a terminal there — only the terminals you actually have installed are listed.
- With two or more files selected, the arrow keys tour the selection instead of the whole tree. Esc clears it.
- Compare: a shared zoom bar drives both panes, and 🔗 Sync Photos ties the mouse together too, so the pair moves as one picture.
- Compare: photo panes open filling the pane's short side instead of shrinking the whole picture into it.
- A copy, move or drag reports what happened in a toast instead of silently reshuffling the tree.
- Extend the smoke suite from 96 to 110 checks, covering the file clipboard, terminals, selection arrows and the compare zoom bar.
- Right-click gains ◇ Add to Local and ☆ Add to Favorites, acting on the whole selection; the label flips to Remove once everything is already in.
- Fix files in a subfolder sitting one step further in than the folders at their own level.
- Folder rows get a roomier band in both Thumbnail modes.
- Right-click a tab to rename it inline, reset to the folder name, reveal the folder, copy its path, or close it. A rename survives restarts.
- Add a 🕘 Recent collection of the last 50 files opened — one per tab, plus a global one pinned beside ⭐ Favorites.
- Put a space between a collection's name and its count.
- The right-click menu can be driven from the keyboard: each entry shows the letter that runs it, so right-click then C copies.
- Open Compare from a two-file selection without the menu: double-click either file, or press Enter or Space.
- Add a ⚙ Settings popup with Show hidden files & folders, Include node_modules, and the Library folder picker. Both flags default to off.
- The tab bar fits more tabs at the same height — eight where six used to fit at 1400px wide — by shortening labels before the strip scrolls.
- The tab strip scrolls sideways on a plain vertical wheel.
- 📦 Move to… can move into any folder of any open tab, through a chip per tab across the top.
- 📦 Move to… keeps one height, so the Move button no longer slides out from under the pointer.
- The outline gains expand-all / collapse-all, folding the outline and the document's sections together. Disabled rather than hidden when there is nothing to fold.
- AGENTS.md holds only what is specific to this repo and points at the global rules.
- run-qview skill: move the debug port off 9222, and check the page found is actually this app before driving it.
- Extend the smoke suite from 110 to 139 checks, covering Recent, tab rename, menu letters, the Settings flags, the tab bar and the Move dialog.
- Image files get their own 🏞 icon in the tree, jump bar and type labels.
- File Info shows the aspect ratio beside the resolution (1080 × 1920 · 9:16 · 1K).
- Compare: Ctrl+Scroll or Shift+Scroll scrolls both text panes together, so a side-by-side read does not drift.
- Editing remembers where you were reading: Ctrl+Enter carries your place into the source and back out again, instead of landing at the top.
- Layout gains a Line gap slider (0–3em) controlling paragraph and line spacing, independent of Good View.
- Widen the Layout dropdown so "Line gap" fits on one line.
