import { d as defineMiddleware, s as sequence } from './chunks/index_tCcpjOGc.mjs';
import { s as supabaseAdminClient } from './chunks/supabase.client_AiE9_edo.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_C49UBlo1.mjs';
import 'kleur/colors';
import './chunks/astro/server_BNVo9Nwc.mjs';
import 'clsx';
import 'cookie';

const onRequest$1 = defineMiddleware(async ({ locals, request, cookies, url, redirect }, next) => {
  locals.supabase = supabaseAdminClient;
  try {
    const accessToken = cookies.get("supabase-access-token")?.value;
    const refreshToken = cookies.get("supabase-refresh-token")?.value;
    if (accessToken && refreshToken) {
      const { data, error } = await supabaseAdminClient.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      if (!error && data.session) {
        locals.session = data.session;
      } else {
        cookies.delete("supabase-access-token", { path: "/" });
        cookies.delete("supabase-refresh-token", { path: "/" });
        locals.session = null;
      }
    } else {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const { data, error } = await supabaseAdminClient.auth.setSession({
          access_token: token,
          refresh_token: ""
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
  const protectedRoutes = ["/flashcards", "/generate", "/learn"];
  const isProtectedRoute = protectedRoutes.some((route) => url.pathname.startsWith(route));
  if (isProtectedRoute && !locals.session) {
    return redirect("/auth/login");
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
