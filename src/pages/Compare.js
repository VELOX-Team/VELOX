import { html } from '../lib/html.js';
import { fmt, money, nd, BEST, CATS } from '../lib/utils.js';
import { Ic } from '../components/Icon.js';
import { Pic } from '../components/Pic.js';
import { V360 } from '../components/V360.js';
import { card } from '../components/Card.js';

export function Compare(ctx){
  const {CARS,cmp,toggleCmp,startPick}=ctx;
    const l=cmp.map(id=>CARS.find(x=>x.id===id)).filter(Boolean);
    const rows=[['قیمت','p',money],['قدرت','hp',v=>fmt(v)+' hp'],['شتاب ۰–۱۰۰','s',v=>fmt(v)+' ثانیه'],['سرعت نهایی','t',v=>fmt(v)+' km/h'],['پیشرانه','e'],['دسته','c'],['ظرفیت','seats',v=>fmt(v)+' نفر']];
    return html`<div class="page"><div class="wrap"><h2 style=${{fontSize:34}}>مقایسه <em>خودروها</em></h2><p class="muted" style=${{marginBottom:30}}>تا ۳ خودرو؛ بهترین مقدار هر ردیف طلایی است.</p>
      ${l.length<2?html`<div class="empty">برای مقایسه حداقل دو خودرو انتخاب کنید.<br/><br/><button class="btn" onClick=${()=>startPick('compare')}>انتخاب خودرو</button></div>`:
      html`<div class="scroll"><table><thead><tr><th></th>${l.map(c=>html`<th key=${c.id}>${c.n}<br/><button class="rm" onClick=${()=>toggleCmp(c)}>حذف ✕</button></th>`)}</tr></thead>
      <tbody>${rows.map(([lb,k,f])=>{const dir=BEST[k];const best=dir?(dir>0?Math.max:Math.min)(...l.map(c=>c[k])):null;
        return html`<tr key=${k}><td>${lb}</td>${l.map(c=>html`<td key=${c.id} class=${dir&&c[k]===best?'best':''}>${f?f(c[k]):c[k]}</td>`)}</tr>`})}</tbody></table></div>`}
      ${l.length>=2&&l.length<3?html`<div style=${{marginTop:20}}><button class="btn ghost" onClick=${()=>startPick('compare')}><${Ic} n="plus"/>افزودن خودروی سوم</button></div>`:null}</div></div>`;
}
