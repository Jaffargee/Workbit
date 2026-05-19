import { createClient } from "@supabase/supabase-js";

const SUPBASE_API_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPBASE_API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPBASE_API_URL, SUPBASE_API_KEY, {
      auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
      }
});