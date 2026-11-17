import { photoUrl } from '../lib/supabase.js';
import { RAW } from './raw.js';

const BR = { f296: 'Ferrari', p911: 'Porsche', m4: 'BMW', amg: 'Mercedes-AMG', supra: 'Toyota', r8: 'Audi', huracan: 'Lamborghini', m720s: 'McLaren' };

// داده‌ی پشتیبان: اگر Supabase در دسترس نباشد، سایت همین فهرست را نشان می‌دهد
export const FALLBACK = RAW.map(c => ({ ...c, br: BR[c.id], photos: [], frames: [] }));
const ORDER = FALLBACK.map(c => c.id);

const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };

// ردیف جدول cars در Supabase را به شکل کوتاه مورد استفاده‌ی رابط تبدیل می‌کند
export const fromRow = r => {
  const s = r.specs || {};
  return {
    id: r.id, n: r.name || r.id, tg: s.tagline || '', c: r.category || '',
    p: num(r.price), hp: num(s.hp), s: num(s.zero_to_100), t: num(s.top_speed),
    e: s.engine || '', y: num(s.year), seats: num(s.seats), d: r.description || '', br: s.brand || '',
    photos: (r.photos || []).map(photoUrl),
    frames: (r.frames || []).map(photoUrl),
    created: r.created_at || ''
  };
};

// خودروهای اصلی به همان ترتیب قبلی؛ خودروهای جدید بر اساس زمان ساخت
export const sortCars = list => {
  const rank = id => { const i = ORDER.indexOf(id); return i < 0 ? 1000 : i; };
  return [...list].sort((a, b) => rank(a.id) - rank(b.id) || String(a.created).localeCompare(String(b.created)));
};
