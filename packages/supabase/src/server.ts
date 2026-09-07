import { createClient } from "@supabase/supabase-js"

// Uses the service role key — bypasses RLS entirely.
// Never expose this client or its key to the frontend.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)
