/* forms.mjs - rebuild the two Gravity Forms field-for-field from the SOURCE markup, as INERT forms.

   Forked from the reference build (R) src/lib/forms.mjs (PORT-NOTES 2.2). Kept: the per-field parse of
   li.gfield (every label, sub-label, description, required mark, option and placeholder is the source's own),
   the honeypot + Akismet drop, the conditional-logic reader, the COMPONENTS E markup and ids.
   Riverside changes (FM-1):
   - NEW `select` branch: "Reason for Appointment" renders as a <select> with its 5 source options verbatim.
   - NEW `date` branch: "Date of Birth" keeps its placeholder (mm/dd/yyyy) and its screen-reader format hint
     ("MM slash DD slash YYYY") as visually hidden text bound by aria-describedby, as the source has it.
   - NEW `captcha` branch: the invisible reCAPTCHA (data-size="invisible", a site key of the platform's account)
     is platform plumbing; it is NEVER rendered (no visible "CAPTCHA" box) and is declared in
     audit/clone-removals.json.
   - The form is inert: no action, no mailto:, and data-needs-backend="form endpoint" names what is missing. No
     notice sentence is authored (chrome.json `notice` is null: an open decision, docs/OPEN-DECISIONS.md); a notice
     renders only if chrome.json ever supplies one.
   - QA round 1 (wf6, CONTENT-1): method="dialog", not "post". A post with no action sent every field to the page's
     own URL and reloaded it empty (verified on the snapshot: one POST of all fields, 0 values left). A "dialog" form
     outside a <dialog> still runs the browser's constraint validation and fires `submit`, then does nothing (HTML
     form submission algorithm): no request, no navigation, every typed value stays, with or without JavaScript.
     site.js also cancels `submit` on these forms (older browsers read an unknown method as GET). Connecting an
     endpoint later means setting action and method here (docs/DEPLOY.md, Forms). */
import { esc, decodeEntities, plain, findElements, attrOf } from './util.mjs';

