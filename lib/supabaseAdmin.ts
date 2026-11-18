import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Server-only Supabase client with the service role key. It bypasses RLS, so:
// - import it only from server code (API routes). `server-only` makes the build
//   fail if a client component ever imports this file;
// - the key is SUPABASE_SERVICE_ROLE_KEY, never NEXT_PUBLIC_, and is never logged.
// Use it only for writes the API routes have already validated. Reads stay on
// lib/supabase.ts (public key, RLS applies).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/** Null when the env vars aren't set. */
export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    : null
