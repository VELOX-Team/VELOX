import { html } from '../lib/html.js';
import { fmt, money, nd, BEST, CATS } from '../lib/utils.js';
import { Ic } from '../components/Icon.js';
import { Pic } from '../components/Pic.js';
import { V360 } from '../components/V360.js';
import { card } from '../components/Card.js';

export function Profile(ctx){
  const {go,user,pf,pfE,setP,showPw,setShowPw,changePw,saveName,logout,busy}=ctx;
    const pfld=(k,label,ac,hint)=>html`<div class=${'fld'+(pfE[k]?' bad':'')}><label for=${'pf-'+k}>${label}</label><div class="pwrow"><input id=${'pf-'+k} type=${showPw?'text':'password'} autocomplete=${ac} value=${pf[k]} aria-invalid=${!!pfE[k]} maxlength="128" onInput=${ev=>setP(k,ev.target.value)} onKeyDown=${ev=>ev.key==='Enter'&&changePw()} style=${{direction:'ltr',textAlign:'left'}}/><button type="button" onClick=${()=>setShowPw(!showPw)} aria-label="نمایش یا پنهان کردن رمز">${showPw?'پنهان':'نمایش'}</button></div>${pfE[k]?html`<div class="err" role="alert">${pfE[k]}</div>`:hint?html`<div class="hint">${hint}</div>`:null}</div>`;
    return html`<div class="page"><div class="wrap">${!user?
      html`<div class="auth" style=${{textAlign:'center'}}><h2 style=${{marginBottom:12}}>برای دیدن پروفایل <em>وارد شوید</em></h2><p class="muted" style=${{marginBottom:24}}>هنوز وارد حساب خود نشده‌اید.</p><button class="btn" onClick=${()=>go('login')}>ورود</button></div>`:
      html`<div class="pstack">
      <div class="auth"><div class="av" aria-hidden="true">${user.name.trim().charAt(0).toUpperCase()}</div><div class="eyebrow" style=${{textAlign:'center'}}>Profile</div><h2 style=${{textAlign:'center',margin:'6px 0 24px'}}>پروفایل <em>من</em></h2>
        <div class=${'fld'+(pfE.name?' bad':'')}><label for="pf-name">نام و نام خانوادگی</label><input id="pf-name" type="text" autocomplete="name" value=${pf.name} aria-invalid=${!!pfE.name} maxlength="60" onInput=${ev=>setP('name',ev.target.value)} onKeyDown=${ev=>ev.key==='Enter'&&saveName()}/>${pfE.name?html`<div class="err" role="alert">${pfE.name}</div>`:null}</div>
        <div class="fld"><label for="pf-id">ایمیل</label><input id="pf-id" type="text" value=${user.email} disabled style=${{direction:'ltr',textAlign:'left'}}/><div class="hint">این مورد قابل تغییر نیست.</div></div>
        <button class="btn" onClick=${saveName}>ذخیره تغییرات</button></div>
      <div class="auth"><h2 style=${{fontSize:22,marginBottom:20}}>تغییر <em>رمز عبور</em></h2>
        ${pfld('cur','رمز عبور فعلی','current-password')}
        ${pfld('pw','رمز عبور جدید','new-password','حداقل ۸ کاراکتر، شامل حرف انگلیسی و عدد')}
        ${pfld('pw2','تکرار رمز عبور جدید','new-password')}
        <button class="btn" disabled=${busy} onClick=${changePw}>تغییر رمز عبور</button></div>
      <button class="btn ghost" style=${{justifyContent:'center',width:'100%'}} onClick=${logout}>خروج از حساب</button></div>`}</div></div>`;
}
