'use strict';

/* ================= host adapter =================
   The library never reaches the filesystem or the shell. Everything that leaves
   the page goes through one of these methods, so the same rendering code runs
   inside Electron — where they are IPC calls — and on a plain web page, where
   they are URL arithmetic.

   Any method may return a promise; callers always await. */

// A document path may arrive as a URL or as a filesystem path, and a filesystem
// path is not a valid URL base. Accepting both is the difference between a host
// needing a custom adapter and not: an absolute path is exactly as
// unambiguous as its file:// form, so it is converted rather than rejected.
function toBaseUrl(docPath) {
  const s = String(docPath == null ? '' : docPath);
  if (!s) return null;
  try { return new URL(s).href; } catch (e) {}
  const windows = /^[A-Za-z]:[\\/]/.test(s);
  if (s.startsWith('/') || windows) {
    // URL() percent-encodes spaces and the rest for us; a drive letter has to
    // gain the leading slash file:// wants.
    const p = windows ? '/' + s.replace(/\\/g, '/') : s;
    try { return new URL('file://' + p).href; } catch (e) {}
  }
  return null;
}

const warned = new Set();

// A relative link inside a document is relative to the DOCUMENT, not to the
// page that mounted it, so both defaults resolve against docPath. An
// unresolvable base is reported rather than swallowed: returning the raw
// relative string quietly produces links and pictures that resolve against the
// host page, which shows up much later as "images sometimes do not load".
function resolveAgainst(docPath, rel) {
  const base = toBaseUrl(docPath);
  if (!base) {
    const key = String(docPath);
    if (!warned.has(key)) {
      warned.add(key);
      console.warn('md-editor: cannot resolve relative links against ' + JSON.stringify(key)
        + ' — pass an absolute path or URL as docPath, or supply your own resolveFile/resolvePath.');
    }
    return rel;
  }
  try { return new URL(rel, base).href; } catch (e) { return rel; }
}

const WEB = {
  resolveFile: (docPath, rel) => resolveAgainst(docPath, rel),
  resolvePath: (docPath, rel) => resolveAgainst(docPath, rel),
  openExternal: (url) => {
    if (typeof window !== 'undefined' && window.open) window.open(url, '_blank', 'noopener');
  },
  // Sidecar prompt files are a local-filesystem idea, so on the web there are
  // none and the "Copy Full" button simply never appears.
  readInject: () => null,
  writeFile: () => {
    throw new Error('md-editor: this adapter is read-only — supply writeFile() to enable saving.');
  },
};

function createAdapter(overrides) {
  return Object.assign({}, WEB, overrides || {});
}

module.exports = { createAdapter, WEB, toBaseUrl };
