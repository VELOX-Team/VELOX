import { html, useState, useEffect } from '../lib/html.js';
import { SB, BUCKET, photoUrl } from '../lib/supabase.js';
import { fmt, money, nd, dec, CATS, OFF } from '../lib/utils.js';
import { Ic } from '../components/Icon.js';
import { toBlob } from '../lib/image.js';

/*
  صفحه‌ی مدیریت (فقط برای کارفرما).
  نکته‌ی امنیتی: مخفی‌بودن این صفحه محافظت واقعی نیست. محافظت واقعی با قوانین RLS در Supabase است:
  فقط کاربری که در جدول admins ثبت شده باشد می‌تواند در جدول cars یا bucket به نام car-images بنویسد.
*/

const ID_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;
const EMPTY = { id: '', name: '', brand: '', category: CATS[0], price: '', hp: '', zero_to_100: '', top_speed: '', engine: '', year: '', seats: '', tagline: '', description: '', published: true };

const toForm = r => {
  const s = r.specs || {};
  const v = x => (x === undefined || x === null ? '' : String(x));
  return {
    id: r.id, name: r.name || '', brand: s.brand || '', category: r.category || CATS[0], price: v(r.price),
    hp: v(s.hp), zero_to_100: v(s.zero_to_100), top_speed: v(s.top_speed), engine: s.engine || '',
    year: v(s.year), seats: v(s.seats), tagline: s.tagline || '', description: r.description || '', published: r.published !== false
  };
};

const inRange = (v, a, b, int) => {
  const n = Number(v);
  return v !== '' && Number.isFinite(n) && n >= a && n <= b && (!int || Number.isInteger(n));
};

const validate = (f, isNew) => {
  const e = {};
  if (isNew && !ID_RE.test(f.id)) e.id = 'شناسه فقط شامل حروف کوچک انگلیسی، عدد و خط تیره باشد (۲ تا ۴۰ کاراکتر).';
  if (f.name.trim().length < 2) e.name = 'نام خودرو را وارد کنید.';
  if (!f.brand.trim()) e.brand = 'برند را وارد کنید.';
  if (!CATS.includes(f.category)) e.category = 'دسته را انتخاب کنید.';
  if (!inRange(f.price, 1, 100000000000, true)) e.price = 'قیمت را به‌صورت عدد (دلار) وارد کنید.';
  if (!inRange(f.hp, 1, 5000, true)) e.hp = 'قدرت (اسب‌بخار) را به‌صورت عدد وارد کنید.';
  if (!inRange(f.zero_to_100, 0.5, 60, false)) e.zero_to_100 = 'شتاب ۰–۱۰۰ را به ثانیه وارد کنید (مثلاً 3.5).';
  if (!inRange(f.top_speed, 50, 600, true)) e.top_speed = 'حداکثر سرعت را به km/h وارد کنید.';
  if (!f.engine.trim()) e.engine = 'پیشرانه را وارد کنید.';
  if (!inRange(f.year, 1950, 2100, true)) e.year = 'سال ساخت درست نیست.';
  if (!inRange(f.seats, 1, 12, true)) e.seats = 'ظرفیت را به‌صورت عدد وارد کنید.';
  return e;
};

const toPayload = f => ({
  name: f.name.trim(), category: f.category, price: parseInt(f.price, 10),
  description: f.description.trim(), published: !!f.published,
  specs: {
    brand: f.brand.trim(), hp: parseInt(f.hp, 10), zero_to_100: Number(f.zero_to_100), top_speed: parseInt(f.top_speed, 10),
    engine: f.engine.trim(), year: parseInt(f.year, 10), seats: parseInt(f.seats, 10), tagline: f.tagline.trim()
  }
});

