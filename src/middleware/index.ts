import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../db/database.types";

// Session typing is defined in src/lib/types/locals.ts

export const onRequest = defineMiddleware(async ({ locals, request, cookies, url, redirect }, next) => {
  try {
    // Create Supabase client in runtime to avoid module-level initialization issues
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseKey, {
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
  } catch (error) {
    // If middleware fails completely, still allow the request but without auth
    locals.session = null;
    // eslint-disable-next-line no-console
    console.error("Middleware error:", error);
    return next();
  }
});
