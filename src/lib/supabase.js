import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://mxfspihhillnytdnnnyg.supabase.co';
// کلید publishable عمومی است و با RLS محافظت می‌شود. کلید secret/service_role هرگز اینجا نگذارید.
const PUBLISHABLE_KEY = 'sb_publishable_gT5gJQWf747KVy4cCuewhw_pC85jZT0';
export const BUCKET = 'car-images';

export const SB = (() => {
  try {
    return createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  } catch (e) {
    return null;
  }
})();

// مسیر فایل در bucket را به آدرس عمومی تبدیل می‌کند
export const photoUrl = p =>
  !p ? '' : /^(https?:)?\/\//.test(p) ? p
  : SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + p.split('/').map(encodeURIComponent).join('/');
