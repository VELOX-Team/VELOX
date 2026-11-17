import { html } from '../lib/html.js';
import { fmt, money, nd, BEST, CATS } from '../lib/utils.js';
import { Ic } from '../components/Icon.js';
import { Pic } from '../components/Pic.js';
import { V360 } from '../components/V360.js';
import { card } from '../components/Card.js';

const TABS=['معرفی خودرو','مشخصات فنی','گالری تصاویر','نمای ۳۶۰°','نظرات کاربران'];
const REV=[['سارا م.','کابین فوق‌العاده آرام و کیفیت مواد عالی است.'],['کامران ر.','هندلینگ دقیق و پاسخ‌دهی عالی؛ ارزش خرید دارد.'],['نیما ع.','طراحی ساده و باشکوه؛ دقیقاً همان چیزی که می‌خواستم.']];

export function CarPage(ctx){
  const {CARS,favs,cmp,view,setView,tab,setTab,toggleFav,toggleCmp,go,list,car,isAdmin}=ctx;
  const cardOf=c=>card(c,ctx);
    const P=car.photos;
    const sp=[['قدرت',fmt(car.hp),'hp','bolt'],['شتاب ۰–۱۰۰',fmt(car.s),'s','clock'],['حداکثر سرعت',fmt(car.t),'km/h','speed'],['پیشرانه',car.e,'','gear']];
    const all=[['قدرت',fmt(car.hp)+' hp'],['شتاب ۰–۱۰۰',fmt(car.s)+' ثانیه'],['سرعت نهایی',fmt(car.t)+' km/h'],['پیشرانه',car.e],['ظرفیت',fmt(car.seats)+' نفر'],['مدل',fmt(car.y)],['قیمت',money(car.p)]];
    return html`<div class="wrap"><div class="crumb"><button onClick=${()=>go('home')}>خانه</button> › <button onClick=${()=>go('catalog')}>خودروها</button> › ${car.n}</div>
      <div class="det"><div><div class="dstage"><${Pic} c=${car} i=${view} eager=${true}/></div>
        ${P.length>1?html`<div class="thumbs">${P.slice(0,5).map((_,i)=>html`<button key=${i} class=${'th'+(view===i?' on':'')} aria-label=${'تصویر '+fmt(i+1)} aria-current=${view===i} onClick=${()=>setView(i)}><${Pic} c=${car} i=${i}/></button>`)}</div>`:null}
        ${!P.length&&isAdmin?html`<p class="muted" style=${{marginTop:12}}><button class="rm" onClick=${()=>go('admin')}>افزودن تصویر برای ${car.n} ←</button></p>`:null}</div>
        <div class="dinfo"><h1>${car.n}</h1><div class="tg">${car.tg}</div>
          <div class="spx" role="list">${sp.map(s=>html`<div class="sr" role="listitem" key=${s[0]}><span class="sl">${s[0]}</span><span class=${'sv'+(s[2]?'':' tx')}><b>${s[1]}</b>${s[2]?html`<em>${s[2]}</em>`:null}</span><${Ic} n=${s[3]}/></div>`)}</div>
          <div style=${{display:'flex',gap:12,flexWrap:'wrap'}}><button class="btn" aria-pressed=${favs.includes(car.id)} onClick=${()=>toggleFav(car)}><${Ic} n="heart" f=${favs.includes(car.id)}/>${favs.includes(car.id)?'در علاقه‌مندی‌ها':'افزودن به علاقه‌مندی‌ها'}</button>
          <button class="btn ghost" onClick=${()=>{if(!cmp.includes(car.id))toggleCmp(car);go('compare')}}>مقایسه</button></div></div></div>
      <div class="tabs" role="tablist">${TABS.map((t,i)=>html`<button key=${i} role="tab" aria-selected=${tab===i} class=${'tab'+(tab===i?' on':'')} onClick=${()=>setTab(i)}>${t}</button>`)}</div>
      <div class="tp" role="tabpanel" style=${tab===3||tab===2?{maxWidth:'none'}:null}>
        ${tab===0?html`<div><p>${car.d}</p><p>${car.n} با قیمت شروع ${money(car.p)} و ${fmt(car.hp)} اسب‌بخار قدرت، برای کسانی طراحی شده که کیفیت را بدون هیاهو می‌خواهند.</p></div>`:null}
        ${tab===1?html`<div><p class="muted" style=${{marginBottom:12}}>مشخصات و قیمت‌ها تقریبی‌اند و پیش از انتشار باید با منبع رسمی تطبیق داده شوند.</p><div class="dl">${all.map(s=>html`<div key=${s[0]}><span>${s[0]}</span><b>${s[1]}</b></div>`)}</div></div>`:null}
        ${tab===2?(P.length?html`<div class="gal">${P.map((_,i)=>html`<div key=${i}><${Pic} c=${car} i=${i}/></div>`)}</div>`:html`<div class="empty">گالری خالی است.${isAdmin?html`<br/><br/><button class="btn" onClick=${()=>go('admin')}>بارگذاری تصویر</button>`:null}</div>`):null}
        ${tab===3?html`<${V360} c=${car} go=${go} isAdmin=${isAdmin}/>`:null}
        ${tab===4?html`<div>${REV.map(r=>html`<div class="rv" key=${r[0]}><b>${r[0]}</b><div>${r[1]}</div></div>`)}</div>`:null}</div>
      <h2 style=${{margin:'30px 0 24px'}}>خودروهای <em>مشابه</em></h2><div class="grid">${CARS.filter(x=>x.c===car.c&&x.id!==car.id).concat(CARS.filter(x=>x.c!==car.c)).slice(0,3).map(cardOf)}</div></div>`;
}
