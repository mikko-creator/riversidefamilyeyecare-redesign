/* images.mjs - web-ready copies of every image the build ships.
   Forked unchanged in mechanism from the reference build (R) src/lib/images.mjs (PORT-NOTES 2.5: KEEP):
   JPEG/PNG -> WebP via cwebp (on PATH, or $CWEBP), capped to a max width for its role, cached by
   content hash + settings so a rebuild re-encodes nothing and two builds produce identical bytes.
   Generated images get their AI provenance label (IPTC DigitalSourceType trainedAlgorithmicMedia,
   CreatorTool, description) written back as an XMP chunk with webpmux; the label is part of the cache key, so a
   changed label is a new file (DESIGN-SPEC 4.3 P7). `lossless` copies a file byte-for-byte (never re-encoded; P3:
   the practice logos); GIFs and SVGs ship as-is.
   wf5b additions (DESIGN-SPEC 4.3): `crop` cuts a rectangle of the source before any resize (cwebp -crop; the home
   hero's 4:3 crop, P1) and is part of the cache key; `variants()` returns the P1 width set 360/540/720/1080/1440/1920/
   2400, each capped at the intrinsic (or cropped) width, reusing the main encode where it has that width; `stat`
   files an encode under its own counters so the source images' encoded/cached numbers keep their meaning. Every key
   an earlier build made is unchanged (a key gains a part only when crop or alphaQ is set). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { imageSize } from './util.mjs';

const CWEBP = process.env.CWEBP || 'cwebp';
let encoderOk = null;
function hasEncoder() {
  if (encoderOk === null) {
    const r = spawnSync(CWEBP, ['-version'], { encoding: 'utf8' });
    encoderOk = r.status === 0;
  }
  return encoderOk;
}

export function createImages({ cacheDir, stats }) {
  fs.mkdirSync(cacheDir, { recursive: true });
  /* The file's real format, from its first bytes - an extension is a claim, not evidence
     (this harvest holds a GIF named .png: Cibalogo.png). */
  function sniff(b) {
    if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8) return '.jpg';
    if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return '.png';
    if (b.slice(0, 3).toString('latin1') === 'GIF') return '.gif';
    if (b.slice(0, 4).toString('latin1') === 'RIFF' && b.slice(8, 12).toString('latin1') === 'WEBP') return '.webp';
    if (/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/i.test(b.slice(0, 400).toString('utf8'))) return '.svg';
    return null;
  }
  function xmpPacket(label) {
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
      + '<rdf:Description rdf:about="" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/">'
      + '<Iptc4xmpExt:DigitalSourceType>http://cv.iptc.org/newscodes/digitalsourcetype/' + esc(label.sourceType || 'trainedAlgorithmicMedia') + '</Iptc4xmpExt:DigitalSourceType>'
      + '<xmp:CreatorTool>' + esc(label.tool) + '</xmp:CreatorTool>'
      + '<dc:description><rdf:Alt><rdf:li xml:lang="x-default">' + esc(label.description) + '</rdf:li></rdf:Alt></dc:description>'
      + '</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>';
  }
  /* Returns { rel, w, h, webp } (rel = file name inside the cache dir) or null when not an image.
     crop = { x, y, w, h } (source pixels, applied before the resize); stat = the stats prefix of this encode
     ('' -> encoded / cached, as before; 'variants' -> variantsEncoded / variantsCached; ...) */
  function web(srcAbs, { maxW = 1600, q = 80, name, aiLabel = null, lossless = false, alphaQ = 90, crop = null, stat = '' } = {}) {
    const meta = aiLabel ? 'ai:' + JSON.stringify(aiLabel) : 'none';
    const bytes = fs.readFileSync(srcAbs);
    const ext = sniff(bytes);
    if (!ext) return null;
    const dim = imageSize(srcAbs);
    const base = (name || path.basename(srcAbs, path.extname(srcAbs))).replace(/[^a-z0-9._-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'img';
    const convertible = (ext === '.jpg' || ext === '.png') && hasEncoder() && !lossless;
    if (!convertible) {
      if (crop) throw new Error('a crop needs a JPEG or PNG source and cwebp: ' + srcAbs);
      if (aiLabel) throw new Error('an AI label needs a WebP encode (cwebp + webpmux): ' + srcAbs);
      if ((ext === '.jpg' || ext === '.png') && !lossless) stats.encoderMissing = (stats.encoderMissing || 0) + 1;
      const key = crypto.createHash('sha1').update(bytes).digest('hex').slice(0, 10);
      const rel = base + '.' + key + ext;
      const out = path.join(cacheDir, rel);
      if (!fs.existsSync(out)) fs.writeFileSync(out, bytes);
      if (lossless) stats.copiedLossless = (stats.copiedLossless || 0) + 1;
      return { rel, w: dim && dim.w, h: dim && dim.h, webp: false };
    }
    if (crop && (!dim || !(crop.x >= 0 && crop.y >= 0 && crop.w > 0 && crop.h > 0 && crop.x + crop.w <= dim.w && crop.y + crop.h <= dim.h))) throw new Error('crop ' + JSON.stringify(crop) + ' is outside ' + srcAbs + ' (' + (dim ? dim.w + 'x' + dim.h : '?') + ')');
    const key = crypto.createHash('sha1').update(bytes).update('|' + maxW + '|' + q + '|' + meta + (alphaQ !== 90 ? '|aq' + alphaQ : '') + (crop ? '|crop' + [crop.x, crop.y, crop.w, crop.h].join(',') : '')).digest('hex').slice(0, 10);
    const rel = base + '.' + key + '.webp';
    const out = path.join(cacheDir, rel);
    const bump = (k) => { const n = stat ? stat + k[0].toUpperCase() + k.slice(1) : k; stats[n] = (stats[n] || 0) + 1; };
    if (!fs.existsSync(out)) {
      const argv = ['-quiet', '-q', String(q), '-m', '6', '-metadata', 'none'];
      if (ext === '.png') argv.push('-exact', '-alpha_q', String(alphaQ));
      let input = srcAbs;
      /* cwebp picks its decoder from the file NAME on Windows (WIC); a mislabelled source goes via a correctly named temp copy */
      if (path.extname(srcAbs).toLowerCase().replace('jpeg', 'jpg') !== ext) {
        input = path.join(cacheDir, '.sniffed-' + key + ext);
        fs.writeFileSync(input, bytes);
      }
      /* cwebp crops first, then resizes ("-resize ... after any cropping") */
      if (crop) argv.push('-crop', String(crop.x), String(crop.y), String(crop.w), String(crop.h));
      const srcW = crop ? crop.w : dim && dim.w;
      if (srcW && srcW > maxW) argv.push('-resize', String(maxW), '0');
      const tmpOut = out + '.part.webp';
      argv.push(input, '-o', tmpOut);
      const r = spawnSync(CWEBP, argv, { encoding: 'utf8' });
      if (r.status !== 0 || !fs.existsSync(tmpOut)) throw new Error('cwebp failed for ' + srcAbs + ': ' + (r.stderr || r.stdout));
      if (aiLabel) {
        const x = path.join(cacheDir, '.xmp-' + key + '.xml');
        const tmp = out + '.xmp.webp';
        fs.writeFileSync(x, xmpPacket(aiLabel));
        const mux = spawnSync(process.env.WEBPMUX || 'webpmux', ['-set', 'xmp', x, tmpOut, '-o', tmp], { encoding: 'utf8' });
        if (mux.status !== 0 || !fs.existsSync(tmp)) throw new Error('webpmux failed for ' + out + ': ' + (mux.stderr || mux.stdout));
        fs.unlinkSync(tmpOut);
        fs.renameSync(tmp, out);
        fs.unlinkSync(x);
        stats.aiLabelled = (stats.aiLabelled || 0) + 1;
      } else fs.renameSync(tmpOut, out);
      if (input !== srcAbs) fs.unlinkSync(input);
      bump('encoded');
    } else bump('cached');
    const d = imageSize(out);
    return { rel, w: d && d.w, h: d && d.h, webp: true };
  }

  /* DESIGN-SPEC 4.3 P1: the srcset widths. Each is capped at the intrinsic width of the source (of the crop, when
     cropped), so an image is never upscaled and its own full width is always offered; duplicates collapse. */
  const VARIANT_WIDTHS = [360, 540, 720, 1080, 1440, 1920, 2400];
  function variantWidths(intrinsicW) { return [...new Set(VARIANT_WIDTHS.map((w) => Math.min(w, intrinsicW)))].sort((a, b) => a - b); }
  /* The width variants of one source image, ascending: [{ rel, w, h }]. `main` is the encode already made for the
     model's `url`; a variant of the same width IS that file (no duplicate encode). A file that is never re-encoded
     (lossless copies, GIFs, SVGs) has one variant: itself. Options as web() (q, name, aiLabel, crop, alphaQ). */
  function variants(srcAbs, main, { q = 80, name, aiLabel = null, crop = null, alphaQ = 90, stat = 'variants' } = {}) {
    if (!main) return [];
    if (!main.webp) return [{ rel: main.rel, w: main.w, h: main.h }];
    const dim = imageSize(srcAbs);
    const intrinsic = crop ? crop.w : dim && dim.w;
    if (!intrinsic) return [{ rel: main.rel, w: main.w, h: main.h }];
    return variantWidths(intrinsic).map((w) => {
      if (w === main.w) return { rel: main.rel, w: main.w, h: main.h };
      const v = web(srcAbs, { maxW: w, q, name, aiLabel, crop, alphaQ, stat });
      if (!v || v.w !== w) throw new Error('variant ' + w + ' of ' + srcAbs + ' came out ' + (v ? v.w : 'missing'));
      return { rel: v.rel, w: v.w, h: v.h };
    });
  }
  return { web, variants, variantWidths, hasEncoder, sniff };
}
