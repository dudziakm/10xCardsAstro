export { renderers } from '../../renderers.mjs';

const GET = async ({ locals }) => {
  return new Response(
    JSON.stringify({
      isAuthenticated: !!locals.session,
      userId: locals.session?.user?.id || null,
      sessionInfo: locals.session ? {
        hasUser: !!locals.session.user,
        userKeys: locals.session.user ? Object.keys(locals.session.user) : []
      } : null
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};
const prerender = false;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
