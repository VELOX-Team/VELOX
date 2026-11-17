import { html } from '../lib/html.js';
import { fmt, money, nd, BEST, CATS } from '../lib/utils.js';
import { Ic } from '../components/Icon.js';
import { Pic } from '../components/Pic.js';
import { V360 } from '../components/V360.js';
import { card } from '../components/Card.js';

export function Login(ctx){
  const {go,user,showPw,setShowPw,busy,li,liE,setL,submitLi}=ctx;
    return html`<div class="page"><div class="wrap">${user?
      html`<div class="auth" style=${{textAlign:'center'}}><div class="eyebrow">Welcome</div><h2 style=${{margin:'8px 0 12px'}}>${user.name}، <em>خوش آمدید</em></h2><p class="muted" style=${{marginBottom:24}}>شما وارد حساب خود شده‌اید.</p><button class="btn" onClick=${()=>go('catalog')}>مشاهده خودروها</button></div>`:
      html`<div class="auth"><div class="eyebrow">Sign in</div><h2 style=${{marginTop:6}}>ورود به <em>حساب کاربری</em></h2><p class="muted">اگر قبلا ثبت‌نام کرده‌اید، وارد شوید.</p>
      <div class=${'fld'+(liE?' bad':'')}><label for="li-id">ایمیل</label><input id="li-id" type="text" autocomplete="username" value=${li.id} maxlength="254" onInput=${ev=>setL('id',idClean(ev.target.value))} onKeyDown=${ev=>ev.key==='Enter'&&submitLi()} style=${{direction:'ltr',textAlign:'left'}}/></div>
      <div class=${'fld'+(liE?' bad':'')}><label for="li-pw">رمز عبور</label><div class="pwrow"><input id="li-pw" type=${showPw?'text':'password'} autocomplete="current-password" value=${li.pw} aria-invalid=${!!liE} maxlength="128" onInput=${ev=>setL('pw',ev.target.value)} onKeyDown=${ev=>ev.key==='Enter'&&submitLi()} style=${{direction:'ltr',textAlign:'left'}}/><button type="button" onClick=${()=>setShowPw(!showPw)} aria-label="نمایش یا پنهان کردن رمز">${showPw?'پنهان':'نمایش'}</button></div>${liE?html`<div class="err" role="alert">${liE}</div>`:null}</div>
      <button class="btn" disabled=${busy} onClick=${submitLi}>ورود</button>
      <p class="note">حساب ندارید؟ <button class="lnk" onClick=${()=>go('signup')}>ثبت‌نام کنید</button></p>
      <p class="note">اطلاعات حساب شما روی سرور نگهداری می‌شود.</p></div>`}</div></div>`;
}
