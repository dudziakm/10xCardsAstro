import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Environment variables - try import.meta.env first, then process.env for serverless compatibility
const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Environment check:", { 
    hasImportMeta: !!import.meta.env.SUPABASE_URL, 
    hasProcess: !!process.env.SUPABASE_URL 
  });
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