const errMsg = e => {
  const m = ((e && e.message) || '').toLowerCase(), c = e && e.code;
  if (c === '23505') return 'این شناسه قبلاً استفاده شده است.';
  if (c === '23503') return 'این خودرو در علاقه‌مندی‌های کاربران ثبت شده؛ به‌جای حذف، آن را از انتشار خارج کنید.';
  if (c === '42501' || c === 'PGRST116' || m.includes('row-level security') || m.includes('not allowed')) return 'اجازه‌ی این کار را ندارید.';
  if (m.includes('too large') || m.includes('exceeded') || m.includes('413')) return 'حجم فایل زیاد است (حداکثر ۳ مگابایت).';
  if (m.includes('fetch') || m.includes('network')) return OFF;
  return 'انجام نشد؛ دوباره تلاش کنید.';
};

const sortFiles = files => [...files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
const newPath = (id, kind) => id + '/' + (kind === 'frames' ? 'frames/' : '') + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';

export function Admin({ ctx }) {
  const { user, isAdmin, authReady, go, say, reloadCars } = ctx;
  const [rows, setRows] = useState(null);
  const [loadErr, setLoadErr] = useState('');
  const [ed, setEd] = useState(null); // { isNew, id, form, errs }
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const r = await SB.from('cars').select('*').order('created_at', { ascending: true });
      if (r.error) { setLoadErr('خواندن فهرست خودروها ممکن نشد.'); setRows([]); return; }
      setLoadErr(''); setRows(r.data || []);
    } catch (e) { setLoadErr(OFF); setRows([]); }
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const refresh = async () => { await load(); reloadCars(); };
  const run = async fn => {
    if (busy) return;
    setBusy(true);
    try { await fn(); } catch (e) { say(errMsg(e)); }
    setBusy(false);
  };

  // ---------- دسترسی ----------
  const shell = inner => html`<div class="page"><div class="wrap">${inner}</div></div>`;
  if (!authReady || (user && isAdmin === null)) return shell(html`<p class="muted" role="status">در حال بررسی دسترسی…</p>`);
  if (!user) return shell(html`<div class="auth" style=${{ textAlign: 'center' }}><h2 style=${{ marginBottom: 12 }}>برای ورود به بخش مدیریت <em>وارد شوید</em></h2><p class="muted" style=${{ marginBottom: 24 }}>این بخش فقط برای مدیر سایت است.</p><button class="btn" onClick=${() => go('login')}>ورود</button></div>`);
  if (!isAdmin) return shell(html`<div class="auth" style=${{ textAlign: 'center' }}><h2 style=${{ marginBottom: 12 }}>دسترسی <em>ندارید</em></h2><p class="muted" style=${{ marginBottom: 24 }}>این بخش فقط برای مدیر سایت است.</p><button class="btn" onClick=${() => go('home')}>بازگشت به خانه</button></div>`);

  // ---------- عملیات ----------
  const hasFrames = !!rows && rows.some(r => 'frames' in r);
  const cur = ed && !ed.isNew ? (rows || []).find(r => r.id === ed.id) : null;
  const setField = (k, v) => setEd(s => ({ ...s, form: { ...s.form, [k]: v }, errs: { ...s.errs, [k]: '' } }));
  const openNew = () => setEd({ isNew: true, id: '', form: { ...EMPTY }, errs: {} });
  const openEdit = r => { setEd({ isNew: false, id: r.id, form: toForm(r), errs: {} }); window.scrollTo(0, 0); };

  const save = () => run(async () => {
    const errs = validate(ed.form, ed.isNew);
    if (Object.keys(errs).length) { setEd(s => ({ ...s, errs })); say('موارد مشخص‌شده را اصلاح کنید.'); return; }
    const payload = toPayload(ed.form);
    if (ed.isNew) {
      const r = await SB.from('cars').insert({ id: ed.form.id, ...payload }).select('*').single();
      if (r.error) throw r.error;
      await refresh();
      setEd({ isNew: false, id: r.data.id, form: toForm(r.data), errs: {} });
      say('خودرو ساخته شد؛ حالا می‌توانید تصویر اضافه کنید.');
    } else {
      const r = await SB.from('cars').update(payload).eq('id', ed.id).select('id').single();
      if (r.error) throw r.error;
      await refresh();
      say('تغییرات ذخیره شد');
    }
  });

  const togglePub = r => run(async () => {
    const x = await SB.from('cars').update({ published: !(r.published !== false) }).eq('id', r.id).select('id').single();
    if (x.error) throw x.error;
    await refresh();
    say(r.published !== false ? 'از انتشار خارج شد' : 'منتشر شد');
  });

  const del = r => run(async () => {
    if (!window.confirm('«' + r.name + '» برای همیشه حذف شود؟')) return;
    const files = [...(r.photos || []), ...(r.frames || [])];
    const x = await SB.from('cars').delete().eq('id', r.id).select('id');
    if (x.error) throw x.error;
    if (!x.data || !x.data.length) { say('اجازه‌ی حذف ندارید.'); return; }
    if (files.length) SB.storage.from(BUCKET).remove(files).then(() => {}, () => {});
    if (ed && ed.id === r.id) setEd(null);
    await refresh();
    say('حذف شد');
  });

  const uploadAll = async (id, kind, files) => {
    const list = sortFiles(files), paths = [], max = kind === 'frames' ? 1280 : 1800;
    try {
      for (let k = 0; k < list.length; k++) {
        say('در حال بارگذاری ' + fmt(k + 1) + ' از ' + fmt(list.length) + '…');
        const b = await toBlob(list[k], max);
        if (!b) continue;
        const p = newPath(id, kind);
        const r = await SB.storage.from(BUCKET).upload(p, b, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });
        if (r.error) throw r.error;
        paths.push(p);
      }
    } catch (e) {
      if (paths.length) SB.storage.from(BUCKET).remove(paths).then(() => {}, () => {});
      throw e;
    }
    if (!paths.length) throw new Error('invalid image');
    return paths;
  };

  const setMedia = async (r, kind, next, drop) => {
    const x = await SB.from('cars').update({ [kind]: next }).eq('id', r.id).select('id').single();
    if (x.error) throw x.error;
    if (drop && drop.length) SB.storage.from(BUCKET).remove(drop).then(() => {}, () => {});
    await refresh();
  };

  const addMedia = (r, kind, files) => { if (!files || !files.length) return; run(async () => {
    const paths = await uploadAll(r.id, kind, files);
    const old = r[kind] || [];
    if (kind === 'frames') await setMedia(r, kind, paths, old); else await setMedia(r, kind, [...old, ...paths], []);
    say(fmt(paths.length) + ' تصویر ذخیره شد');
  }); };
  const delMedia = (r, kind, i) => run(async () => {
    const old = r[kind] || [];
    await setMedia(r, kind, old.filter((_, k) => k !== i), [old[i]]);
    say('حذف شد');
  });
  const clearMedia = (r, kind) => run(async () => {
    if (!window.confirm('همه‌ی تصویرها حذف شوند؟')) return;
    await setMedia(r, kind, [], r[kind] || []);
    say('حذف شد');
  });
  const replaceMedia = (r, kind, i, file) => { if (!file) return; run(async () => {
    const [p] = await uploadAll(r.id, kind, [file]);
    const old = r[kind] || [], next = old.slice(); next[i] = p;
    await setMedia(r, kind, next, [old[i]]);
    say('جایگزین شد');
  }); };
  const cover = (r, i) => run(async () => {
    const old = r.photos || [], next = [old[i], ...old.filter((_, k) => k !== i)];
    await setMedia(r, 'photos', next, []);
    say('به‌عنوان تصویر اصلی انتخاب شد');
  });

  // ---------- رابط ----------
  const F = (k, label, o = {}) => html`<div class=${'fld' + (ed.errs[k] ? ' bad' : '')} key=${k}><label for=${'ad-' + k}>${label}</label>
    ${o.area ? html`<textarea id=${'ad-' + k} rows="4" maxlength="2000" value=${ed.form[k]} onChange=${e => setField(k, e.target.value)}></textarea>`
    : html`<input id=${'ad-' + k} type="text" inputmode=${o.mode || 'text'} maxlength=${o.max || 80} value=${ed.form[k]} disabled=${!!o.disabled} onChange=${e => setField(k, o.num ? nd(e.target.value) : o.dec ? dec(e.target.value) : o.id ? e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') : e.target.value)} style=${o.ltr ? { direction: 'ltr', textAlign: 'left' } : null}/>`}
    ${ed.errs[k] ? html`<div class="err" role="alert">${ed.errs[k]}</div>` : o.hint ? html`<div class="hint">${o.hint}</div>` : null}</div>`;

  const thumbs = (r, kind) => html`<div class="mth">${(r[kind] || []).map((p, i) => html`<span class="mtb" key=${p}><img src=${photoUrl(p)} alt=""/>
    <button type="button" aria-label="حذف تصویر" disabled=${busy} onClick=${() => delMedia(r, kind, i)}>✕</button>
    <label aria-label="جایگزینی تصویر">⟳<input type="file" accept="image/*" hidden onChange=${e => { replaceMedia(r, kind, i, e.target.files[0]); e.target.value = ''; }}/></label>
    ${kind === 'photos' && i > 0 ? html`<button type="button" class="cv" aria-label="انتخاب به‌عنوان تصویر اصلی" disabled=${busy} onClick=${() => cover(r, i)}>★</button>` : null}</span>`)}</div>`;

  const mediaBlock = (r, kind, title, note) => html`<div class="amed"><div class="muted">${title} · ${fmt((r[kind] || []).length)}</div>${note ? html`<div class="hint" style=${{ color: '#8c8a84', fontSize: 12.5 }}>${note}</div>` : null}${thumbs(r, kind)}
    <label class="btn ghost sm"><${Ic} n="plus"/>${kind === 'frames' && (r.frames || []).length ? 'جایگزینی فریم‌ها' : 'افزودن تصویر'}<input type="file" accept="image/*" multiple hidden onChange=${e => { addMedia(r, kind, e.target.files); e.target.value = ''; }}/></label>
    ${(r[kind] || []).length ? html` <button class="rm" disabled=${busy} onClick=${() => clearMedia(r, kind)}>حذف همه</button>` : null}</div>`;

  const editor = ed ? html`<div class="auth adm-ed"><div class="eyebrow">${ed.isNew ? 'New car' : 'Edit car'}</div>
    <h2 style=${{ margin: '6px 0 22px' }}>${ed.isNew ? html`افزودن <em>خودرو</em>` : html`ویرایش <em>${ed.form.name || ed.id}</em>`}</h2>
    <div class="agrid">
      ${F('id', 'شناسه (انگلیسی، یک‌بار تعیین می‌شود)', { ltr: true, id: true, max: 40, disabled: !ed.isNew, hint: 'مثال: huracan یا bmw-m4' })}
      ${F('name', 'نام خودرو', { max: 80, ltr: true })}
      ${F('brand', 'برند', { max: 40, ltr: true })}
      <div class=${'fld' + (ed.errs.category ? ' bad' : '')}><label for="ad-category">دسته</label><select id="ad-category" value=${ed.form.category} onChange=${e => setField('category', e.target.value)}>${CATS.map(c => html`<option key=${c} value=${c}>${c}</option>`)}</select></div>
      ${F('price', 'قیمت ($)', { num: true, mode: 'numeric', max: 12, ltr: true })}
      ${F('hp', 'قدرت (hp)', { num: true, mode: 'numeric', max: 4, ltr: true })}
      ${F('zero_to_100', 'شتاب ۰–۱۰۰ (ثانیه)', { dec: true, mode: 'decimal', max: 5, ltr: true })}
      ${F('top_speed', 'حداکثر سرعت (km/h)', { num: true, mode: 'numeric', max: 3, ltr: true })}
      ${F('year', 'سال ساخت', { num: true, mode: 'numeric', max: 4, ltr: true })}
      ${F('seats', 'ظرفیت (نفر)', { num: true, mode: 'numeric', max: 2, ltr: true })}
    </div>
    ${F('engine', 'پیشرانه')}
    ${F('tagline', 'شعار کوتاه (انگلیسی)', { ltr: true })}
    ${F('description', 'توضیحات', { area: true })}
    <div class="fld"><label class="chk"><input type="checkbox" checked=${ed.form.published} onChange=${e => setField('published', e.target.checked)}/><span>این خودرو در سایت نمایش داده شود</span></label></div>
    <div class="aact2"><button class="btn" disabled=${busy} onClick=${save}>${ed.isNew ? 'ساخت خودرو' : 'ذخیره تغییرات'}</button><button class="btn ghost" disabled=${busy} onClick=${() => setEd(null)}>بستن</button></div>
    ${cur ? html`<div class="amedia"><h3>تصاویر</h3>
      <p class="muted">اولین تصویر روی کارت و صفحه‌ی اصلی نمایش داده می‌شود. با ★ هر تصویر را اصلی کنید. فرمت JPG، PNG یا WebP؛ عکس‌ها خودکار کوچک می‌شوند. فقط عکس‌هایی را بارگذاری کنید که حق استفاده از آن‌ها را دارید.</p>
      ${mediaBlock(cur, 'photos', 'تصاویر اصلی')}
      ${hasFrames ? mediaBlock(cur, 'frames', 'فریم‌های ۳۶۰°', '۲۴ تا ۷۲ عکس از دور تا دور خودرو با فاصله‌ی زاویه‌ی برابر؛ فایل‌ها را شماره‌گذاری کنید (۰۱، ۰۲، …).')
        : html`<p class="muted">برای فعال‌شدن نمای ۳۶۰°، ستون frames باید در جدول cars ساخته شود (SQL در راهنمای تحویل پروژه آمده است).</p>`}</div>`
      : ed.isNew ? html`<p class="muted" style=${{ marginTop: 18 }}>بعد از ساخت خودرو، بخش بارگذاری تصویر باز می‌شود.</p>` : null}</div>` : null;

  return html`<div class="page"><div class="wrap">
    <div class="head" style=${{ marginBottom: 20 }}><div><div class="eyebrow">Admin</div><h2 style=${{ marginTop: 6, fontSize: 34 }}>مدیریت <em>خودروها</em></h2>
      <p class="muted">${user.email} · دسترسی مدیر فعال است</p></div>
      <button class="btn" disabled=${busy} onClick=${openNew}><${Ic} n="plus"/>افزودن خودرو</button></div>
    ${loadErr ? html`<div class="empty" role="alert" style=${{ marginBottom: 20, padding: 24 }}>${loadErr}</div>` : null}
    ${editor}
    ${rows === null ? html`<p class="muted" role="status">در حال بارگذاری…</p>` : null}
    ${rows && !rows.length && !loadErr ? html`<div class="empty">هنوز خودرویی ثبت نشده است.</div>` : null}
    <div class="alist">${(rows || []).map(r => html`<div class="arow" key=${r.id}>
      <div><b>${r.name}</b><div class="muted">${r.id} · ${r.category} · ${money(r.price || 0)} · ${r.published !== false ? 'منتشرشده' : 'پیش‌نویس (مخفی)'} · ${fmt((r.photos || []).length)} تصویر</div></div>
      <div class="aact"><button class="btn ghost sm" disabled=${busy} onClick=${() => openEdit(r)}>ویرایش</button>
        <button class="btn ghost sm" disabled=${busy} onClick=${() => togglePub(r)}>${r.published !== false ? 'مخفی‌کردن' : 'انتشار'}</button>
        <button class="rm" disabled=${busy} onClick=${() => del(r)}>حذف</button></div></div>`)}</div>
  </div></div>`;
}
