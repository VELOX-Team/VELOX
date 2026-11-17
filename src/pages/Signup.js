import { html } from '../lib/html.js';
import { fmt, money, nd, BEST, CATS } from '../lib/utils.js';
import { Ic } from '../components/Icon.js';
import { Pic } from '../components/Pic.js';
import { V360 } from '../components/V360.js';
import { card } from '../components/Card.js';

export function Signup(ctx){
  const {go,user,showPw,setShowPw,busy,su,suE,setS,submitSu}=ctx;
    const fld=(k,label,type,ac,hint,extra)=>html`<div class=${'fld'+(suE[k]?' bad':'')}><label for=${'su-'+k}>${label}</label>
      ${extra?html`<div class="pwrow"><input id=${'su-'+k} type=${showPw?'text':'password'} autocomplete=${ac} value=${su[k]} aria-invalid=${!!suE[k]} maxlength=${k==='name'?60:k==='id'?254:128} onInput=${ev=>setS(k,k==='id'?idClean(ev.target.value):ev.target.value)} onKeyDown=${ev=>ev.key==='Enter'&&submitSu()} style=${{direction:'ltr',textAlign:'left'}}/><button type="button" onClick=${()=>setShowPw(!showPw)} aria-label="نمایش یا پنهان کردن رمز">${showPw?'پنهان':'نمایش'}</button></div>`
      :html`<input id=${'su-'+k} type=${type} autocomplete=${ac} value=${su[k]} aria-invalid=${!!suE[k]} maxlength=${k==='name'?60:k==='id'?254:128} onInput=${ev=>setS(k,k==='id'?idClean(ev.target.value):ev.target.value)} onKeyDown=${ev=>ev.key==='Enter'&&submitSu()} style=${k==='id'?{direction:'ltr',textAlign:'left'}:null}/>`}
      ${suE[k]?html`<div class="err" role="alert">${suE[k]}</div>`:hint?html`<div class="hint">${hint}</div>`:null}</div>`;
    return html`<div class="page"><div class="wrap">${user?
      html`<div class="auth" style=${{textAlign:'center'}}><div class="eyebrow">Welcome</div><h2 style=${{margin:'8px 0 12px'}}>${user.name}، <em>خوش آمدید</em></h2><p class="muted" style=${{marginBottom:24}}>حساب شما ساخته شده است.</p><button class="btn" onClick=${()=>go('catalog')}>مشاهده خودروها</button></div>`:
      html`<div class="auth"><div class="eyebrow">Join VELOX</div><h2 style=${{marginTop:6}}>ساخت <em>حساب کاربری</em></h2><p class="muted">برای ذخیرهٔ علاقه‌مندی‌ها و دریافت جدیدترین خودروها ثبت‌نام کنید.</p>
      ${fld('name','نام و نام خانوادگی','text','name')}
      ${fld('id','ایمیل','email','email','مثال: name@example.com')}
      ${fld('pw','رمز عبور','password','new-password','حداقل ۸ کاراکتر، شامل حرف انگلیسی و عدد',true)}
      ${fld('pw2','تکرار رمز عبور','password','new-password',null,true)}
      <div class=${'fld'+(suE.ok?' bad':'')}><label class="chk"><input id="su-ok" type="checkbox" checked=${su.ok} onChange=${ev=>setS('ok',ev.target.checked)}/><span>قوانین و حریم خصوصی VELOX را می‌پذیرم.</span></label>${suE.ok?html`<div class="err" role="alert">${suE.ok}</div>`:null}</div>
      <button class="btn" disabled=${busy} onClick=${submitSu}>ثبت‌نام</button>
      <p class="note">حساب دارید؟ <button class="lnk" onClick=${()=>go('login')}>وارد شوید</button></p>
      <p class="note">رمز عبور هرگز به‌صورت متن ساده ذخیره نمی‌شود. بعد از ثبت‌نام، ایمیل تأیید برای شما ارسال می‌شود.</p></div>`}</div></div>`;
}
