import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Environment variables - use process.env for better serverless compatibility
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_KEY.");
}

// Standard client that respects RLS policies
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client for bypassing RLS (development only)
export const supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      "x-supabase-auth-bypass": "true",
    },
  },
});
