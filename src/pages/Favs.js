import { html } from '../lib/html.js';
import { fmt, money, nd, BEST, CATS } from '../lib/utils.js';
import { Ic } from '../components/Icon.js';
import { Pic } from '../components/Pic.js';
import { V360 } from '../components/V360.js';
import { card } from '../components/Card.js';

export function Favs(ctx){
  const {CARS,favs,go}=ctx;
  const cardOf=c=>card(c,ctx);
    const l=CARS.filter(x=>favs.includes(x.id));
    return html`<div class="page"><div class="wrap"><h2 style=${{fontSize:34,marginBottom:30}}><em>علاقه‌مندی‌ها</em></h2>
      ${l.length?html`<div class="grid">${l.map(cardOf)}</div>`:html`<div class="empty">هنوز خودرویی ذخیره نکرده‌اید.<br/><br/><button class="btn" onClick=${()=>go('catalog')}>مشاهده خودروها</button></div>`}</div></div>`;
}
