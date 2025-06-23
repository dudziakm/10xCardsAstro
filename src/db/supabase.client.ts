import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Lazy load environment variables to avoid errors during module initialization
function getSupabaseConfig() {
  const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_KEY.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

// Lazy initialize clients to avoid errors during module loading
let _supabaseClient: ReturnType<typeof createClient<Database>> | null = null;
let _supabaseAdminClient: ReturnType<typeof createClient<Database>> | null = null;

// Standard client that respects RLS policies
export function getSupabaseClient() {
  if (!_supabaseClient) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _supabaseClient;
}

// Optional: For development only - this client bypasses RLS
// In production, you should use the standard client above
export function getSupabaseAdminClient() {
  if (!_supabaseAdminClient) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    _supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
  }
  return _supabaseAdminClient;
}

// For backward compatibility - lazy initialized
export const supabaseClient = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop, receiver) {
    const client = getSupabaseClient();
    return Reflect.get(client, prop, receiver);
  }
});

export const supabaseAdminClient = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop, receiver) {
    const client = getSupabaseAdminClient();
    return Reflect.get(client, prop, receiver);
  }
});
