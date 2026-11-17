import { html, useState, useEffect, useMemo, useRef } from './lib/html.js';
import { SB } from './lib/supabase.js';
import { fmt, OFF, mapErr, PWOK, idClean } from './lib/utils.js';
import { FALLBACK, fromRow, sortCars } from './data/cars.js';
import { Ic } from './components/Icon.js';
import { Home } from './pages/Home.js';
import { Catalog } from './pages/Catalog.js';
import { CarPage } from './pages/CarPage.js';
import { Compare } from './pages/Compare.js';
import { Favs } from './pages/Favs.js';
import { Login } from './pages/Login.js';
import { Signup } from './pages/Signup.js';
import { Profile } from './pages/Profile.js';
import { Admin } from './pages/Admin.js';

const loadFav = () => { try { return JSON.parse(localStorage.getItem('velox-fav') || '[]'); } catch (e) { return []; } };

export function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || 'home');
  const [q, setQ] = useState(''), [cat, setCat] = useState('همه'), [sort, setSort] = useState('new');
  const [favs, setFavs] = useState(loadFav), [cmp, setCmp] = useState([]), [menu, setMenu] = useState(false), [view, setView] = useState(0), [tab, setTab] = useState(0);
  const [hs, setHs] = useState(0), [sel, setSel] = useState('f296'), [toast, setToast] = useState(''), [pick, setPick] = useState(null), [fl, setFl] = useState({ br: '', yf: '', yt: '', pmin: '', pmax: '' }), [showF, setShowF] = useState(false);
  const setF = (k, v) => setFl(f => ({ ...f, [k]: v }));
  const nF = Object.values(fl).filter(Boolean).length;
  const resetF = () => setFl({ br: '', yf: '', yt: '', pmin: '', pmax: '' });
  const say = m => { setToast(m); clearTimeout(window.__t); window.__t = setTimeout(() => setToast(''), 2600); };

  // ---- فهرست خودروها: از Supabase، و در صورت قطعی از داده‌ی پشتیبان ----
  const [CARS, setCars] = useState(FALLBACK);
  const reloadCars = async () => {
    if (!SB) return;
    try {
      const r = await SB.from('cars').select('*').eq('published', true);
      if (r.error || !r.data) return;
      setCars(sortCars(r.data.map(fromRow)));
    } catch (e) { /* همان داده‌ی پشتیبان می‌ماند */ }
  };
  useEffect(() => { reloadCars(); }, []);

  // ---- حساب کاربری ----
  const [user, setUser] = useState(null), [authReady, setAuthReady] = useState(!SB), [isAdmin, setIsAdmin] = useState(false);
  const [su, setSu] = useState({ name: '', id: '', pw: '', pw2: '', ok: false }), [suE, setSuE] = useState({}), [showPw, setShowPw] = useState(false);
  const setS = (k, v) => { setSu(x => ({ ...x, [k]: v })); setSuE(e => ({ ...e, [k]: '' })); };
  const [li, setLi] = useState({ id: '', pw: '' }), [liE, setLiE] = useState(''), [busy, setBusy] = useState(false), fails = useRef({ n: 0, until: 0 });
  const setL = (k, v) => { setLi(x => ({ ...x, [k]: v })); setLiE(''); };

  useEffect(() => {
    try { localStorage.removeItem('velox-user'); localStorage.removeItem('velox-accts'); } catch (e) { }
    if (!SB) return;
    let alive = true;
    const apply = async s => {
      const u = s && s.user;
      if (!u) { alive && setUser(null); return; }
      let name = (u.user_metadata && u.user_metadata.name) || (u.email || '').split('@')[0];
      try { const r = await SB.from('profiles').select('name').eq('id', u.id).maybeSingle(); if (r.data && r.data.name) name = r.data.name; } catch (e) { }
      alive && setUser({ id: u.id, email: u.email, name });
    };
    SB.auth.getSession().then(r => apply(r.data.session)).catch(() => { }).then(() => { alive && setAuthReady(true); });
    const { data } = SB.auth.onAuthStateChange((ev, s) => { setTimeout(() => apply(s), 0); });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  // آیا این کاربر مدیر است؟ (فقط برای نمایش رابط؛ اجازه‌ی واقعی را RLS در دیتابیس تعیین می‌کند)
  useEffect(() => {
    if (!SB || !user) { setIsAdmin(false); return; }
    let alive = true;
    setIsAdmin(null);
    SB.rpc('is_admin').then(r => { alive && setIsAdmin(!r.error && r.data === true); }, () => { alive && setIsAdmin(false); });
    return () => { alive = false; };
  }, [user && user.id]);

  useEffect(() => {
    if (!SB || !user) return;
    (async () => {
      try {
        const r = await SB.from('favorites').select('car_id'); if (r.error) return;
        const db = (r.data || []).map(x => x.car_id), local = favs.filter(id => !db.includes(id));
        if (local.length) await SB.from('favorites').upsert(local.map(id => ({ user_id: user.id, car_id: id })), { onConflict: 'user_id,car_id', ignoreDuplicates: true });
        setFavs(f => [...new Set([...f, ...db])]);
      } catch (e) { }
    })();
  }, [user && user.id]);

  const [pf, setPf] = useState({ name: '', cur: '', pw: '', pw2: '' }), [pfE, setPfE] = useState({});
  useEffect(() => { if (route === 'profile' && user) setPf({ name: user.name, cur: '', pw: '', pw2: '' }); setPfE({}); }, [route, user && user.id]);
  const setP = (k, v) => { setPf(x => ({ ...x, [k]: v })); setPfE(e => ({ ...e, [k]: '' })); };

  const go = r => { location.hash = r; };
  const logout = async () => { try { SB && await SB.auth.signOut(); } catch (err) { } setUser(null); setFavs([]); say('از حساب خارج شدید'); go('home'); };
  const saveName = async () => {
    const name = pf.name.trim(); if (name.length < 2) { setPfE({ name: 'نام خود را وارد کنید (حداقل ۲ حرف).' }); return; }
    if (!SB) { say(OFF); return; } if (busy) return; setBusy(true);
    try {
      const r = await SB.from('profiles').update({ name }).eq('id', user.id); setBusy(false);
      if (r.error) { setPfE({ name: 'ذخیره نشد؛ دوباره تلاش کنید.' }); return; }
      setUser({ ...user, name }); say('تغییرات پروفایل ذخیره شد');
    } catch (err) { setBusy(false); say(OFF); }
  };
  const changePw = async () => {
    const e = {}, f = fails.current, now = Date.now();
    if (f.until > now) { setPfE({ cur: 'تلاش ناموفق زیاد بود؛ ' + fmt(Math.ceil((f.until - now) / 1000)) + ' ثانیه دیگر دوباره تلاش کنید.' }); return; }
    if (!pf.cur) e.cur = 'رمز عبور فعلی را وارد کنید.';
    if (!PWOK(pf.pw)) e.pw = 'رمز جدید حداقل ۸ کاراکتر و شامل حرف انگلیسی و عدد باشد.';
    else if (pf.pw2 !== pf.pw) e.pw2 = 'تکرار رمز جدید با رمز جدید یکسان نیست.';
    setPfE(e); if (Object.keys(e).length) return;
    if (!SB) { say(OFF); return; } if (busy) return; setBusy(true);
    try {
      const v = await SB.auth.signInWithPassword({ email: user.email, password: pf.cur });
      if (v.error) { setBusy(false); f.n++; if (f.n >= 5) { f.n = 0; f.until = Date.now() + 30000; } setPfE({ cur: 'رمز عبور فعلی درست نیست.' }); return; }
      const r = await SB.auth.updateUser({ password: pf.pw }); setBusy(false);
      if (r.error) { setPfE({ pw: mapErr(r.error.message) }); return; }
      fails.current = { n: 0, until: 0 }; setPf(x => ({ ...x, cur: '', pw: '', pw2: '' })); setShowPw(false); say('رمز عبور تغییر کرد');
    } catch (err) { setBusy(false); say(OFF); }
  };
  const submitLi = async () => {
    const f = fails.current, now = Date.now();
    if (f.until > now) { setLiE('تلاش ناموفق زیاد بود؛ ' + fmt(Math.ceil((f.until - now) / 1000)) + ' ثانیه دیگر دوباره تلاش کنید.'); return; }
    const email = li.id.trim().toLowerCase();
    if (!email || !li.pw) { setLiE('ایمیل و رمز عبور را وارد کنید.'); return; }
    if (!SB) { setLiE(OFF); return; } if (busy) return; setBusy(true);
    try {
      const r = await SB.auth.signInWithPassword({ email, password: li.pw }); setBusy(false);
      if (r.error) { f.n++; if (f.n >= 5) { f.n = 0; f.until = Date.now() + 30000; } setLiE(mapErr(r.error.message)); return; }
      fails.current = { n: 0, until: 0 }; setLi({ id: '', pw: '' }); setShowPw(false); say('خوش آمدید'); go('home');
    } catch (err) { setBusy(false); setLiE(OFF); }
  };
  const submitSu = async () => {
    const e = {}, name = su.name.trim(), email = su.id.trim().toLowerCase();
    if (name.length < 2) e.name = 'نام خود را وارد کنید (حداقل ۲ حرف).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.id = 'یک ایمیل معتبر وارد کنید.';
    if (!PWOK(su.pw)) e.pw = 'رمز عبور حداقل ۸ کاراکتر و شامل حرف انگلیسی و عدد باشد.';
    if (su.pw2 !== su.pw) e.pw2 = 'تکرار رمز عبور با رمز عبور یکسان نیست.';
    if (!su.ok) e.ok = 'برای ادامه باید قوانین را بپذیرید.';
    setSuE(e);
    if (Object.keys(e).length) { const k = Object.keys(e)[0], el = document.getElementById('su-' + k); el && el.focus(); return; }
    if (!SB) { say(OFF); return; } if (busy) return; setBusy(true);
    try {
      const r = await SB.auth.signUp({ email, password: su.pw, options: { data: { name }, emailRedirectTo: location.origin + location.pathname } });
      setBusy(false);
      if (r.error) { setSuE({ id: mapErr(r.error.message) }); return; }
      setSu({ name: '', id: '', pw: '', pw2: '', ok: false }); setShowPw(false);
      if (r.data.session) { say('ثبت‌نام انجام شد؛ خوش آمدید ' + name); go('home'); }
      else { say('ایمیل تأیید ارسال شد؛ لینک آن را بزنید و بعد وارد شوید.'); go('login'); }
    } catch (err) { setBusy(false); say(OFF); }
  };

  // ---- مسیریابی و علاقه‌مندی‌ها و مقایسه ----
  useEffect(() => { const h = () => { setRoute(location.hash.slice(1) || 'home'); setMenu(false); setView(0); setTab(0); window.scrollTo(0, 0); }; window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h); }, []);
  useEffect(() => { try { localStorage.setItem('velox-fav', JSON.stringify(favs)); } catch (e) { } }, [favs]);
  useEffect(() => { if (route !== 'home') return; const t = setInterval(() => setHs(x => x + 1), 7000); return () => clearInterval(t); }, [route, hs]);
  const toggleFav = c => {
    const on = favs.includes(c.id); setFavs(f => on ? f.filter(x => x !== c.id) : [...f, c.id]);
    if (SB && user) { (on ? SB.from('favorites').delete().eq('user_id', user.id).eq('car_id', c.id) : SB.from('favorites').insert({ user_id: user.id, car_id: c.id })).then(() => { }, () => { }); }
    say(on ? c.n + ' از علاقه‌مندی‌ها حذف شد' : c.n + ' به علاقه‌مندی‌ها افزوده شد');
  };
  const toggleCmp = c => {
    if (cmp.includes(c.id)) { setCmp(cmp.filter(x => x !== c.id)); say(c.n + ' از مقایسه حذف شد'); }
    else if (cmp.length >= 3) say('حداکثر سه خودرو را می‌توان مقایسه کرد');
    else { setCmp([...cmp, c.id]); say(c.n + ' به مقایسه افزوده شد'); }
  };
  const startPick = back => { setPick({ back }); go('catalog'); window.scrollTo(0, 0); };
  const choose = c => {
    const b = (pick && pick.back) || 'home'; setPick(null);
    if (cmp.includes(c.id)) say(c.n + ' قبلاً به مقایسه افزوده شده است'); else if (cmp.length >= 3) say('حداکثر سه خودرو را می‌توان مقایسه کرد'); else { setCmp([...cmp, c.id]); say(c.n + ' به مقایسه افزوده شد'); }
    go(b); setTimeout(() => { if (b === 'home') { const e = document.getElementById('cmpsec'); if (e) e.scrollIntoView({ block: 'center' }); } }, 250);
  };
  const open = c => pick ? choose(c) : go('car-' + c.id);
  useEffect(() => { if (route !== 'catalog') setPick(null); }, [route]);

  const list = useMemo(() => {
    let r = CARS.filter(x => (cat === 'همه' || x.c === cat) && (x.n + x.c + x.e).toLowerCase().includes(q.trim().toLowerCase()) && (!fl.br || x.br === fl.br) && (!fl.yf || x.y >= +fl.yf) && (!fl.yt || x.y <= +fl.yt) && (!fl.pmin || x.p >= +fl.pmin) && (!fl.pmax || x.p <= +fl.pmax));
    if (sort === 'pa') r = [...r].sort((a, b) => a.p - b.p); if (sort === 'pd') r = [...r].sort((a, b) => b.p - a.p); if (sort === 'hp') r = [...r].sort((a, b) => b.hp - a.hp);
    return r;
  }, [CARS, q, cat, sort, fl]);

  const nav = [['home', 'خانه'], ['catalog', 'خودروها'], ['compare', 'مقایسه'], ...(isAdmin ? [['admin', 'مدیریت']] : [])];
  const car = CARS.find(x => route === 'car-' + x.id);
  const base = route.startsWith('car-') ? 'catalog' : route;

  const ctx = {
    CARS, route, q, setQ, cat, setCat, sort, setSort, favs, cmp, view, setView, tab, setTab, hs, setHs, sel, setSel, pick, setPick,
    fl, setF, nF, resetF, showF, setShowF, toggleFav, toggleCmp, go, startPick, open, list, user, pf, pfE, setP, showPw, setShowPw,
    changePw, saveName, logout, busy, li, liE, setL, submitLi, su, suE, setS, submitSu, car, isAdmin, authReady, say, reloadCars
  };

  let page;
  if (car) page = CarPage(ctx);
  else if (route === 'catalog') page = Catalog(ctx);
  else if (route === 'profile') page = Profile(ctx);
  else if (route === 'login') page = Login(ctx);
  else if (route === 'signup') page = Signup(ctx);
  else if (route === 'favs') page = Favs(ctx);
  else if (route === 'compare') page = Compare(ctx);
  else if (route === 'admin') page = html`<${Admin} ctx=${ctx}/>`;
  else page = Home(ctx);

  return html`<div>
    <header class=""><div class="wrap bar"><button class="logo" aria-label="VELOX – صفحه اصلی" onClick=${() => go('home')}>VELOX</button>
      <nav aria-label="ناوبری اصلی" class=${menu ? 'open' : ''}>${nav.map(([r, l]) => html`<button key=${r} aria-current=${base === r ? 'page' : null} class=${base === r ? 'on' : ''} onClick=${() => go(r)}>${l}</button>`)}</nav>
      <div class="ico">${user ? html`<button class="su on" title="پروفایل من" aria-label="پروفایل من" onClick=${() => go('profile')}>${user.name.split(' ')[0]}</button>` : html`<button class="su ln" onClick=${() => go('login')}>ورود</button><button class="su" onClick=${() => go('signup')}>ثبت‌نام</button>`}<button class="ib" aria-label="جست‌وجو" onClick=${() => { go('catalog'); setTimeout(() => { const e = document.getElementById('cs'); e && e.focus(); }, 60); }}><${Ic} n="search"/></button>
        <button class="ib" aria-label=${'علاقه‌مندی‌ها' + (favs.length ? ' (' + fmt(favs.length) + ')' : '')} onClick=${() => go('favs')}><${Ic} n="heart"/>${favs.length ? html`<i>${fmt(favs.length)}</i>` : null}</button>
        <button class="ib burger" aria-label="منو" aria-expanded=${menu} onClick=${() => setMenu(!menu)}><${Ic} n="menu"/></button></div></div></header>
    ${page}
    ${cmp.length > 0 && route !== 'compare' ? html`<div class="cmpbar"><span>${fmt(cmp.length)} خودرو برای مقایسه انتخاب شده</span><button class="btn" onClick=${() => go('compare')}>مقایسه</button><button class="rm" onClick=${() => { setCmp([]); say('مقایسه پاک شد'); }}>پاک کردن</button></div>` : null}
    <div class="toast" role="status" aria-live="polite" style=${{ opacity: toast ? 1 : 0 }}>${toast}</div>
    <footer><div class="wrap"><span class="logo" style=${{ fontSize: 18 }}>VELOX</span><span>© ۲۰۲۶ VELOX · مشخصات و قیمت‌ها نمونه و نمایشی هستند</span></div></footer></div>`;
}
