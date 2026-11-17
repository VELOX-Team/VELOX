import { html, useState, useEffect, useRef } from '../lib/html.js';
import { fmt } from '../lib/utils.js';
import { Ic } from './Icon.js';

export function V360({c,go,isAdmin}){
  const f=c.frames,n=f.length;
  const [idx,setIdx]=useState(0),[auto,setAuto]=useState(false),[dg,setDg]=useState(false);
  const s=useRef({a:0,v:0,d:false,x:0,t:0,auto:false,n:0});
  s.current.n=n;s.current.auto=auto;
  useEffect(()=>{s.current.a=0;setIdx(0);f.forEach(u=>{const i=new Image();i.src=u})},[c.id,n]);
  useEffect(()=>{if(n<2)return;let raf,last=performance.now();
    const tick=t=>{const S=s.current,dt=Math.min(50,t-last);last=t;
      if(!S.d){if(Math.abs(S.v)>0.002){S.a+=S.v*dt;S.v*=0.94}else{S.v=0;if(S.auto)S.a+=0.006*dt}}
      setIdx(((Math.round(S.a)%n)+n)%n);raf=requestAnimationFrame(tick)};
    raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[c.id,n]);
  if(n<2)return html`<div class="v3 empty3"><p><b>${c.n}</b> هنوز فریم ۳۶۰ درجه ندارد.</p>${isAdmin?html`<p class="muted">برای چرخش واقعی، ۲۴ تا ۷۲ عکس از دور تا دور خودرو (با زاویه‌های یکنواخت) لازم است.</p><button class="btn" onClick=${()=>go('admin')}><${Ic} n="cam"/>بارگذاری فریم‌ها</button>`:null}</div>`;
  const dn=e=>{const S=s.current;S.d=true;S.x=e.clientX;S.t=performance.now();S.v=0;setDg(true);e.currentTarget.setPointerCapture(e.pointerId)};
  const mv=e=>{const S=s.current;if(!S.d)return;const now=performance.now(),dx=e.clientX-S.x,w=e.currentTarget.getBoundingClientRect().width;S.a-=dx*S.n/(w*1.1);S.v=-dx*S.n/(w*1.1)/Math.max(8,now-S.t);S.x=e.clientX;S.t=now};
  const up=()=>{s.current.d=false;setDg(false)};
  const step=d=>{s.current.a=Math.round(s.current.a)+d;s.current.v=0};
  const stop=e=>e.stopPropagation();
  return html`<div class=${'v3'+(dg?' dg':'')} tabindex="0" role="group" aria-label=${'نمای ۳۶۰ درجه '+c.n+'؛ با کشیدن یا کلیدهای جهت بچرخانید'} onPointerDown=${dn} onPointerMove=${mv} onPointerUp=${up} onPointerCancel=${up} onKeyDown=${e=>{if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1)}}>
    <img class="im" src=${f[idx]} alt=${c.n+' – زاویه '+fmt(idx+1)+' از '+fmt(n)} draggable="false"/>
    <button class="arw" style=${{insetInlineStart:10}} aria-label="چرخش به راست" onPointerDown=${stop} onClick=${()=>step(1)}><${Ic} n="arrow"/></button>
    <button class="arw" style=${{insetInlineEnd:10}} aria-label="چرخش به چپ" onPointerDown=${stop} onClick=${()=>step(-1)}><${Ic} n="left"/></button>
    <div class="v3b" onPointerDown=${stop}><button class="ib" aria-pressed=${auto} aria-label=${auto?'توقف':'پخش خودکار'} onClick=${()=>setAuto(!auto)}>${auto?'❚❚':'▶'}</button><div class="prog"><i style=${{width:((idx+1)/n*100)+'%'}}></i></div><span>${fmt(idx+1)} / ${fmt(n)}</span></div></div>`;
}
