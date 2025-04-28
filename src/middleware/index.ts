import { defineMiddleware } from "astro:middleware";
import { supabaseAdminClient } from "../db/supabase.client";
import type { SupabaseClient } from "@supabase/supabase-js";

// Add session typing to locals
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

export const onRequest = defineMiddleware(async ({ locals, request }, next) => {
  // Set the Supabase admin client in locals (bypasses RLS for development)
  locals.supabase = supabaseAdminClient;

  try {
    // Get authorization header
    const authHeader = request.headers.get("Authorization");
    console.log("Auth header:", authHeader ? "present" : "not present");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      console.log("Token found:", token.substring(0, 20) + "...");

      // Try to set the auth session using the token
      const { data, error } = await supabaseAdminClient.auth.setSession({
        access_token: token,
        refresh_token: "",
      });

      if (error) {
        console.error("Error setting session:", error.message);
        // Continue without session
      } else if (data.session) {
        console.log("Session set successfully for user:", data.session.user.id);
        locals.session = data.session;
      }
    } else {
      // Get session from cookies if no auth header
      const { data } = await supabaseAdminClient.auth.getSession();
      console.log("Session from cookies:", data.session ? "found" : "not found");
      locals.session = data.session;
    }
  } catch (error) {
    console.error("Middleware error:", error);
  }

  // TEMPORARY: For testing only - create a mock session with a real user ID if no session found
  if (!locals.session) {
    console.log("Creating mock session for testing");
    locals.session = {
      user: {
        id: "4d4918b3-fcb8-4ece-93c9-3272e8cbacc0", // Use the actual user ID from your token
      },
    };
  }

  return next();
});
