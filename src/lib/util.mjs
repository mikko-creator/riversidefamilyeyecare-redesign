/* util.mjs - shared helpers for the Riverside Family Eye Care build. Node builtins only.
   Forked from the reference build's src/lib/util.mjs (R, see docs/PORT-NOTES.md). Changes for this site
   (PORT-NOTES 2.6): the entity table also decodes &dagger; &Dagger; &le; &sect; &para;, which occur in the
   main region of the contact-lens brand pages; everything else is unchanged. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAMED = {
  nbsp: ' ', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  ndash: '–', mdash: '—', hellip: '…', reg: '®', trade: '™', ouml: 'ö', copy: '©', raquo: '»', laquo: '«',
  rsaquo: '›', lsaquo: '‹', times: '×', eacute: 'é', egrave: 'è', uuml: 'ü', auml: 'ä', deg: '°', frac12: '½',
  middot: '·', bull: '•', shy: '',
  /* PORT-NOTES 2.6 (entity-check.mjs): present in the Riverside main regions */
  dagger: '†', Dagger: '‡', le: '≤', ge: '≥', sect: '§', para: '¶',
};

export function decodeEntities(s) {
  return String(s || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, n) => (n.toLowerCase() === 'amp' ? m : (NAMED[n] !== undefined ? NAMED[n] : (NAMED[n.toLowerCase()] !== undefined ? NAMED[n.toLowerCase()] : m))))
    .replace(/&amp;/g, '&');
}

export const stripTags = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
export const plain = (s) => decodeEntities(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

export function up(depth) { return depth === 0 ? '' : '../'.repeat(depth); }

/* Intrinsic dimensions straight from the file header - the bytes are the only honest source.
   Every <img> gets width/height so the browser reserves its box (no layout shift). */
const dimCache = new Map();
export function imageSize(absFile) {
  if (dimCache.has(absFile)) return dimCache.get(absFile);
  let out = null;
  try {
    const b = fs.readFileSync(absFile);
    if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) {
      out = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    } else if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length - 9) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          out = { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
          break;
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    } else if (/\.svg$/i.test(absFile)) {
      const t = b.toString('utf8').slice(0, 2000);
      const wAttr = /\bwidth\s*=\s*["']([\d.]+)/i.exec(t);
      const hAttr = /\bheight\s*=\s*["']([\d.]+)/i.exec(t);
      if (wAttr && hAttr) out = { w: Math.round(+wAttr[1]), h: Math.round(+hAttr[1]) };
      else {
        const vb = /viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/i.exec(t);
        if (vb) out = { w: Math.round(+vb[1]), h: Math.round(+vb[2]) };
      }
    } else if (b.length > 30 && b.slice(0, 4).toString('latin1') === 'RIFF' && b.slice(8, 12).toString('latin1') === 'WEBP') {
      const fmt = b.slice(12, 16).toString('latin1');
      if (fmt === 'VP8X') out = { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
      else if (fmt === 'VP8 ') out = { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
      else if (fmt === 'VP8L') {
        const bits = b.readUInt32LE(21);
        out = { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
      }
    } else if (b.slice(0, 3).toString('latin1') === 'GIF') {
      out = { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
    }
  } catch { out = null; }
  dimCache.set(absFile, out);
  return out;
}

export function ownPath(url, origin) {
  try { return new URL(url, origin + '/').pathname.replace(/^\/+|\/+$/g, ''); } catch { return null; }
}

export function depthOf(url) {
  let p;
  try { p = new URL(url).pathname; } catch { return 0; }
  return p.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean).length;
}

export function walk(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, base, out); else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}

export const readJSON = (abs, fallback) => {
  if (fallback !== undefined && !fs.existsSync(abs)) return fallback;
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
};

/* Find the element that OPENS at `openIdx` (a `<tag ...>` start) and return the index just past its
   matching close tag, counting nested same-name tags. Used to lift whole platform modules
   (div.ecp-breadcrumb, div.ecp-childpages, team posts) out of the raw markup intact. */
export function elementEnd(html, openIdx, tag) {
  const re = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'gi');
  re.lastIndex = openIdx;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    if (m[1]) { depth--; if (depth === 0) return m.index + m[0].length; }
    else if (!/\/>$/.test(m[0])) depth++;
  }
  return html.length;
}

/* Every element whose opening tag matches `openRe` (which must match `<tag ...>` and capture the
   tag name in group 1), outermost first, as { start, end, html }. Non-overlapping. */
export function findElements(html, openRe) {
  const out = [];
  const re = new RegExp(openRe.source, openRe.flags.includes('g') ? openRe.flags : openRe.flags + 'g');
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    const end = elementEnd(html, m.index, tag);
    out.push({ start: m.index, end, html: html.slice(m.index, end), match: m });
    re.lastIndex = end;
  }
  return out;
}

