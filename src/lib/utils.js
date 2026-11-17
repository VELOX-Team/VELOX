export const fmt = n => Number(n).toLocaleString('fa-IR');
export const money = n => '$' + Number(n).toLocaleString('en-US');
export const CATS = ['اسپرت', 'سوپراسپرت'];
export const BEST = { p: -1, hp: 1, s: -1, t: 1 };
export const OFF = 'اتصال به سرور برقرار نیست؛ اینترنت را بررسی کنید.';
export const nd = v => v.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[^\d]/g, '');
export const dec = v => v.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^\d.]/g, '');
export const PWOK = p => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
export const idClean = v => v.slice(0, 254);

export const mapErr = m => {
  m = (m || '').toLowerCase();
  return m.includes('invalid login') ? 'ایمیل یا رمز عبور درست نیست.'
    : m.includes('not confirmed') ? 'ایمیل شما هنوز تأیید نشده است؛ لینک ارسال‌شده را بزنید.'
    : m.includes('rate limit') || m.includes('too many') ? 'تعداد تلاش زیاد بود؛ کمی بعد دوباره امتحان کنید.'
    : m.includes('password') ? 'رمز عبور پذیرفته نشد؛ رمز قوی‌تری انتخاب کنید.'
    : m.includes('fetch') || m.includes('network') ? OFF
    : 'خطایی رخ داد؛ دوباره تلاش کنید.';
};
