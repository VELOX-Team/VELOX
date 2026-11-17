# VELOX

سایت خودروهای لوکس: Vite + React + Supabase.

## اجرا روی کامپیوتر
```
npm install
npm run dev
```

## ساخت و پیش‌نمایش
```
npm run build
npm run preview
```

## انتشار
هر Push روی شاخه‌ی `main` با GitHub Actions ساخته و روی GitHub Pages منتشر می‌شود.
قبل از اولین انتشار: GitHub > Settings > Pages > Source را روی **GitHub Actions** بگذارید.

## صفحه‌ی مدیریت
آدرس: `/#/admin`. فقط حساب‌هایی که در جدول `admins` باشند دسترسی دارند، و این محدودیت را قوانین RLS
در Supabase اعمال می‌کند (فقط مخفی‌کردن دکمه نیست). راه‌اندازی: `supabase/admin-setup.sql`.

## امنیت
کلید publishable داخل `src/lib/supabase.js` عمومی است. کلید `secret` یا `service_role` را هرگز در کد یا ریپو نگذارید.
