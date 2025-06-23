import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

// Standard client that respects RLS policies
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client that can bypass RLS.
// In production (Vercel), it uses the SERVICE_ROLE_KEY.
// In development, it uses the anon key and a bypass header.
const isAdmin = import.meta.env.PROD;

export const supabaseAdminClient = createClient<Database>(
  supabaseUrl,
  isAdmin ? supabaseServiceRoleKey : supabaseAnonKey,
  isAdmin
    ? {}
    : {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            "x-supabase-auth-bypass": "true",
          },
        },
      }
);
