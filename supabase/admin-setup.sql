-- اجرا در Supabase > SQL Editor (یک‌بار). همه‌ی دستورها قابل‌تکرار و بی‌خطر هستند.

-- ۱) ستون frames برای نمای ۳۶۰ درجه
alter table public.cars add column if not exists frames text[] not null default '{}';

-- ۲) فقط مدیر بتواند فهرست فایل‌های bucket را بخواند (لازم برای حذف عکس‌ها از صفحه‌ی مدیریت)
--    نمایش عمومی عکس‌ها به این قانون نیاز ندارد، چون bucket عمومی است.
drop policy if exists "images read admin" on storage.objects;
create policy "images read admin" on storage.objects
  for select to authenticated
  using (bucket_id = 'car-images' and (select public.is_admin()));

-- ۳) ثبت کارفرما به‌عنوان مدیر
--    اول خود کارفرما باید در سایت ثبت‌نام کند و ایمیلش را تأیید کند.
--    بعد ایمیل او را جایگزین کنید و این دستور را اجرا کنید:
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'client@example.com';

-- برای گرفتن دسترسی مدیر از یک نفر:
-- delete from public.admins where user_id = (select id from auth.users where email = 'client@example.com');
