import { html } from '../lib/html.js';
import { fmt, money, nd, BEST, CATS } from '../lib/utils.js';
import { Ic } from '../components/Icon.js';
import { Pic } from '../components/Pic.js';
import { V360 } from '../components/V360.js';
import { card } from '../components/Card.js';

const HT=[['قدرت،','در اوج','زیبایی','تجربه رانندگی متفاوت با خودروهای لوکس جهان'],['فضا،','در اوج','آرامش','شاسی‌بلندی که سفر را بی‌دغدغه می‌کند'],['آینده،','در','سکوت','برقی، دقیق و بی‌زمان؛ طراحی‌شده برای فردا']];

export function Home(ctx){
  const {CARS,setQ,cat,setCat,cmp,hs,setHs,sel,setSel,toggleCmp,go,startPick,car,isAdmin}=ctx;
  const cardOf=c=>card(c,ctx);
  if(!CARS.length)return html`<div class="page"><div class="wrap"><div class="empty">هنوز خودرویی منتشر نشده است.</div></div></div>`;
    const wp=CARS.filter(c=>c.photos.length),sl=(wp.length?wp:[CARS[4]||CARS[0]]).slice(0,3),N=sl.length,hi=hs%N,hc=sl[hi],H=HT[hi],hp=hc.photos;
    const sc=CARS.find(x=>x.id===sel)||CARS[0];
    const pk=[0,1,6].map(i=>CARS[i]).filter(Boolean),featured=[...pk,...CARS.filter(c=>!pk.includes(c))].slice(0,3);
    return html`<div>
    <div class="hero">
      <div class="wrap hw"><div class="htxt" key=${hi}><div class="eyebrow">${hc.n}</div><h1>${H[0]}<br/>${H[1]} <em>${H[2]}</em></h1><p>${H[3]}</p><button class="btn" onClick=${()=>go('car-'+hc.id)}><${Ic} n="left"/>مشاهده ${hc.n}</button></div>
        ${hp.length?html`<div class="hcar" key=${hc.id}><img class="im" src=${hp[0]} alt=${hc.n}/></div>`:null}
        ${!hp.length?html`<div class="hempty">${isAdmin?html`<p>برای نمایش Hero سینمایی، عکس واقعی خودروها را بارگذاری کنید.</p><button class="btn ghost" onClick=${()=>go('admin')}><${Ic} n="cam"/>بارگذاری تصویر</button>`:html`<p>تصاویر خودروها به‌زودی اضافه می‌شود.</p>`}</div>`:null}</div>
      <div class="hfoot"><div class="wrap"><div class="pg"><button aria-label="قبلی" onClick=${()=>setHs(hs+N-1)}><${Ic} n="left"/></button><span>0${hi+1} / 0${N}</span><button aria-label="بعدی" onClick=${()=>setHs(hs+1)}><${Ic} n="arrow"/></button></div></div></div></div>
    <section><div class="wrap"><div class="head"><div><div class="eyebrow">Collection</div><h2 style=${{marginTop:6}}>کلکسیون <em>خودروها</em></h2><p class="muted">بهترین خودروهای لوکس در یک مکان</p></div><button class="btn ghost" onClick=${()=>{setCat('همه');go('catalog')}}>همه خودروها</button></div>
      <div class="cats" style=${{marginBottom:20}}>${CATS.map((x,i)=>html`<button class="cat" key=${x} onClick=${()=>{setCat(x);setQ('');go('catalog')}}><i>0${i+1}</i><b>${x}</b><span>${fmt(CARS.filter(c=>c.c===x).length)} مدل</span></button>`)}</div>
      <div class="grid">${featured.map(cardOf)}</div></div></section>
    <section class="alt"><div class="wrap v360"><div class="eyebrow">360°</div><h2 style=${{marginTop:6}}>نمایش <em>۳۶۰ درجه</em></h2><p class="muted">خودرو را بکشید و از تمام زوایا ببینید</p>
      <div class="chips" style=${{justifyContent:'center',margin:'20px 0 0'}}>${CARS.map(c=>html`<button key=${c.id} class=${'chip'+(sel===c.id?' on':'')} aria-pressed=${sel===c.id} onClick=${()=>setSel(c.id)}>${c.n}</button>`)}</div>
      <${V360} c=${sc} go=${go} isAdmin=${isAdmin}/></div></section>
    <section id="cmpsec"><div class="wrap v360"><h2>مقایسه <em>خودروها</em></h2><p class="muted">تا سه خودرو را کنار هم مقایسه کنید</p>
      <div class="cslots">${[0,1,2].map(i=>{const c=CARS.find(x=>x.id===cmp[i]);return c?html`<div class="slot" key=${i}><button class="x" aria-label=${'حذف '+c.n} onClick=${()=>toggleCmp(c)}>✕</button><${Pic} c=${c}/><b>${c.n}</b></div>`:html`<button class="slot add" key=${i} onClick=${()=>startPick('home')}><span style=${{fontSize:30}}>+</span>افزودن خودرو</button>`})}</div>
      <div style=${{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>${cmp.length<3?html`<button class="btn" onClick=${()=>startPick('home')}><${Ic} n="left"/>مقایسه کنید</button>`:null}
        ${cmp.length>=2?html`<button class=${'btn'+(cmp.length<3?' ghost':'')} onClick=${()=>go('compare')}>مشاهده جدول مقایسه</button>`:null}</div></div></section>
    <section class="alt"><div class="wrap"><div class="head"><div><div class="eyebrow">Why VELOX</div><h2 style=${{marginTop:6}}>طراحی که <em>می‌ماند</em></h2><p class="muted" style=${{maxWidth:520}}>VELOX مجموعه‌ای منتخب از خودروهای لوکس است؛ هر مدل بر اساس کیفیت ساخت، تجربه رانندگی و سادگی خطوط برگزیده می‌شود.</p></div></div>
      <div class="feats">${[['جست‌وجوی دقیق','فیلتر بر اساس دسته، قیمت و قدرت'],['مقایسه هوشمند','تا سه خودرو، با نمایش بهترین مقدار'],['علاقه‌مندی‌ها','فهرست شخصی که در مرورگر می‌ماند'],['نمای ۳۶۰ درجه','چرخش واقعی با کشیدن یا لمس']].map((f,i)=>html`<div class="feat" key=${i}><b>${f[0]}</b><span>${f[1]}</span></div>`)}</div></div></section></div>`;
}
