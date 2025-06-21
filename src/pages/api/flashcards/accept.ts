import type { APIRoute } from "astro";
import { GenerationService } from "../../../lib/services/generation.service";
import { acceptCandidatesSchema } from "../../../lib/schemas/generation.schema";

export const POST: APIRoute = async ({ request, locals }) => {
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
  } catch (error: unknown) {
    console.error("Error accepting candidates:", error);
    
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