import type { APIRoute } from 'astro';
import { ZodError } from 'zod';
import { GenerationService } from '../../../lib/services/generation.service';
import { generateFlashcardsSchema } from '../../../lib/schemas/generation.schema';
import type { GenerateFlashcardsRequestDTO, GenerateFlashcardsResponseDTO } from '../../../types';

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, session } = locals;

  if (!session) {
    return new Response(
      JSON.stringify({ 
        error: 'Unauthorized', 
        message: 'You must be logged in to generate flashcards' 
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let requestData: GenerateFlashcardsRequestDTO;
    try {
      requestData = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'Invalid JSON body' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const validatedData = generateFlashcardsSchema.parse({
      prompt: requestData.prompt,
      count: requestData.count ?? 5
    });

    // Call Generation Service
    const generationService = new GenerationService(supabase);
    const { candidates, generationId } = await generationService.generateCandidates(
      session.user.id,
      validatedData.prompt,
      validatedData.count
    );

    // Prepare response
    const responseBody: GenerateFlashcardsResponseDTO = {
      candidates,
      generation_id: generationId,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request', 
          message: 'Invalid input data', 
          details: error.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log the detailed error server-side
    console.error("Error in POST /api/flashcards/generate:", error);

    // Generic error for the client
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        message: error.message || 'Failed to generate flashcards due to an internal error.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const prerender = false;