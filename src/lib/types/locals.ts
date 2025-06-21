import type { SupabaseClient, Session } from "@supabase/supabase-js";

// Define the type for context.locals
declare module "astro" {
  interface Locals {
    supabase: SupabaseClient;
    session: Session | null;
  }
}
