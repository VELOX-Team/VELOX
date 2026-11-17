import { html } from '../lib/html.js';
import { fmt } from '../lib/utils.js';

export function Pic({c,i=0,eager}){
  const p=c.photos[i];
  return p?html`<img class="im" src=${p} alt=${c.n+' – تصویر '+fmt(i+1)} loading=${eager?'eager':'lazy'} draggable="false"/>`
  :html`<div class="ph" role="img" aria-label=${'تصویر '+c.n+' بارگذاری نشده'}><b>${c.n}</b><small>تصویر بارگذاری نشده</small></div>`;
}