/* Inner HTML of an element string (drops its own open and close tag). */
export function innerOf(elHtml) {
  return String(elHtml || '').replace(/^<[^>]*>/, '').replace(/<\/[a-zA-Z][a-zA-Z0-9]*>\s*$/, '');
}

/* Attribute value of an opening tag (double, single or unquoted). */
export function attrOf(tag, name) {
  const m = new RegExp('(?:^|\\s)' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i').exec(tag || '');
  return m ? (m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]) : null;
}

/* Deterministic sha256 of a string or buffer (hex). */
export const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

/* QA round 1 (PERF-12): a conservative CSS minifier for the one shipped stylesheet. Outside strings only: comments are
   dropped, whitespace runs become one space, and the whitespace next to { } ; (never significant) is removed. Strings
   (content, url() data URIs, grid areas) are copied verbatim. tmp/wf6/fix/p15-cssom.mjs proves the minified sheet
   parses to the same CSSOM rule list as the unminified one. */
const BACKSLASH = String.fromCharCode(92);
export function minifyCss(css) {
  const pass = (src, onChar) => {
    let out = '', i = 0;
    while (i < src.length) {
      const c = src[i];
      if (c === '"' || c === "'") { let j = i + 1; while (j < src.length && src[j] !== c) { if (src[j] === BACKSLASH) j++; j++; } out += src.slice(i, j + 1); i = j + 1; continue; }
      const r = onChar(src, i, out);
      out = r.out; i = r.i;
    }
    return out;
  };
  const a = pass(String(css), (s, i, out) => {
    if (s[i] === '/' && s[i + 1] === '*') { const j = s.indexOf('*/', i + 2); return { out: out && !/\s$/.test(out) ? out + ' ' : out, i: j < 0 ? s.length : j + 2 }; }
    if (/\s/.test(s[i])) { let j = i; while (j < s.length && /\s/.test(s[j])) j++; return { out: out + ' ', i: j }; }
    return { out: out + s[i], i: i + 1 };
  });
  /* a space is dropped after { } ; , : > and before { } ; > (a space BEFORE a colon is kept: ".a :hover" is a descendant
     selector; "+" and "-" keep their spaces: calc() needs them) */
  const b = pass(a, (s, i, out) => {
    if (s[i] === ' ') { const prev = out[out.length - 1], next = s[i + 1]; if (prev === undefined || '{};,:>'.includes(prev) || (next !== undefined && '{};>'.includes(next))) return { out, i: i + 1 }; }
    return { out: out + s[i], i: i + 1 };
  });
  /* QA round 1 fix-2: and the last semicolon of every block (";}" outside strings is "}" in any CSS context), 879 bytes
     on this sheet; the same CSSOM rule list (tmp/wf6/fix2/p/cssom-eq.mjs) */
  return pass(b, (s, i, out) => (s[i] === ';' && s[i + 1] === '}' ? { out, i: i + 1 } : { out: out + s[i], i: i + 1 })).trim();
}

/* QA round 1 (PERF-12, DESIGN-SPEC 7 JS budget): the shipped script without its full-line comments and indentation. Only a line whose
   first non-blank characters are // or /* is touched (in a script with no template literals and no multi-line strings,
   such a line can only be a comment); comments after code on a line stay. The caller fails the build when the result
   does not compile (node:vm Script) or when the source holds a template literal (this rule would no longer be safe). */
export function stripJsLineComments(js) {
  const out = [];
  let inBlock = false;
  for (const line of String(js).split('\n')) {
    if (inBlock) { const e = line.indexOf('*/'); if (e < 0) continue; inBlock = false; const rest = line.slice(e + 2); if (rest.trim()) out.push(rest); continue; }
    const t = line.trimStart();
    if (t.startsWith('//')) continue;
    if (t.startsWith('/*')) { const e = t.indexOf('*/', 2); if (e < 0) { inBlock = true; continue; } const rest = t.slice(e + 2); if (rest.trim()) out.push(line.slice(0, line.length - t.length) + rest.trimStart()); continue; }
    out.push(line);
  }
  /* and the leading indentation of every line (never significant in a script without template literals or multi-line
     strings), and blank lines */
  return out.map((l) => l.trimStart()).filter((l) => l.length).join('\n');
}