const openTag = (html) => (/^<[^>]*>/.exec(html) || [''])[0];
/* label text without the required-asterisk spans */
const labelText = (inner) => plain(String(inner || '').replace(/<span class="gfield_required[\s\S]*?<\/span>\s*<\/span>|<span class="gfield_required[^"]*"[^>]*>\*<\/span>/gi, ''));
const lastNum = (id) => (String(id || '').match(/_(\d+)$/) || [])[1] || '';

/* Returns { id, fields: [...], submit, dropped: [...] } or null. Field kinds: note, text, email, tel, number,
   textarea, radio, checkbox, name, time, select, date. `dropped` lists the platform fields not carried. */
export function parseGravityForm(wrapperHtml) {
  const formTag = /<form\b[^>]*>/i.exec(wrapperHtml);
  if (!formTag) return null;
  const id = attrOf(formTag[0], 'id') || 'gform';
  const submit = /<input\b[^>]*type=['"]submit['"][^>]*>/i.exec(wrapperHtml);
  const fields = [];
  const dropped = [];
  for (const li of findElements(wrapperHtml, /<(li)\b[^>]*class="gfield\b[^"]*"[^>]*>/gi)) {
    const cls = attrOf(openTag(li.html), 'class') || '';
    const labelM = /<label class='gfield_label[^']*'[^>]*>([\s\S]*?)<\/label>/i.exec(li.html) || /<label class="gfield_label[^"]*"[^>]*>([\s\S]*?)<\/label>/i.exec(li.html);
    const label = labelM ? labelText(labelM[1]) : '';
    if (/gform_validation_container|gfield--type-honeypot/.test(cls)) {
      const d = /<div class='gfield_description'[^>]*>([\s\S]*?)<\/div>/i.exec(li.html);
      dropped.push({ kind: 'honeypot', label, description: d ? plain(d[1]) : '' });
      continue;
    }
    const type = (/gfield--type-([a-z]+)/.exec(cls) || [])[1] || 'text';
    if (type === 'captcha') {
      const box = /<div\b[^>]*class='[^']*ginput_recaptcha[^']*'[^>]*>/i.exec(li.html);
      dropped.push({ kind: 'captcha', label, size: box ? attrOf(box[0], 'data-size') : null });
      continue;
    }
    const gfId = lastNum(attrOf(openTag(li.html), 'id')) || String(fields.length + 1);
    const required = /gfield_contains_required/.test(cls);
    const descM = /<div class='gfield_description'[^>]*>([\s\S]*?)<\/div>/i.exec(li.html);
    const description = descM ? descM[1].trim() : '';
    if (type === 'html') {
      /* an HTML field is copy: keep its paragraphs */
      const inner = li.html.replace(/^<li\b[^>]*>/i, '').replace(/<\/li>$/i, '');
      const paras = inner.split(/<\/?p\b[^>]*>/i).map((x) => x.trim()).filter((x) => plain(x));
      fields.push({ kind: 'note', paras, gfId });
      continue;
    }
    if (type === 'radio' || type === 'checkbox') {
      const options = [...li.html.matchAll(/<input\b([^>]*type='(?:radio|checkbox)'[^>]*)\/?>\s*<label\b[^>]*>([\s\S]*?)<\/label>/gi)].map((m) => ({ value: decodeEntities(attrOf(m[1], 'value') || ''), label: plain(m[2]) }));
      fields.push({ kind: type, label, required, description, options, gfId });
      continue;
    }
    if (type === 'select' || type === 'multiselect') {
      const sel = /<select\b([^>]*)>([\s\S]*?)<\/select>/i.exec(li.html);
      const options = sel ? [...sel[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)].map((m) => ({ value: decodeEntities(attrOf(m[1], 'value') || ''), label: plain(m[2]), selected: /\sselected\b/i.test(m[1]) })) : [];
      fields.push({ kind: 'select', multiple: type === 'multiselect', label, required, description, options, gfId });
      continue;
    }
    if (type === 'date') {
      const input = /<input\b([^>]*)>/i.exec(li.html);
      const hint = /<span\b[^>]*class='screen-reader-text'[^>]*>([\s\S]*?)<\/span>/i.exec(li.html);
      fields.push({ kind: 'date', label, required, description, gfId, placeholder: input ? decodeEntities(attrOf(input[1], 'placeholder') || '') : '', formatHint: hint ? plain(hint[1]) : '' });
      continue;
    }
    if (type === 'name') {
      const parts = [...li.html.matchAll(/<input\b([^>]*)\/?>\s*<label\b[^>]*>([\s\S]*?)<\/label>/gi)].map((m) => ({ sub: plain(m[2]), required: /aria-required=['"]true/.test(m[1]), gfSub: lastNum(attrOf(m[1], 'id')) }));
      fields.push({ kind: 'name', label, required, description, parts, gfId });
      continue;
    }
    if (type === 'time') {
      const hour = /<input\b([^>]*id='input_\d+_\d+_1'[^>]*)>/i.exec(li.html);
      const minute = /<input\b([^>]*id='input_\d+_\d+_2'[^>]*)>/i.exec(li.html);
      const ampm = /<select\b([^>]*)>([\s\S]*?)<\/select>/i.exec(li.html);
      const subs = [...li.html.matchAll(/<label\b[^>]*class='[^']*gform-field-label--type-sub[^']*'[^>]*>([\s\S]*?)<\/label>/gi)].map((m) => plain(m[1]));
      const num = (m, sub) => (m ? { placeholder: attrOf(m[1], 'placeholder') || '', min: attrOf(m[1], 'min'), max: attrOf(m[1], 'max'), sub, gfSub: lastNum(attrOf(m[1], 'id')) } : null);
      fields.push({
        kind: 'time', label, required, description, gfId,
        hour: num(hour, subs[0] || ''),
        minute: num(minute, subs[1] || ''),
        ampm: ampm ? { options: [...ampm[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)].map((m) => ({ value: attrOf(m[1], 'value') || '', label: plain(m[2]) })), sub: subs[2] || '', gfSub: lastNum(attrOf(ampm[1], 'id')) } : null,
      });
      continue;
    }
    const isTextarea = /<textarea\b/i.test(li.html);
    const input = /<input\b([^>]*)>/i.exec(li.html);
    const inputType = input ? (attrOf(input[1], 'type') || 'text').toLowerCase() : 'text';
    fields.push({ kind: isTextarea ? 'textarea' : (['email', 'tel', 'number'].includes(inputType) ? inputType : 'text'), label, required, description, gfId, placeholder: input ? attrOf(input[1], 'placeholder') || '' : '' });
  }
  /* the Akismet block and the hidden GF inputs are anti-spam / platform plumbing (declared) */
  if (/akismet-fields-container/.test(wrapperHtml)) dropped.push({ kind: 'akismet' });
  return { id, fields, submit: submit ? decodeEntities(attrOf(submit[0], 'value') || '') : '', dropped };
}

/* the source form's Gravity Forms conditional logic (window['gf_form_conditional_logic'][N], a script in the
   RAW page: data, not runtime) -> { gfId: { field: gfId of the controlling field, value } }. Only "show", one
   rule, operator "is" is carried; anything else is returned in `unsupported` and the build fails closed. */
export function parseConditionalLogic(raw, formId) {
  const num = String(formId || '').replace(/^gform_/, '');
  const at = String(raw).indexOf("gf_form_conditional_logic'][" + num + ']');
  const out = { rules: {}, unsupported: [] };
  if (at < 0) return out;
  const block = String(raw).slice(at, at + 20000);
  const logic = /logic:\s*\{([\s\S]*?)\},\s*dependents:/.exec(block);
  if (!logic) { out.unsupported.push('conditional logic present but not parseable'); return out; }
  for (const m of logic[1].matchAll(/(\d+):\s*(\{"field":[\s\S]*?"section":[^}]*\})/g)) {
    let rule;
    try { rule = JSON.parse(m[2]).field; } catch { out.unsupported.push('field ' + m[1] + ': unparseable rule'); continue; }
    const r = rule && rule.rules || [];
    if (!rule || rule.actionType !== 'show' || r.length !== 1 || r[0].operator !== 'is') { out.unsupported.push('field ' + m[1] + ': ' + JSON.stringify(rule).slice(0, 160)); continue; }
    out.rules[m[1]] = { field: String(r[0].fieldId), value: String(r[0].value) };
  }
  return out;
}

/* COMPONENTS E.1/E.2 markup of an inert form. `localHref(href)` relativises links inside descriptions; `icon`
   (optional) gives an icon string for the error line; `notice` is chrome.notice ({before, after}) or null;
   `phone` the practice phone; `conditional` the show-if rules. */
export function renderForm(form, { localHref, icon, notice, phone, conditional, labelledBy = 'page-title' }) {
  const fid = String(form.id || '').replace(/^gform_/, '');
  const out = [];
  const req = '<span class="field__req" aria-hidden="true">*</span>';
  const errP = (id) => '<p class="field__error" id="' + id + '-err" hidden>' + (icon ? icon('alert') : '') + '<span class="field__error-text"></span></p>';
  const fixLinks = (h) => String(h).replace(/<a\b([^>]*)>/gi, (m, attrs) => {
    const raw = decodeEntities(attrOf(attrs, 'href') || '');
    const to = localHref(raw);
    return to ? '<a href="' + esc(to) + '">' : '<a>';
  }).replace(/<a>([\s\S]*?)<\/a>/g, '$1').replace(/<(?!\/?(a|strong|em|br)\b)[^>]+>/gi, '');
  const intro = [];
  for (const f of form.fields) {
    if (f.kind === 'note') { for (const para of f.paras) intro.push('<p>' + fixLinks(para) + '</p>'); continue; }
    const id = 'f' + fid + '-' + f.gfId;
    const help = f.description ? '<p class="field__help" id="' + id + '-help">' + fixLinks(f.description) + '</p>\n' : '';
    const describedby = f.description ? ' aria-describedby="' + id + '-help"' : '';
    const r = f.required ? ' required aria-required="true"' : '';
    /* a field the source shows only for one choice carries data-show-if="{controlling name}={value}" */
    const cond = conditional && conditional[f.gfId];
    const showIf = cond ? ' data-show-if="' + esc('f' + fid + '-' + cond.field + '=' + cond.value) + '"' : '';
    if (f.kind === 'radio' || f.kind === 'checkbox') {
      out.push('<fieldset class="field field--choice"' + describedby + showIf + '>\n<legend class="field__label">' + esc(f.label) + (f.required ? req : '') + '</legend>\n'
        + f.options.map((o, i) => '<div class="choice"><input class="choice__input" type="' + f.kind + '" id="' + id + '-' + i + '" name="' + id + '" value="' + esc(o.value) + '"' + (f.required && f.kind === 'radio' ? ' required' : '') + '><label class="choice__label" for="' + id + '-' + i + '">' + esc(o.label) + '</label></div>').join('\n')
        + '\n' + help + errP(id) + '\n</fieldset>');
      continue;
    }
    if (f.kind === 'name' || f.kind === 'time') {
      const subs = [];
      if (f.kind === 'name') {
        for (const pt of f.parts) {
          const sid = id + '-' + pt.gfSub;
          subs.push('<div class="field__sub"><input class="field__control" type="text" id="' + sid + '" name="' + sid + '"' + (pt.required ? ' required aria-required="true"' : '') + ' autocomplete="' + (/first/i.test(pt.sub) ? 'given-name' : /last/i.test(pt.sub) ? 'family-name' : 'off') + '"><label class="field__sublabel" for="' + sid + '">' + esc(pt.sub) + '</label></div>');
        }
      } else {
        for (const k of ['hour', 'minute']) {
          const x = f[k]; if (!x) continue;
          const sid = id + '-' + x.gfSub;
          subs.push('<div class="field__sub"><input class="field__control" type="number" id="' + sid + '" name="' + sid + '"' + (x.min !== null ? ' min="' + esc(x.min) + '"' : '') + (x.max !== null ? ' max="' + esc(x.max) + '"' : '') + ' step="1"' + (x.placeholder ? ' placeholder="' + esc(x.placeholder) + '"' : '') + r + '><label class="field__sublabel" for="' + sid + '">' + esc(x.sub) + '</label></div>');
        }
        if (f.ampm) {
          const sid = id + '-' + f.ampm.gfSub;
          subs.push('<div class="field__sub"><select class="field__control" id="' + sid + '" name="' + sid + '"' + r + '>' + f.ampm.options.map((o) => '<option value="' + esc(o.value) + '">' + esc(o.label) + '</option>').join('') + '</select><label class="field__sublabel" for="' + sid + '">' + esc(f.ampm.sub) + '</label></div>');
        }
      }
      out.push('<fieldset class="field field--group"' + describedby + showIf + '>\n<legend class="field__label">' + esc(f.label) + (f.required ? req : '') + '</legend>\n<div class="field__row">\n' + subs.join('\n') + '\n</div>\n' + help + errP(id) + '\n</fieldset>');
      continue;
    }
    const label = '<label class="field__label" for="' + id + '">' + esc(f.label) + (f.required ? req : '') + '</label>';
    if (f.kind === 'select') {
      const control = '<select class="field__control" id="' + id + '" name="' + id + '"' + (f.multiple ? ' multiple' : '') + r + describedby + '>' + f.options.map((o) => '<option value="' + esc(o.value) + '"' + (o.selected ? ' selected' : '') + '>' + esc(o.label) + '</option>').join('') + '</select>';
      out.push('<div class="field"' + showIf + '>\n' + label + '\n' + control + '\n' + help + errP(id) + '\n</div>');
      continue;
    }
    if (f.kind === 'date') {
      const hintId = id + '-format';
      const ids = [f.formatHint ? hintId : '', f.description ? id + '-help' : ''].filter(Boolean).join(' ');
      /* QA round 1 (A11Y-12, WCAG 1.3.5): a date of birth carries its input purpose.
         Mobile optimisation (M-TOUCH-2): no inputmode. The field asks for mm/dd/yyyy (placeholder and hint), and the
         numeric keypad inputmode="numeric" opened on phones has no "/" key; the source's datepicker field had no inputmode */
      const bday = /\bbirth\b/i.test(f.label || '') ? ' autocomplete="bday"' : '';
      const control = '<input class="field__control" type="text" id="' + id + '" name="' + id + '"' + r + bday + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + (ids ? ' aria-describedby="' + ids + '"' : '') + '>';
      const hint = f.formatHint ? '<span class="field__hint sr" id="' + hintId + '">' + esc(f.formatHint) + '</span>' : '';
      out.push('<div class="field"' + showIf + '>\n' + label + '\n' + control + '\n' + hint + '\n' + help + errP(id) + '\n</div>');
      continue;
    }
    const auto = f.kind === 'email' ? ' autocomplete="email"' : f.kind === 'tel' ? ' autocomplete="tel"' : '';
    const ph = f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '';
    const control = f.kind === 'textarea'
      ? '<textarea class="field__control" id="' + id + '" name="' + id + '" rows="6"' + r + describedby + '></textarea>'
      : '<input class="field__control" type="' + f.kind + '" id="' + id + '" name="' + id + '"' + r + auto + ph + describedby + '>';
    out.push('<div class="field' + (f.kind === 'textarea' ? ' field--wide' : '') + '"' + showIf + '>\n' + label + '\n' + control + '\n' + help + errP(id) + '\n</div>');
  }
  const noticeHtml = notice && notice.before
    ? '<p class="form__notice" role="status" tabindex="-1" hidden>' + esc(notice.before) + '<a href="tel:' + esc(phone) + '">' + esc(phone) + '</a>' + esc(notice.after || '') + '</p>'
    : '';
  return [
    '<form class="form" method="dialog"' + (labelledBy ? ' aria-labelledby="' + esc(labelledBy) + '"' : '') + ' data-needs-backend="form endpoint">',
    intro.length ? '<div class="form__intro">' + intro.join('') + '</div>' : '',
    '<div class="form__grid">\n' + out.join('\n') + '\n</div>',
    '<div class="form__foot">',
    noticeHtml,
    '<button class="btn btn--primary" type="submit">' + esc(form.submit || 'Submit') + '</button>',
    '</div>',
    '</form>',
  ].filter(Boolean).join('\n');
}
