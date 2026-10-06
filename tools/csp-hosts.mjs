// csp-hosts.mjs - derive a Content-Security-Policy from what the BUILT site actually loads, so DEPLOY.md never
// carries a guessed host list. Node builtins only.
//   node tools/csp-hosts.mjs [--dir dist] [--json out.json] [--control]
// Walks every .html (script src, iframe src, img/source src+srcset, video/audio src+poster, link href by rel, form
// action, inline <script> that is not JSON-LD, style="" attributes, <style> blocks), every .css (url(), @import) and
// every .js (absolute http(s) URL literals) and prints, per directive, the 'self' + the third-party origins found,
// plus the inline usage that would need 'unsafe-inline' or hashes. JSON-LD blocks are data, not script: not counted.
// --control plants a page with an external script, a frame and an inline style in a temp copy and must report them.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : d; };

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const originOf = (u) => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.origin : null; } catch { return null; } };

export function scan(dir) {
  const D = { script: new Set(), frame: new Set(), img: new Set(), media: new Set(), style: new Set(), font: new Set(), connect: new Set(), form: new Set() };
  const inline = { scripts: 0, scriptHashes: new Set(), styleAttrs: 0, styleBlocks: 0, styleBlockHashes: new Set(), filesWithStyleAttrs: new Set(), eventHandlers: 0 };
  const add = (k, u, file) => { const o = originOf(u); if (o) (D[k].files ||= new Map(), D[k].add(o), D[k].files.set(o, (D[k].files.get(o) || new Set()).add(path.relative(dir, file).split(path.sep).join('/')))); };
  for (const f of walk(dir)) {
    const ext = path.extname(f).toLowerCase();
    if (ext === '.html' || ext === '.htm') {
      const h = fs.readFileSync(f, 'utf8');
      for (const m of h.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        const attrs = m[1];
        const src = (attrs.match(/\bsrc\s*=\s*["']([^"']+)/i) || [])[1];
        const type = ((attrs.match(/\btype\s*=\s*["']([^"']+)/i) || [])[1] || '').toLowerCase();
        if (src) add('script', src, f);
        else if (!/json/.test(type) && m[2].trim()) { inline.scripts++; inline.scriptHashes.add("'sha256-" + crypto.createHash('sha256').update(m[2]).digest('base64') + "'"); }
      }
      for (const m of h.matchAll(/<iframe\b[^>]*?\b(?:src|data-src)\s*=\s*["']([^"']+)/gi)) add('frame', m[1], f);
      for (const m of h.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
        const t = m[0];
        const isMedia = /<source\b/i.test(t) && /type\s*=\s*["'](?:video|audio)/i.test(t);
        for (const a of t.matchAll(/\b(?:src|data-src)\s*=\s*["']([^"']+)/gi)) add(isMedia ? 'media' : 'img', a[1], f);
        for (const a of t.matchAll(/\bsrcset\s*=\s*["']([^"']+)/gi)) for (const c of a[1].split(',')) add('img', c.trim().split(/\s+/)[0], f);
      }
      for (const m of h.matchAll(/<(?:video|audio)\b[^>]*>/gi)) {
        for (const a of m[0].matchAll(/\b(?:src|data-src[\w-]*)\s*=\s*["']([^"']+)/gi)) add('media', a[1], f);
        for (const a of m[0].matchAll(/\bposter\s*=\s*["']([^"']+)/gi)) add('img', a[1], f);
      }
      for (const m of h.matchAll(/<link\b[^>]*>/gi)) {
        const t = m[0]; const href = (t.match(/\bhref\s*=\s*["']([^"']+)/i) || [])[1]; const rel = ((t.match(/\brel\s*=\s*["']([^"']+)/i) || [])[1] || '').toLowerCase();
        const as = ((t.match(/\bas\s*=\s*["']([^"']+)/i) || [])[1] || '').toLowerCase();
        if (!href) continue;
        if (/stylesheet/.test(rel) || as === 'style') add('style', href, f);
        else if (as === 'font') add('font', href, f);
        else if (as === 'image' || /icon/.test(rel)) add('img', href, f);
        else if (as === 'script') add('script', href, f);
      }
      for (const m of h.matchAll(/<form\b[^>]*\baction\s*=\s*["']([^"']+)/gi)) add('form', m[1], f);
      const sa = (h.match(/\sstyle\s*=\s*["'][^"']*["']/gi) || []).length;
      if (sa) { inline.styleAttrs += sa; inline.filesWithStyleAttrs.add(path.relative(dir, f).split(path.sep).join('/')); }
      for (const m of h.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) { inline.styleBlocks++; inline.styleBlockHashes.add("'sha256-" + crypto.createHash('sha256').update(m[1]).digest('base64') + "'"); }
      inline.eventHandlers += (h.match(/\son[a-z]+\s*=\s*["']/gi) || []).length;
    } else if (ext === '.css') {
      const c = fs.readFileSync(f, 'utf8');
      for (const m of c.matchAll(/url\(\s*['"]?([^'")]+)/gi)) add(/\.(woff2?|ttf|otf)(\?|$)/i.test(m[1]) ? 'font' : 'img', m[1], f);
      for (const m of c.matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+)/gi)) add('style', m[1], f);
    } else if (ext === '.js' || ext === '.mjs') {
      const j = fs.readFileSync(f, 'utf8');
      /* QA round 1 (CONTENT-11): XML namespace URIs (createElementNS('http://www.w3.org/2000/svg', ...)) are names,
         never fetched: they are not connect-src hosts */
      for (const m of j.matchAll(/["'`](https?:\/\/[^"'`\s]+)["'`]/g)) if (!/^https?:\/\/www\.w3\.org\/(?:2000\/svg|1999\/xhtml|1999\/xlink|XML\/1998\/namespace|2000\/xmlns\/?)$/.test(m[1])) add('connect', m[1], f);
    }
  }
  const list = (k) => [...D[k]].sort();
  const policy = [
    "default-src 'self'",
    ['script-src', "'self'", ...list('script'), ...(inline.scripts ? [...inline.scriptHashes].sort() : [])].join(' '),
    ['style-src', "'self'", ...list('style'), ...(inline.styleAttrs ? ["'unsafe-inline'"] : inline.styleBlocks ? [...inline.styleBlockHashes].sort() : [])].join(' '),
    ['img-src', "'self'", 'data:', ...list('img')].join(' '),
    ['media-src', "'self'", ...list('media')].join(' '),
    ['font-src', "'self'", ...list('font')].join(' '),
    ['frame-src', ...(list('frame').length ? list('frame') : ["'none'"])].join(' '),
    ['connect-src', "'self'", ...list('connect')].join(' '),
    ['form-action', "'self'", ...list('form')].join(' '),
    "base-uri 'self'", "object-src 'none'", "frame-ancestors 'self'", 'upgrade-insecure-requests',
  ].join('; ');
  const detail = Object.fromEntries(Object.entries(D).map(([k, s]) => [k, [...s].sort().map((o) => ({ origin: o, files: s.files ? s.files.get(o).size : 0, example: s.files ? [...s.files.get(o)][0] : null }))]));
  return { dir, directives: detail, inline: { scripts: inline.scripts, scriptHashes: [...inline.scriptHashes].length, styleAttrs: inline.styleAttrs, filesWithStyleAttrs: inline.filesWithStyleAttrs.size, styleBlocks: inline.styleBlocks, eventHandlers: inline.eventHandlers }, policy };
}

function main() {
  if (arg('control')) {
    const t = fs.mkdtempSync(path.join(os.tmpdir(), 'csp-ctl-'));
    fs.writeFileSync(path.join(t, 'index.html'), '<!doctype html><html><head><script src="https://evil.example/x.js"></script></head><body><iframe src="https://frames.example/e"></iframe><p style="color:red">x</p><script>alert(1)</script></body></html>');
    /* QA round 1: a script's real fetch host is reported, its SVG namespace literal is not */
    fs.writeFileSync(path.join(t, 'a.js'), "fetch('https://api.example/x'); document.createElementNS('http://www.w3.org/2000/svg', 'svg');");
    const r = scan(t);
    const ok = r.directives.script.some((d) => d.origin === 'https://evil.example') && r.directives.frame.some((d) => d.origin === 'https://frames.example') && r.inline.styleAttrs === 1 && r.inline.scripts === 1
      && r.directives.connect.some((d) => d.origin === 'https://api.example') && !r.directives.connect.some((d) => d.origin === 'http://www.w3.org');
    fs.rmSync(t, { recursive: true, force: true });
    console.log('control', ok ? 'FIRED (external script, frame, inline style and inline script all reported)' : 'DID NOT FIRE');
    return ok ? 0 : 1;
  }
  const dir = path.resolve(ROOT, String(arg('dir', 'dist')));
  const r = scan(dir);
  for (const [k, v] of Object.entries(r.directives)) console.log(k.padEnd(8), v.length ? v.map((d) => d.origin + ' (' + d.files + ' files)').join(', ') : '-');
  console.log('inline  ', JSON.stringify(r.inline));
  console.log('policy  ', r.policy);
  if (arg('json')) fs.writeFileSync(path.resolve(ROOT, String(arg('json'))), JSON.stringify(r, null, 2));
  return 0;
}
process.exitCode = main();
