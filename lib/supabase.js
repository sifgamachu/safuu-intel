// ─────────────────────────────────────────────────────────────────────────
//  Supabase client (server-side only — uses service_role key)
//  Never import this file in client components.
// ─────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const url        = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Vercel env vars'
  );
}

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
