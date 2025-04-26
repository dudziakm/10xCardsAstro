import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Standard client that respects RLS policies
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Optional: For development only - this client bypasses RLS
// In production, you should use the standard client above
// To use this client, import { supabaseAdminClient as supabase } instead of importing supabaseClient
export const supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  // Setting auth to skip means the client operates with admin privileges
  // This bypasses RLS policies entirely
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      // The service_role key would normally be used here, but for local development
      // setting this header makes Supabase think we're calling from a service
      "x-supabase-auth-bypass": "true",
    },
  },
});
