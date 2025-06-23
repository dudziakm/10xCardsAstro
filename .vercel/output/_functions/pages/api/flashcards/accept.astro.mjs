import { a as acceptCandidatesSchema, G as GenerationService } from '../../../chunks/generation.schema_Cl5lguNF.mjs';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request, locals }) => {
  const { supabase, session } = locals;
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401
    });
  }
  try {
    const data = await request.json();
    const validatedData = acceptCandidatesSchema.parse(data);
    const generationService = new GenerationService(supabase);
    const result = await generationService.acceptCandidates(session.user.id, validatedData);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400
      });
    }
    return new Response(JSON.stringify({ error: "Wystąpił nieoczekiwany błąd" }), {
      status: 500
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
