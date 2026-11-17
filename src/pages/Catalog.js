import { html } from '../lib/html.js';
import { fmt, money, nd, BEST, CATS } from '../lib/utils.js';
import { Ic } from '../components/Icon.js';
import { Pic } from '../components/Pic.js';
import { V360 } from '../components/V360.js';
import { card } from '../components/Card.js';

export function Catalog(ctx){
  const {CARS,q,setQ,cat,setCat,sort,setSort,cmp,pick,setPick,fl,setF,nF,resetF,showF,setShowF,go,list}=ctx;
  const cardOf=c=>card(c,ctx);
    return html`<div class="page"><div class="wrap"><h2 style=${{fontSize:34}}>کلکسیون <em>خودروها</em></h2><p class="muted" style=${{marginBottom:28}}>بهترین خودروهای لوکس در یک مکان</p>
      ${pick?html`<div class="pickbar" role="status"><span>یک خودرو را برای مقایسه انتخاب کنید (${fmt(cmp.length)} از ۳)</span><button class="rm" onClick=${()=>{const b=pick.back;setPick(null);go(b)}}>انصراف</button></div>`:null}
      <div class="tools"><input id="cs" type="search" aria-label="جست‌وجو" placeholder="جست‌وجوی نام، دسته یا پیشرانه…" value=${q} onInput=${e=>setQ(e.target.value)}/>
      <select value=${sort} onChange=${e=>setSort(e.target.value)} aria-label="مرتب‌سازی"><option value="new">مرتب‌سازی بر اساس</option><option value="pa">ارزان‌ترین</option><option value="pd">گران‌ترین</option><option value="hp">قدرتمندترین</option></select>
      <button class="btn ghost sm" aria-expanded=${showF} aria-controls="fp" onClick=${()=>setShowF(!showF)}>فیلترها${nF?' ('+fmt(nF)+')':''}</button></div>
      ${showF?html`<div class="fpanel" id="fp"><label>برند<select value=${fl.br} onChange=${e=>setF('br',e.target.value)}><option value="">همه برندها</option>${[...new Set(CARS.map(c=>c.br))].sort().map(b=>html`<option key=${b} value=${b}>${b}</option>`)}</select></label>
        <label>سال ساخت از<select value=${fl.yf} onChange=${e=>setF('yf',e.target.value)}><option value="">همه</option>${[...new Set(CARS.map(c=>c.y))].sort().map(y=>html`<option key=${y} value=${y}>${fmt(y)}</option>`)}</select></label>
        <label>تا سال<select value=${fl.yt} onChange=${e=>setF('yt',e.target.value)}><option value="">همه</option>${[...new Set(CARS.map(c=>c.y))].sort().map(y=>html`<option key=${y} value=${y}>${fmt(y)}</option>`)}</select></label>
        <label>حداقل قیمت ($)<input inputmode="numeric" placeholder="0" value=${fl.pmin} onInput=${e=>setF('pmin',nd(e.target.value))}/></label>
        <label>حداکثر قیمت ($)<input inputmode="numeric" placeholder="350000" value=${fl.pmax} onInput=${e=>setF('pmax',nd(e.target.value))}/></label>
        <button class="rm" onClick=${resetF}>پاک کردن فیلترها</button></div>`:null}
      <div class="chips" style=${{marginBottom:20}}>${['همه',...CATS].map(x=>html`<button key=${x} aria-pressed=${cat===x} class=${'chip'+(cat===x?' on':'')} onClick=${()=>setCat(x)}>${x}</button>`)}</div>
      <p class="muted" style=${{marginBottom:16}} role="status">${fmt(list.length)} خودرو</p>
      ${list.length?html`<div class="grid">${list.map(cardOf)}</div>`:html`<div class="empty">خودرویی با این مشخصات پیدا نشد.<br/><br/><button class="btn ghost" onClick=${()=>{setQ('');setCat('همه');resetF()}}>پاک کردن فیلترها</button></div>`}</div></div>`;
}
