// Build dist/: one classic-script bundle + the CSS a host links at runtime.
//
// Format is IIFE, not ESM, on purpose — the first consumer (Qview) loads
// everything through plain <script src> tags with no bundler, and a module
// build would force that whole renderer over to type="module" at once.
//
// Themes are COPIED, not bundled: the host swaps them by rewriting a
// <link href>, so each has to stay a separate file at a stable path.
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'themes'), { recursive: true });

  await esbuild.build({
    entryPoints: [path.join(ROOT, 'src', 'index.js')],
    bundle: true,
    format: 'iife',
    globalName: 'MdEditor',
    target: ['chrome120'],
    // marked / hljs / mermaid are peers read off globals at call time, so there
    // is nothing to mark external — src never require()s them.
    outfile: path.join(OUT, 'md-editor.js'),
    legalComments: 'inline',
  });

  await esbuild.build({
    entryPoints: [path.join(ROOT, 'css', 'base.css')],
    bundle: true,
    outfile: path.join(OUT, 'md-editor.css'),
  });

  const themes = fs.readdirSync(path.join(ROOT, 'themes')).filter((f) => f.endsWith('.css'));
  for (const t of themes) {
    fs.copyFileSync(path.join(ROOT, 'themes', t), path.join(OUT, 'themes', t));
  }

  const size = (p) => (fs.statSync(p).size / 1024).toFixed(1) + ' KB';
  console.log('[build] dist/md-editor.js   ' + size(path.join(OUT, 'md-editor.js')));
  console.log('[build] dist/md-editor.css  ' + size(path.join(OUT, 'md-editor.css')));
  console.log('[build] dist/themes/        ' + themes.length + ' themes');
}

main().catch((e) => { console.error(e); process.exit(1); });
