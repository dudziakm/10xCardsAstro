import type { SupabaseClient } from "@supabase/supabase-js";

// Define the type for context.locals
declare module "astro" {
  interface Locals {
    supabase: SupabaseClient;
    session: {
      user: {
        id: string;
      };
    } | null;
  }
}
