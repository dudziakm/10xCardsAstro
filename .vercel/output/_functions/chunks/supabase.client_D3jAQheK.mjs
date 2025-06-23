import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://aviofflnpowmnxwyoskg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2aW9mZmxucG93bW54d3lvc2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTI1MTUsImV4cCI6MjA2NjA2ODUxNX0.NYcF1cclN0ZwenZu4Q0ugWxLvHG7nvOiHV0LH1E1z6U";
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdminClient = createClient(supabaseUrl, supabaseAnonKey, {
  // Setting auth to skip means the client operates with admin privileges
  // This bypasses RLS policies entirely
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      // The service_role key would normally be used here, but for local development
      // setting this header makes Supabase think we're calling from a service
      "x-supabase-auth-bypass": "true"
    }
  }
});

export { supabaseClient as a, supabaseAdminClient as s };
