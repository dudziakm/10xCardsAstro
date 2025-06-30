import type { SupabaseClient, Session } from "@supabase/supabase-js";
import type { Language } from "../../i18n";

// Define the type for context.locals
declare module "astro" {
  interface Locals {
    supabase: SupabaseClient;
    session: Session | null;
    language: Language;
  }
}
