import { d as defineMiddleware, s as sequence } from './chunks/index_tCcpjOGc.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_C49UBlo1.mjs';
import 'kleur/colors';
import './chunks/astro/server_BNVo9Nwc.mjs';
import 'clsx';
import 'cookie';

const onRequest$1 = defineMiddleware(async ({ locals, request, cookies, url, redirect }, next) => {
  console.log("Middleware bypassed for testing");
  locals.session = null;
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
