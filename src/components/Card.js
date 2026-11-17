import { html } from '../lib/html.js';
import { money } from '../lib/utils.js';
import { Ic } from './Icon.js';
import { Pic } from './Pic.js';

export const card=(c,{open,favs,toggleFav,cmp,toggleCmp})=>html`<article class="card" key=${c.id}>
    <div class="pic" onClick=${()=>open(c)}><${Pic} c=${c}/>
      <button class=${'cb h'+(favs.includes(c.id)?' on':'')} aria-pressed=${favs.includes(c.id)} aria-label=${'علاقه‌مندی '+c.n} onClick=${e=>{e.stopPropagation();toggleFav(c)}}><${Ic} n="heart"/></button></div>
    <div class="cinfo" onClick=${()=>open(c)} role="link" tabindex="0" onKeyDown=${e=>{if(e.key==='Enter')open(c)}}><div><h3>${c.n}</h3><div class="sp">${c.hp} HP · ${c.s}s 0-100</div></div><${Ic} n="arrow"/></div>
    <div class="cft"><span class="price">${money(c.p)}</span><label class="chk"><input type="checkbox" checked=${cmp.includes(c.id)} onChange=${()=>toggleCmp(c)}/>مقایسه</label></div></article>`;
