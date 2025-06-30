import { defineMiddleware } from "astro:middleware";
import { supabaseAdminClient } from "../db/supabase.client";
import { getLanguageFromRequest } from "../i18n/astro-helper";
import type { Language } from "../i18n";

// Session typing is defined in src/lib/types/locals.ts

export const onRequest = defineMiddleware(async ({ locals, request, cookies, url, redirect }, next) => {
  console.log('🚀 MIDDLEWARE START:', url.pathname);
  
  // Set the Supabase client in locals
  locals.supabase = supabaseAdminClient;

  // Set language in locals
  let language: Language = 'pl';
  const langCookie = cookies.get('my10xCards_language')?.value;
  if (langCookie === 'pl' || langCookie === 'en') {
    language = langCookie;
  } else {
    language = getLanguageFromRequest(request);
  }
  locals.language = language;

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

  console.log('✅ MIDDLEWARE END:', url.pathname, 'Session:', !!locals.session, 'Allowing access');

  // Protected routes - require authentication
  // REMOVED: We now allow guest access to all routes
  // Guest users will use localStorage for data storage

  return next();
});
