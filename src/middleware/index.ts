import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../db/database.types";

// Session typing is defined in src/lib/types/locals.ts

export const onRequest = defineMiddleware(async ({ locals, request, cookies, url, redirect }, next) => {
  // TEMPORARY: Skip middleware to test if this is the issue
  console.log("Middleware bypassed for testing");
  locals.session = null;
  return next();
});
