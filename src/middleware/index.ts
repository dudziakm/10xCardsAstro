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

export const onRequest = defineMiddleware(async ({ locals, request, cookies, url, redirect }, next) => {
  // Set the Supabase client in locals
  locals.supabase = supabaseAdminClient;

  try {
    // Try to get session from cookies first
    const accessToken = cookies.get("supabase-access-token")?.value;
    const refreshToken = cookies.get("supabase-refresh-token")?.value;

    if (accessToken && refreshToken) {
      // Try to set the auth session using tokens from cookies
      const { data, error } = await supabaseAdminClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (!error && data.session) {
        locals.session = data.session;
      } else {
        // Clear invalid tokens
        cookies.delete("supabase-access-token", { path: "/" });
        cookies.delete("supabase-refresh-token", { path: "/" });
        locals.session = null;
      }
    } else {
      // Fallback: Check authorization header
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];

        const { data, error } = await supabaseAdminClient.auth.setSession({
          access_token: token,
          refresh_token: "",
        });

        if (!error && data.session) {
          locals.session = data.session;
        } else {
          locals.session = null;
        }
      } else {
        locals.session = null;
      }
    }
  } catch {
    locals.session = null;
  }

  // Protected routes - require authentication
  const protectedRoutes = ["/flashcards", "/generate", "/learn"];
  const isProtectedRoute = protectedRoutes.some((route) => url.pathname.startsWith(route));

  if (isProtectedRoute && !locals.session) {
    return redirect("/auth/login");
  }

  return next();
});
